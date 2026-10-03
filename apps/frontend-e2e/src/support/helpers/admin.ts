/**
 * Admin management helper functions for Cypress E2E tests
 * Contains functions for managing users, groups, and workspaces
 */

import { UserData } from '../testData';
import { clickIndexTabAdmin, clickIndexTabWsgAdmin } from './navigation';
import { editInput, waitForSuccess } from './common';

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
 * Deletes the first admin user and leaves the browser logged out, on the login form. There is no
 * logout request: the session goes with the deleted user.
 * @example
 * deleteFirstUser();
 */
export function deleteFirstUser(): void {
  deleteUser(Cypress.expose('username'));
  // The deleted admin would otherwise stay in the browser: its tokens in localStorage and its auth
  // data in the running app. Clearing the storage alone is not enough, and visiting '/' from
  // '/#/admin/...' only changes the hash, so the app is reloaded to start from nothing (#1754).
  cy.clearLocalStorage();
  cy.reload();
  cy.get('[data-cy="home-user-name"]').should('be.visible');
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

let deleteUserCalls = 0;

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
  cy.contains('mat-row', user)
    .find('[data-cy="admin-users-delete-user"]').click();
  cy.translate(Cypress.expose('locale')).then(json => {
    // An alias of its own per call: Cypress counts the requests of every intercept sharing an
    // alias together, so a third deleteUser() in one hook resolved with the second one's request
    // before its own DELETE was sent (#1754)
    deleteUserCalls += 1;
    const alias = `deleteUserReq${deleteUserCalls}`;
    cy.intercept('DELETE', '/api/admin/users*').as(alias);
    cy.clickButton(json.delete);
    waitForSuccess(`@${alias}`);
  });
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
  cy.contains('mat-row', group)
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
  cy.get('[data-cy="admin-workspace-groups-save-button"]')
    .should('not.be.disabled')
    .click();
}

// ---------------------------------------------------------------------------
/**
 * Navigates to the admin Settings tab.
 * Waits for the initial missings-profiles GET request to complete, ensuring
 * form fields are populated before tests interact with them (#1619).
 */
export function goToSettings(): void {
  cy.intercept('GET', '/api/admin/settings/missings-profiles').as('getMissingsProfiles');
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('settings');
  cy.wait('@getMissingsProfiles');
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
  waitForSuccess(`@${alias}`);
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
  cy.get('[data-cy="wsg-admin-workspace-menu-settings"]').click({ force: true });
}

/**
 * Sets a route's visibility checkbox inside the workspace-settings dialog to the given state.
 * check/uncheck leave a checkbox alone that is already in that state, so the result does not
 * depend on what earlier tests saved -- a new workspace starts with 'notes' hidden (#1743).
 * @param routeName - one of 'editor' | 'preview' | 'schemer' | 'comments' | 'notes'
 * @param setVisible - true to check (show), false to uncheck (hide)
 */
export function setRouteVisibility(routeName: string, setVisible: boolean): void {
  cy.translate(Cypress.expose('locale')).then(json => {
    const routeLabel: string = json.workspace.routes[routeName];
    cy.contains('studio-lite-edit-workspace-settings mat-checkbox', routeLabel)
      .find('input[type="checkbox"]')
      .as('checkbox');
    if (setVisible) {
      cy.get('@checkbox').check({ force: true });
    } else {
      cy.get('@checkbox').uncheck({ force: true });
    }
  });
}

/** Save the workspace-settings dialog and wait for the API response. */
export function saveWorkspaceSettings(): void {
  cy.intercept('PATCH', '/api/workspaces/*/settings').as('saveWsSettings');
  cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();
  waitForSuccess('@saveWsSettings');
}
