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
export function deleteAllModules(): void {
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('v-modules');
  cy.selectModule('IQB-Schemer');
  cy.selectModule('IQB-Player');
  cy.selectModule('IQB-Editor');
  cy.get('div > mat-icon').contains('delete').click();
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.clickButtonWithResponseCheck(json.delete, [200], '/api/admin/verona-modules*', 'DELETE', 'deleteModule');
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
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.clickButtonWithResponseCheck(json.delete, [200], '/api/resource-packages', 'GET', 'deleteResource');
  });
}

/**
 * Verifies that Verona modules are correctly configured for a workspace
 * @param ws - Workspace name
 * @param expectedEditor - Expected editor module name
 * @param expectedPlayer - Expected player module name
 * @param expectedSchemer - Expected schemer module name
 * @example
 * verifyModuleConfiguration('My Workspace', 'Aspect', 'Aspect', 'Schemer');
 */
export function verifyModuleConfiguration(
  ws: string,
  expectedEditor: string,
  expectedPlayer: string,
  expectedSchemer: string
): void {
  cy.visit('/');
  cy.visitWs(ws);
  cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
  cy.get('[data-cy="workspace-edit-unit-settings"]').click();

  // Verify editor selection
  cy.get('[data-cy="edit-workspace-settings-editor"]')
    .find('mat-select .mat-mdc-select-value-text')
    .should('contain', expectedEditor);
  // Verify player selection
  cy.get('[data-cy="edit-workspace-settings-player"]')
    .find('mat-select .mat-mdc-select-value-text')
    .should('contain', expectedPlayer);
  // Verify schemer selection
  cy.get('[data-cy="edit-workspace-settings-schemer"]')
    .find('mat-select .mat-mdc-select-value-text')
    .should('contain', expectedSchemer);

  // Close dialog
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.clickDialogButton(json.cancel || json.close);
  });
}

/**
 * Sets Verona modules for a workspace with API verification
 * @param ws - Workspace name
 * @param editor - Editor module name
 * @param player - Player module name
 * @param schemer - Schemer module name
 * @example
 * setModule('My Workspace', 'Aspect', 'Aspect', 'Schemer');
 */
export function setModuleWithoutVerification(
  ws: string,
  editor: string,
  player: string,
  schemer: string
): void {
  cy.visitWs(ws);
  cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
  cy.get('[data-cy="workspace-edit-unit-settings"]').click();

  // Set editor
  cy.get('[data-cy="edit-workspace-settings-editor"]').click();
  cy.get('mat-option>span').contains(editor).click();

  // Set player
  cy.get('[data-cy="edit-workspace-settings-player"]').click();
  cy.get('mat-option>span').contains(player).click();

  // Set schemer
  cy.get('[data-cy="edit-workspace-settings-schemer"]').click();
  cy.get('mat-option>span').contains(schemer).click();

  // Save with API
  cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();

  // Verify configuration persisted
  // verifyModuleConfiguration(ws, editor, player, schemer);
}

/**
 * Gets list of available modules of a specific type
 * @param ws - Workspace name
 * @param moduleType - Type of module ('editor', 'player', or 'schemer')
 * @returns Chainable with array of module names
 * @example
 * getAvailableModules('My Workspace', 'editor').then(modules => {
 *   expect(modules).to.include('Aspect');
 * });
 */
export function getAvailableModules(
  ws: string,
  moduleType: 'editor' | 'player' | 'schemer'
): Cypress.Chainable<string[]> {
  cy.visitWs(ws);
  cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
  cy.get('[data-cy="workspace-edit-unit-settings"]').click();

  const selector = `[data-cy="edit-workspace-settings-${moduleType}"]`;
  cy.get(selector).click();

  return cy.get('mat-option>span').then($options => {
    const modules: string[] = [];
    $options.each((_, el) => {
      const text = el.textContent?.trim();
      if (text) {
        modules.push(text);
      }
    });
    // Close the dropdown
    cy.get('.cdk-overlay-backdrop').click({ force: true });
    return modules;
  });
}
