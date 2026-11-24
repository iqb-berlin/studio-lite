/**
 * Verona modules and resource packages helper functions for Cypress E2E tests
 * Contains functions for managing Verona modules and resource packages
 */

import { clickIndexTabAdmin } from './navigation';
import { saveWorkspaceSettings } from './admin';

/**
 * Adds Verona modules through the admin interface
 * @param filenames - Array of module filenames to upload
 * @example
 * addModules(['iqb-editor-aspect-3.1.0.html', 'iqb-player-aspect-3.1.0.html']);
 */
export function addModules(filenames: string[]): void {
  // The admin button toggles: on an admin page it leads back home. Right after a first login the app
  // is still on its way to /admin, so the start page is set here rather than assumed (#1746).
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('v-modules');

  cy.intercept('POST', '**/api/verona-modules*').as('uploadModule');

  filenames.forEach(filename => {
    cy.loadModule(filename);
    cy.wait('@uploadModule');
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
  cy.get('[data-cy="delete-modules-button"]').click();
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.clickButtonWithResponseCheck(json.delete, [200], '/api/verona-modules*', 'DELETE', 'deleteModule');
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
  // the package name the file name suggests (#1358)
  cy.get('[data-cy="resource-package-dialog-confirm"]').click();
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
  cy.get('[data-cy="admin-packages-select-GeoGebra"]').click();
  cy.get('[data-cy="admin-packages-delete-selected"]').click();
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

  // The select itself, not the element around it: it is rendered only once the module list has
  // arrived. A click on the still empty element opened nothing, and the options were then waited
  // for in vain (module-switch.cy.ts failed that way in the pipeline of #1872).
  const selectModule = (moduleType: 'editor' | 'player' | 'schemer', module: string): void => {
    cy.get(`[data-cy="edit-workspace-settings-${moduleType}"] mat-select`).click();
    cy.get('mat-option>span').contains(module).click();
  };
  selectModule('editor', editor);
  selectModule('player', player);
  selectModule('schemer', schemer);

  // Save and wait for the answer: a reload right after the click would cancel the request (#1743)
  saveWorkspaceSettings();

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
