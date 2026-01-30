/**
 * Verona modules and resource packages helper functions for Cypress E2E tests
 * Contains functions for managing Verona modules and resource packages
 */

import { clickIndexTabAdmin } from './navigation';

/**
 * Adds Verona modules through the admin interface
 * @param filenames - Array of module filenames to upload
 * @example
 * addModules(['iqb-editor-aspect-2.12.1.html', 'iqb-player-aspect-2.12.1.html']);
 */
export function addModules(filenames: string[]): void {
  cy.findAdminSettings().click();
  clickIndexTabAdmin('v-modules');
  filenames.forEach(filename => {
    cy.loadModule(filename);
  });
}

/**
 * Deletes Verona modules (IQB-Schemer, IQB-Player, IQB-Editor)
 * @example
 * deleteModule();
 */
export function deleteModule(): void {
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('v-modules');
  cy.selectModule('IQB-Schemer');
  cy.selectModule('IQB-Player');
  cy.selectModule('IQB-Editor');
  cy.get('div > mat-icon').contains('delete').click();
  cy.translate(Cypress.env('locale')).then(json => {
    cy.clickButtonWithResponseCheck(json.delete, [200], '/api/verona-modules', 'GET', 'deleteModule');
  });
}

/**
 * Adds a resource package through the admin interface
 * @param resource - Resource package filename
 * @example
 * addResourcePackage('GeoGebra.itcr.zip');
 */
export function addResourcePackage(resource: string): void {
  const path: string = `../frontend-e2e/src/fixtures/${resource}`;
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('packages');
  const name = resource.replace(/.itcr.zip/, '');
  cy.get('input[type=file]')
    .selectFile(path, {
      action: 'select',
      force: true
    });
  cy.contains('mat-row', name)
    .should('exist');
}

/**
 * Deletes a resource package (specifically GeoGebra)
 * @example
 * deleteResource();
 */
export function deleteResource(): void {
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('packages');
  cy.get('mat-cell:contains("GeoGebra")')
    .parent()
    .prev()
    .click();
  cy.get('mat-checkbox').eq(1).click(); // clicks the checkbox
  cy.get('div > mat-icon')
    .contains('delete')
    .click();
  cy.translate(Cypress.env('locale')).then(json => {
    cy.clickButtonWithResponseCheck(json.delete, [200], '/api/resource-packages', 'GET', 'deleteResource');
  });
}

/**
 * Sets Verona modules (editor, player, schemer) for a workspace
 * @param ws - Workspace name
 * @example
 * setVeronaWs('My Workspace');
 */
export function setVeronaWs(ws: string): void {
  cy.visit('/');
  cy.visitWs(ws);
  cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
  cy.get('[data-cy="workspace-edit-unit-settings"]').click();
  cy.get('[data-cy="edit-workspace-settings-editor"]').click();
  cy.get('mat-option>span').contains('Aspect').click();
  cy.get('[data-cy="edit-workspace-settings-player"]').click();
  cy.get('mat-option>span').contains('Aspect').click();
  cy.get('[data-cy="edit-workspace-settings-schemer"]').click();
  cy.get('mat-option>span').contains('Schemer').click();
  cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();
}
