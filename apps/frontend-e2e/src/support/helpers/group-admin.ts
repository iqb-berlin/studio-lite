import { clickIndexTabWsgAdmin } from './navigation';
import { AccessLevel } from '../testData';

// ---------------------------------------------------------------------------
// Access-rights panel
// ---------------------------------------------------------------------------

/**
 * Clicks the save button above the access-rights list, in both the Workspaces
 * and the Users panel of wsg-admin. Fails if the button is disabled, so a
 * selection that never reached the model cannot pass as a saved one.
 * @example
 * clickAccessRightsSaveButton();
 */
export function clickAccessRightsSaveButton(): void {
  cy.get('[data-cy="wsg-admin-access-rights-save-button"]')
    .should('not.be.disabled')
    .click();
}

// ---------------------------------------------------------------------------
// Low-level radio-button selectors
// ---------------------------------------------------------------------------

/**
 * Returns the `[data-cy="access-rights-row"]` for a given display label.
 * Works for both the Workspaces panel (username in parens) and the Users panel (ws name).
 * @param label - Partial text of the `[data-cy="access-rights"]` cell
 */
export function getAccessRightsRow(label: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.contains('[data-cy="access-rights"]', label)
    .closest('[data-cy="access-rights-row"]');
}

/**
 * Returns the `mat-radio-button` for a specific access level within a row.
 * @param label - Row label (workspace name or username)
 * @param level - AccessLevel (1 = Basic, 2 = Developer, 4 = Admin)
 */
export function getRoleRadio(label: string, level: AccessLevel): Cypress.Chainable<JQuery<HTMLElement>> {
  return getAccessRightsRow(label)
    .find(`[data-cy="access-rights-radio-button-${level}"]`);
}

/**
 * Asserts whether a radio button for a given label + level is checked or unchecked.
 * Asserts state on the internal native `input[type="radio"]`.
 * @param label - Row label
 * @param level - AccessLevel
 * @param shouldBeChecked - true to assert checked, false to assert unchecked
 */
export function assertRoleRadioChecked(label: string, level: AccessLevel, shouldBeChecked: boolean): void {
  getRoleRadio(label, level)
    .find('input[type="radio"]')
    .should(shouldBeChecked ? 'be.checked' : 'not.be.checked');
}

// ---------------------------------------------------------------------------
// Workspaces panel (right panel when a workspace row is selected)
// ---------------------------------------------------------------------------

/**
 * Selects a role level for a user in the Workspaces → right-panel users list.
 * The workspace row must already be selected before calling this.
 * @param username - The username shown in parentheses, e.g. "normaluser"
 * @param level - AccessLevel to select
 */
export function selectRoleAtWs(username: string, level: AccessLevel): void {
  getRoleRadio(`(${username})`, level).click();
}

/**
 * Deselects the currently active role for a user in the Workspaces panel
 * by clicking the already-checked radio button (toggle off).
 * @param username - The username shown in parentheses
 * @param level - The currently active AccessLevel to deselect
 */
export function deselectRoleAtWs(username: string, level: AccessLevel): void {
  getRoleRadio(`(${username})`, level).click();
}

// ---------------------------------------------------------------------------
// Users panel (right panel when a user row is selected)
// ---------------------------------------------------------------------------

/**
 * Selects a role level for a workspace in the Users → right-panel workspace list.
 * The user row must already be selected before calling this.
 * @param wsName - The workspace name
 * @param level - AccessLevel to select
 */
export function selectRoleAtUser(wsName: string, level: AccessLevel): void {
  getRoleRadio(wsName, level).click();
}

/**
 * Deselects the currently active role for a workspace in the Users panel
 * by clicking the already-checked radio button (toggle off).
 * @param wsName - The workspace name
 * @param level - The currently active AccessLevel to deselect
 */
export function deselectRoleAtUser(wsName: string, level: AccessLevel): void {
  getRoleRadio(wsName, level).click();
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
  cy.get('[data-cy="wsg-admin-routes-workspaces"]').should('be.visible');
  clickIndexTabWsgAdmin('workspaces');
  cy.get('mat-icon')
    .contains('add')
    .click();
  cy.translate(Cypress.expose('locale')).then(json => {
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
    selectRoleAtWs(user, rights[index]);
  });
  clickAccessRightsSaveButton();
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
    selectRoleAtUser(ws, rights[index]);
  });
  clickAccessRightsSaveButton();
}

/**
 * Configures one workspace as a drop-box for another within a group
 * @param sourceWs - Name of the workspace to configure
 * @param targetWs - Name of the workspace to set as drop-box
 * @example
 * configureDropBox('Workspace 1', 'Workspace 2');
 */
export function configureDropBox(sourceWs: string, targetWs: string): void {
  clickIndexTabWsgAdmin('workspaces');
  cy.contains('mat-row', sourceWs).click();
  // Click the select-drop-box button (folder_special icon)
  cy.get('button[mat-button], button[mat-mdc-button]')
    .find('mat-icon')
    .contains('folder_special')
    .click();
  cy.get('mat-mdc-dialog-container, mat-dialog-container').should('be.visible');
  cy.get('mat-select').click();
  cy.get('mat-mdc-option, mat-option').contains(targetWs).click();
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.get('mat-mdc-dialog-container, mat-dialog-container')
      .find('button')
      .contains(json.save)
      .click();
  });
  // Verify check_circle icon appears in the row
  cy.contains('mat-row', sourceWs)
    .find('mat-icon')
    .contains('check_circle')
    .should('exist');
}

/**
 * Adds a new state in workspace group settings
 * @param stateName - The label for the new state
 */
export function addState(stateName: string): void {
  cy.get('[data-cy="wsg-admin-states-add-state-button"]').click();
  cy.get('studio-lite-states .state')
    .last()
    .within(() => {
      cy.get('.text-form-field input').clear().type(stateName);
    });
  cy.intercept('PATCH', '/api/workspace-groups/*').as('saveState');
  cy.get('[data-cy="wsg-admin-settings-save-button"]').click();
  cy.wait('@saveState').its('response.statusCode').should('eq', 200);
}

/**
 * Deletes a state in workspace group settings
 * @param stateName - The label of the state to delete
 */
export function deleteState(stateName: string): void {
  cy.get('studio-lite-states .state').then($states => {
    const stateEl = Array.from($states).find(el => {
      const input = el.querySelector(
        '.text-form-field input'
      ) as HTMLInputElement;
      return input && input.value === stateName;
    });
    if (stateEl) {
      cy.wrap(stateEl).find('button.delete-button').click();
    } else {
      throw new Error(`State with name ${stateName} not found`);
    }
  });

  cy.get('studio-lite-delete-state').should('exist');
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.intercept('PATCH', '/api/workspace-groups/*').as(
      'deleteStateRequest'
    );
    cy.clickDialogButton(json.delete);
    cy.wait('@deleteStateRequest').its('response.statusCode').should('eq', 200);
  });
  cy.get('studio-lite-delete-state').should('not.exist');
}
