/**
 * Admin management helper functions for Cypress E2E tests
 * Contains functions for managing users, groups, and workspaces
 */

import { UserData } from '../testData';
import { clickIndexTabAdmin, clickIndexTabWsgAdmin } from './navigation';
import { clickSaveButtonRight, editInput } from './common';

/**
 * Adds the first admin user and logs in
 * @example
 * addFirstUser();
 */
export function addFirstUser(): void {
  cy.visit('/');
  cy.login(Cypress.expose('username'), Cypress.expose('password'));
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.clickButtonWithResponseCheck(
      json.home.login,
      [201],
      '/api/init-login',
      'POST',
      'responseLogin'
    );
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
  deleteUser(Cypress.expose('username'));
}

/**
 * @param newUser - User data including username, password, email, etc.
 * @example
 * createNewUser({
 *   username: 'testuser',
 *   password: '1234',
 *   email: 'test@example.com'
 * });
 */
export function createNewUser(newUser: UserData): void {
  cy.visit('/');
  cy.findAdminSettings().click();
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
  cy.contains('mat-cell', user)
    .parent()
    .find('[data-cy="admin-users-delete-user"]').click();
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.clickButton(json.delete);
    // cy.clickDialogButtonWithResponseCheck(
    //   json.delete,
    //   [200],
    //   '/api/admin/users*',
    //   'DELETE',
    //   'deleteUser'
    // );
  });
  cy.wait(100);
}

/**
 * Creates a workspace group
 * @param group - Group name
 * @example
 * createGroup('Mathematics');
 */
export function createGroup(group: string): void {
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('workspace-groups');
  cy.get('mat-icon').contains('add').click();
  cy.translate(Cypress.expose('locale')).then(json => {
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
  cy.contains('mat-cell', group)
    .parent()
    .find('[data-cy="admin-workspace-groups-delete-group"]')
    .click();
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.clickDialogButtonWithResponseCheck(
      json.delete,
      [200],
      '/api/admin/workspace-groups*',
      'DELETE',
      'deleteGroup'
    );
  });
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

// ---------------------------------------------------------------------------
// Helper: navigate to the admin Settings tab
// ---------------------------------------------------------------------------
export function goToSettings(): void {
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('settings');
}

// ---------------------------------------------------------------------------
// Helper: clear + retype a form-control input / textarea
// ---------------------------------------------------------------------------
export function setFormControl(formControlName: string, value: string): void {
  cy.get(`[formcontrolname="${formControlName}"]`)
    .should('exist')
    .clear({ force: true })
    .type(value, { force: true });
}

export function clearFormControl(formControlName: string): void {
  cy.get(`[formcontrolname="${formControlName}"]`)
    .should('exist')
    .clear({ force: true });
}

// ---------------------------------------------------------------------------
// Helper: click the Save button and wait for an API response
// ---------------------------------------------------------------------------
export function saveAndExpect(
  method: string,
  urlPattern: string,
  alias: string,
  cardNum: number
): void {
  cy.intercept(method, urlPattern).as(alias);
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.get(`button:contains(${json.save})`).eq(cardNum).click({ force: true });
  });
  cy.wait(`@${alias}`).its('response.statusCode').should('eq', 200);
}

// ---------------------------------------------------------------------------
// Helpers edit-workspace-settings
// ---------------------------------------------------------------------------

/**
 * Navigate to the wsg-admin workspaces tab, select a workspace row and open
 * the workspace-settings dialog via the gear icon in the toolbar.
 */
export function openWorkspaceSettingsDialog(group: string, ws:string): void {
  cy.visit('/');
  cy.findAdminGroupSettings(group).click();
  clickIndexTabWsgAdmin('workspaces');
  cy.contains('mat-cell', ws).click();
  // The gear button has no data-cy; click by its mat-icon label
  cy.get('studio-lite-workspace-menu')
    .find('mat-icon')
    .contains('settings')
    .click({ force: true });
}

/**
 * Toggle a route's visibility checkbox inside the workspace-settings dialog.
 * @param routeName - one of 'editor' | 'preview' | 'schemer' | 'comments'
 * @param setVisible - true to check (show), false to uncheck (hide)
 */
export function setRouteVisibility(routeName: string, setVisible: boolean): void {
  cy.translate(Cypress.expose('locale')).then(json => {
    const routeLabel: string = json.workspace.routes[routeName];
    cy.get('mat-checkbox')
      .contains(routeLabel)
      .parent()
      .as('checkbox');

    cy.get('@checkbox').then($checkbox => {
      const isChecked = $checkbox.hasClass('mat-mdc-checkbox-checked');
      if (setVisible && !isChecked) {
        cy.log('Primero');
        cy.get('@checkbox').click();
      }
      if (!setVisible) {
        cy.log('segundo');
        cy.get('@checkbox').click();
      }
    });
  });
}

/** Save the workspace-settings dialog and wait for the API response. */
export function saveWorkspaceSettings(): void {
  cy.intercept('PATCH', '/api/workspaces/*/settings').as('saveWsSettings');
  cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();
  cy.wait('@saveWsSettings').its('response.statusCode').should('eq', 200);
}
