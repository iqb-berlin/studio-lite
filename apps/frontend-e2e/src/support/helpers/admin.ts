/**
 * Admin management helper functions for Cypress E2E tests
 * Contains functions for managing users, groups, and workspaces
 */

import { AccessLevel, UserData } from '../testData';
import { clickIndexTabAdmin, clickIndexTabWsgAdmin } from './navigation';
import { clickSaveButtonRight, editInput } from './common';
import { logout } from './user';

/**
 * Helper function to select a user checkbox
 * @param checkName - Username to select
 */
function selectCheckboxUser(checkName: string): void {
  cy.get(`[data-cy="admin-users-checkbox-user-box-${checkName}"]`).click();
}

/**
 * Adds the first admin user and logs in
 * @example
 * addFirstUser();
 */
export function addFirstUser(): void {
  cy.visit('/');
  cy.login(Cypress.env('username'), Cypress.env('password'));
  cy.translate(Cypress.env('locale')).then(json => {
    cy.clickButtonWithResponseCheck(json.home.login, [201], '/api/init-login', 'POST', 'responseLogin');
  });
  cy.findAdminSettings().should('exist');
}

/**
 * Deletes the first admin user and logs out
 * @example
 * deleteFirstUser();
 */
export function deleteFirstUser(): void {
  cy.visit('/');
  deleteUser(Cypress.env('username'));
  cy.visit('/');
  logout();
}

/**
 * Creates a new user through the admin interface
 * @param newUser - User data including username, password, email, etc.
 * @example
 * createNewUser({
 *   username: 'testuser',
 *   password: '1234',
 *   email: 'test@example.com'
 * });
 */
export function createNewUser(newUser: UserData): void {
  clickIndexTabAdmin('users');
  cy.get('[data-cy="admin-users-menu-add-user"]').click();
  editInput('admin-edit-user-username', newUser.username);
  editInput('admin-edit-user-lastname', newUser.lastName);
  editInput('admin-edit-user-firstname', newUser.firstName);
  editInput('admin-edit-user-email', newUser.email);
  editInput('admin-edit-user-password', newUser.password);
  cy.clickDataCyWithResponseCheck('[data-cy="admin-edit-user-button"]', [201], '/api/admin/users', 'POST', 'addUser');
}

/**
 * Deletes a user by username
 * @param user - Username to delete
 * @example
 * deleteUser('testuser');
 */
export function deleteUser(user: string): void {
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('users');
  selectCheckboxUser(user);
  cy.get('[data-cy="admin-users-menu-delete-users"]').click();
  cy.translate(Cypress.env('locale')).then(json => {
    cy.clickButtonWithResponseCheck(json.delete, [200], '/api/admin/users*', 'DELETE', 'deleteUser');
  });
}

/**
 * Deletes multiple users at once
 * @param users - Array of usernames to delete
 * @example
 * deleteUsers(['user1', 'user2']);
 */
export function deleteUsers(users: string[]): void {
  clickIndexTabAdmin('users');
  users.forEach(user => {
    selectCheckboxUser(user);
  });
  cy.get('[data-cy="admin-users-menu-delete-users"]').click();
  cy.translate(Cypress.env('locale')).then(json => {
    cy.clickButtonWithResponseCheck(json.delete, [200], '/api/admin/users*', 'DELETE', 'deleteUser');
  });
}

/**
 * Creates a workspace group
 * @param group - Group name
 * @example
 * createGroup('Mathematics');
 */
export function createGroup(group: string): void {
  clickIndexTabAdmin('workspace-groups');
  cy.get('mat-icon').contains('add').click();
  cy.translate(Cypress.env('locale')).then(json => {
    cy.get(`input[placeholder="${json.admin['group-name']}"]`).type(group);
    cy.clickButtonWithResponseCheck(json.create, [201], '/api/admin/workspace-groups', 'POST', 'createWsGroup');
  });
}

/**
 * Deletes a workspace group
 * @param group - Group name to delete
 * @example
 * deleteGroup('Mathematics');
 */
