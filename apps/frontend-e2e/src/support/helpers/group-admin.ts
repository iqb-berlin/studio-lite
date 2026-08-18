import { clickIndexTabWsgAdmin } from './navigation';
import { AccessLevel } from '../testData';
import { clickSaveButtonRight } from './common';
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
    cy.contains('[data-cy="access-rights"]', ` (${user})`)
      .closest('[data-cy="access-rights-row"]')
      .find(`[data-cy="access-rights-checkbox-${rights[index]}"]`)
      .click();
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
    cy.contains('[data-cy="access-rights"]', ws)
      .closest('[data-cy="access-rights-row"]')
      .find(`[data-cy="access-rights-checkbox-${rights[index]}"]`)
      .click();
  });
  clickSaveButtonRight();
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
