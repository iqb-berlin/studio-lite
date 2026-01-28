/**
 * Workspace and unit management helper functions for Cypress E2E tests
 * Contains functions for creating, deleting, and managing units
 */

import { UnitData } from '../testData';
import { goToWsMenu } from './navigation';

/**
 * Selects a unit by name
 * @param unitName - Unit name to select
 * @example
 * selectUnit('Unit 1');
 */
export function selectUnit(unitName: string): void {
  cy.contains(unitName).should('exist').click({ force: true });
}

/**
 * Deletes a unit by shortname
 * @param shortname - Unit shortname
 * @example
 * deleteUnit('M6_AK0011');
 */
export function deleteUnit(shortname: string): void {
  cy.get('[data-cy="workspace-delete-unit-button"]').click();
  cy.get('[data-cy="workspace-select-unit-list-filter-units"]')
    .should('exist')
    .click()
    .type(shortname);
  cy.get(`mat-cell:contains("${shortname}")`).prev().click();
  cy.get('[data-cy="workspace-select-unit-button"]').click();
  cy.translate(Cypress.env('locale')).then(json => {
    cy.contains('button', json.delete).click();
  });
}

/**
 * Adds a simple unit with just a key
 * @param kurzname - Unit key/shortname
 * @example
 * addUnit('M1_001');
 */
export function addUnit(kurzname: string): void {
  cy.get('[data-cy="workspace-add-units"]').click();
  cy.get('[data-cy="workspace-add-unit-new-empty-unit"]').click();
  cy.get('[data-cy="workspace-new-unit-unit-key"]').type(kurzname);
  cy.clickDataCyWithResponseCheck(
    '[data-cy="workspace-new-unit-submit-button"]',
    [201],
    '/api/workspaces/*/units',
    'POST',
    'addUnit'
  );
}

/**
 * Adds a unit with full details (key, name, group)
 * @param unit - Unit data object
 * @example
 * addUnitPred({
 *   shortname: 'M1_001',
 *   name: 'Math Unit 1',
 *   group: 'Group A'
 * });
 */
export function addUnitPred(unit: UnitData): void {
  cy.get('[data-cy="workspace-add-units"]').click();
  cy.get('[data-cy="workspace-add-unit-new-empty-unit"]').click();
  cy.get('[data-cy="workspace-new-unit-unit-key"]').type(unit.shortname);
  cy.get('[data-cy="workspace-new-unit-unit-name"]').type(unit.name);
  cy.get('body').then($body => {
    if ($body.find('[data-cy="workspace-new-unit-new-group"]').length > 0) {
      cy.get('[data-cy="workspace-new-unit-new-group"]')
        .clear()
        .type(unit.group);
    } else {
      cy.get('mat-dialog-content').find('svg').click();
      cy.get('body').then($body1 => {
        if ($body1.find(`mat-option:contains("${unit.group}")`).length > 0) {
          cy.get(`mat-option:contains("${unit.group}")`).click();
        } else {
          cy.get('.cdk-overlay-transparent-backdrop').click();
          cy.get('[data-cy="workspace-new-unit-add-new-group"]').click();
          cy.get('[data-cy="workspace-new-unit-new-group"]')
            .clear()
            .type(unit.group);
        }
      });
    }
  });
  cy.clickDataCyWithResponseCheck('[data-cy="workspace-new-unit-submit-button"]',
    [201],
    '/api/workspaces/*/units',
    'POST',
    'addUnit');
}

/**
 * Creates a unit from an existing unit
 * @param ws - Source workspace (format: "Group: Workspace")
 * @param unit1 - Source unit to copy from
 * @param newUnit - New unit data
 * @example
 * addUnitFromExisting('Math: Workspace 1', sourceUnit, newUnit);
 */
export function addUnitFromExisting(ws: string, unit1: UnitData, newUnit: UnitData): void {
  cy.get('[data-cy="workspace-add-units"]').click();
  cy.get('[data-cy="workspace-add-unit-from-existing"]').click();
  cy.get('mat-select').click();
  cy.get(`mat-option:contains("${ws}")`).click();
  cy.get(`mat-cell:contains("${unit1.shortname}")`).prev().click();
  cy.translate(Cypress.env('locale')).then(json => {
    cy.clickDialogButton(json.continue);
  });
  cy.get('[data-cy="workspace-new-unit-unit-key"]').clear().type(newUnit.shortname);
  cy.get('[data-cy="workspace-new-unit-unit-name"]').clear().type(newUnit.name);
  cy.get('body').then($body => {
    if ($body.find('[data-cy="workspace-new-unit-new-group"]').length > 0) {
      cy.get('[data-cy="workspace-new-unit-new-group"]')
        .clear()
        .type(newUnit.group);
    } else {
      cy.get('mat-dialog-content').find('svg').click();
      cy.get('body').then($body1 => {
        if ($body1.find(`mat-option:contains("${unit1.group}")`).length > 0) {
          cy.get(`mat-option:contains("${unit1.group}")`).click();
        } else {
          cy.get('.cdk-overlay-transparent-backdrop').click();
          cy.get('[data-cy="workspace-add-new-group"]').click();
          cy.get('[data-cy="workspace-new-unit-new-group"]')
            .clear()
            .type(newUnit.group);
        }
      });
    }
  });
  cy.clickDataCyWithResponseCheck('[data-cy="workspace-new-unit-submit-button"]',
    [201],
    '/api/workspaces/*/units',
    'POST',
    'createUnitFromExisting');
}

/**
 * Moves a unit from one workspace to another
 * @param wsorigin - Source workspace name
 * @param wsdestination - Destination workspace name
 * @param unit - Unit to move
 * @example
 * moveUnit('Workspace 1', 'Workspace 2', unit);
 */
export function moveUnit(wsorigin: string, wsdestination: string, unit: UnitData): void {
  cy.visit('/');
  cy.visitWs(wsorigin);
  goToWsMenu();
  cy.get('[data-cy="workspace-edit-unit-move-unit"]').click();
  cy.get('mat-select').click();
  cy.get(`mat-option:contains("${wsdestination}")`).click();
  cy.get(`mat-cell:contains("${unit.shortname}")`).prev().click();
  cy.clickDataCyWithResponseCheck(
    '[data-cy="workspace-move-unit-button"]',
    [200],
    '/api/workspaces/*/units/workspace-id',
    'PATCH',
    'createUnitFromExisting'
  );
}

/**
 * Imports units from a zip file
 * @param filename - Zip filename in fixtures folder
 * @example
 * importExercise('test_units.zip');
 */
export function importExercise(filename: string): void {
  const path: string = `../frontend-e2e/src/fixtures/${filename}`;
  cy.get('[data-cy="workspace-add-units"]').click();
  cy.get('input[type=file]')
    .selectFile(path, {
      action: 'select',
      force: true
    });
}

/**
 * Selects multiple units from the unit list
 * @param unitNames - Array of unit names to select
 * @example
 * selectListUnits(['Unit 1', 'Unit 2']);
 */
export function selectListUnits(unitNames: string[]): void {
  cy.get('mat-row').should('exist');
  unitNames.forEach(name => {
    cy.get(`mat-cell:contains("${name}")`)
      .should('be.visible')
      .parent()
      .find('mat-checkbox')
      .click();
  });
}