export function deleteGroup(group: string): void {
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('workspace-groups');
  cy.get('mat-table')
    .contains(group)
    .click();
  cy.get('mat-icon')
    .contains('delete')
    .click();
  cy.translate(Cypress.env('locale')).then(json => {
    cy.clickButtonWithResponseCheck(json.delete, [200], '/api/admin/workspace-groups*', 'DELETE', 'deleteGroup');
  });
}

/**
 * Creates a workspace within a group
 * @param ws - Workspace name
 * @param group - Group name
 * @example
 * createWs('Workspace 1', 'Mathematics');
 */
export function createWs(ws: string, group: string): void {
  cy.visit('/');
  cy.findAdminGroupSettings(group).click();
  cy.wait(200);
  clickIndexTabWsgAdmin('workspaces');
  cy.get('mat-icon')
    .contains('add')
    .click();
  cy.translate(Cypress.env('locale')).then(json => {
    cy.get(`input[placeholder="${json['wsg-admin']['enter-name']}"]`).type(ws);
    cy.clickButtonWithResponseCheck(json.create, [201], '/api/group-admin/workspaces*', 'POST', 'createWs');
  });
}

/**
 * Grants or removes privileges for users in a workspace
 * @param users - Array of usernames
 * @param ws - Workspace name
 * @param rights - Array of access levels corresponding to each user
 * @example
 * grantRemovePrivilegeAtWs(['user1', 'user2'], 'Workspace 1', [AccessLevel.Basic, AccessLevel.Admin]);
 */
export function grantRemovePrivilegeAtWs(users: string[], ws: string, rights: AccessLevel[]): void {
  cy.get('mat-table')
    .contains(`${ws}`)
    .click();
  users.forEach((user, index) => {
    switch (rights[index]) {
      case AccessLevel.Basic: {
        cy.get(`[data-cy="access-rights"]:contains( (${user}))`)
          .prev()
          .within(() => {
            cy.get('mat-checkbox').eq(0).click();
          });
        break;
      }
      case AccessLevel.Developer: {
        cy.get(`[data-cy="access-rights"]:contains( (${user}))`)
          .prev()
          .within(() => {
            cy.get('mat-checkbox').eq(1).click();
          });
        break;
      }
      default: {
        cy.get(`[data-cy="access-rights"]:contains( (${user}))`)
          .prev()
          .within(() => {
            cy.get('mat-checkbox').eq(2).click();
          });
        break;
      }
    }
  });
  clickSaveButtonRight();
}

/**
 * Grants or removes privileges for a user across multiple workspaces
 * @param user - Username
 * @param wss - Array of workspace names
 * @param rights - Array of access levels corresponding to each workspace
 * @example
 * grantRemovePrivilegeAtUser('user1', ['Workspace 1', 'Workspace 2'], [AccessLevel.Basic, AccessLevel.Developer]);
 */
export function grantRemovePrivilegeAtUser(user: string, wss: string[], rights: AccessLevel[]): void {
  cy.get('mat-table')
    .contains(`${user}`)
    .should('exist')
    .click();
  wss.forEach((ws, index) => {
    switch (rights[index]) {
      case AccessLevel.Basic: {
        cy.get(`div>div>div>div>div:contains(${ws})`)
          .prev()
          .within(() => {
            cy.get('mat-checkbox').eq(0).click();
          });
        break;
      }
      case AccessLevel.Developer: {
        cy.get(`div>div>div>div>div:contains(${ws})`)
          .prev()
          .within(() => {
            cy.get('mat-checkbox').eq(1).click();
          });
        break;
      }
      default: {
        cy.get(`div>div>div>div>div:contains(${ws})`)
          .prev()
          .within(() => {
            cy.get('mat-checkbox').eq(2).click();
          });
        break;
      }
    }
  });
  clickSaveButtonRight();
}

/**
 * Makes users admins of a workspace group
 * @param group - Group name
 * @param admins - Array of usernames to make admins
 * @example
 * makeAdminOfGroup('Mathematics', ['user1', 'user2']);
 */
export function makeAdminOfGroup(group: string, admins: string[]): void {
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('workspace-groups');
  cy.get(`mat-row:contains("${group}")`)
    .click();
  admins.forEach(user => {
    cy.get(`mat-checkbox:contains((${user}))`)
      .find('label')
      .click();
  });
  clickSaveButtonRight();
}
