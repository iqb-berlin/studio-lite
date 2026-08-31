/**
 * Workspace and unit management helper functions for Cypress E2E tests
 * Contains functions for creating, deleting, and managing units
 */

import { UnitData } from '../testData';
import { clickIndexTabWorkspace, goToWsMenu } from './navigation';

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
  cy.get(`[data-cy="workspace-select-unit-list-checkbox-${shortname}"]`).click();
  cy.get('[data-cy="workspace-select-unit-button"]').click();
  cy.translate(Cypress.expose('locale')).then(json => {
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
      cy.get('[data-cy="workspace-new-unit-group"]').click();
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
 * Ensures a unit exists in a workspace. If not found, creates it.
 * @param ws - Workspace name
 * @param unit - Unit data object
 * @example
 * ensureUnitExists(ws1, unit3);
 */
export function ensureUnitExists(ws: string, unit: UnitData): void {
  cy.visitWs(ws);
  cy.get('body').then($body => {
    const unitFound = $body.find(`[data-cy="workspace-select-unit-list-checkbox-${unit.shortname}"]`).length > 0 ||
      $body.text().includes(unit.shortname);
    if (!unitFound) {
      addUnitPred(unit);
    }
  });
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
  cy.get(`[data-cy="workspace-select-unit-list-checkbox-${unit1.shortname}"]`).click();
  cy.translate(Cypress.expose('locale')).then(json => {
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
      cy.get('[data-cy="workspace-new-unit-group"]').click();
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
  cy.get(`[data-cy="workspace-select-unit-list-checkbox-${unit.shortname}"]`).click();
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
  cy.get('[data-cy="workspace-select-unit-list-key"]').should('exist');
  unitNames.forEach(name => {
    cy.get(`[data-cy="workspace-select-unit-list-checkbox-${name}"]`).click();
  });
}

/**
 * Creates a new rich note
 * @param content - Text content of the rich note
 * @param optionIndex - The index of the tag to select (default: -1 for last)
 * @param linkItemName - Optional item to link to
 * @example
 * createRichNote('Erste Rich Note', 0);
 * createRichNote('Note linked to 01', -1, '01');
 */
export function createRichNote(content: string, optionIndex: number = -1, linkItemName?: string): void {
  cy.get('[data-cy="rich-note-add"]').first().click({ force: true });
  cy.get('mat-select[formControlName="tagId"]').click();
  if (optionIndex === -1) {
    cy.get('mat-option').last().click();
  } else if (optionIndex === 0) {
    cy.get('mat-option').first().click();
  } else {
    cy.get('mat-option').eq(optionIndex).click();
  }
  cy.get('tiptap-editor .ProseMirror').type(content);
  if (linkItemName) {
    cy.get('[data-cy="comment-editor-link-to-item"]').click();
    cy.contains('mat-option', linkItemName).click();
  }
  cy.get('[data-cy="rich-note-dialog-save"]').click({ force: true });
}

/**
 * Edits the last rich note
 * @param addedContent - Text content to append to the rich note
 * @example
 * editRichNote(' (bearbeitet)');
 */
export function editRichNote(addedContent: string): void {
  cy.get('[data-cy="rich-note-edit"]').last().click({ force: true });
  cy.get('tiptap-editor .ProseMirror').type(addedContent);
  cy.get('[data-cy="rich-note-dialog-save"]').click({ force: true });
}

/**
 * Submits selected units to the configured drop-box
 * @param unitNames - Array of unit names to submit
 * @example
 * submitUnits(['Unit 1', 'Unit 2']);
 */
export function submitUnits(unitNames: string[]): void {
  cy.get('[data-cy="workspace-edit-unit-menu"]').click();
  cy.get('[data-cy="workspace-edit-unit-submit-units"]').click();
  cy.get('mat-mdc-dialog-container, mat-dialog-container').should('be.visible');
  selectListUnits(unitNames);
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.get('[data-cy="workspace-select-unit-button"]')
      .contains(json.workspace['submit-units'])
      .click();
  });
}

/**
 * Returns units from the drop-box back to the original workspace
 * @param unitNames - Array of unit names to return
 * @example
 * returnSubmittedUnits(['Unit 1', 'Unit 2']);
 */
export function returnSubmittedUnits(unitNames: string[]): void {
  cy.get('[data-cy="workspace-edit-unit-menu"]').click();
  cy.get('[data-cy="workspace-edit-unit-return-submitted-units"]').click();
  cy.get('mat-mdc-dialog-container, mat-dialog-container').should('be.visible');
  selectListUnits(unitNames);
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.get('[data-cy="workspace-select-unit-button"]')
      .contains(json.workspace['return-submitted-units'])
      .click();
  });
}

/**
 * Opens the group management dialog from the workspace menu
 * @example
 * openGroupManagementDialog();
 */
export function openGroupManagementDialog(): void {
  goToWsMenu();
  cy.get('[data-cy="workspace-edit-unit-manage-unit-groups"]').click();
  cy.get('studio-lite-group-manage').should('exist');
}

/**
 * Adds a new group from the group management dialog
 * @param groupName - Name of the new group
 * @example
 * addGroupFromManagement('New Group');
 */
export function addGroupFromManagement(groupName: string): void {
  cy.get('studio-lite-group-menu').find('mat-icon').contains('add').click();
  cy.get('mat-dialog-container input[formControlName="text"]').type(groupName);
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.clickDialogButton(json.save);
  });
}

/**
 * Renames a group from the group management dialog
 * @param oldGroupName - The name of the group to select and rename
 * @param newGroupName - The new name of the group
 * @example
 * renameGroupFromManagement('Old Name', 'New Name');
 */
export function renameGroupFromManagement(oldGroupName: string, newGroupName: string): void {
  cy.get('studio-lite-group-manage .group-row').contains(oldGroupName).click();
  cy.get('studio-lite-group-menu').find('mat-icon').contains('edit').click();
  cy.get('mat-dialog-container input[formControlName="text"]').clear().type(newGroupName);
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.clickDialogButton(json.save);
  });
}

/**
 * Deletes a group from the group management dialog
 * @param groupName - The name of the group to select and delete
 * @example
 * deleteGroupFromManagement('Group to Delete');
 */
export function deleteGroupFromManagement(groupName: string): void {
  cy.get('studio-lite-group-manage .group-row').contains(groupName).click();
  cy.get('studio-lite-group-menu').find('mat-icon').contains('delete').click();
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.clickDialogButton(json.delete);
  });
}

/**
 * Closes the group management dialog
 * @example
 * closeGroupManagementDialog();
 */
export function closeGroupManagementDialog(): void {
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.clickDialogButton(json.close);
  });
  cy.get('studio-lite-group-manage').should('not.exist');
}

/**
 * Opens the user list dialog from the workspace menu
 * @example
 * openWorkspaceUserListDialog();
 */
export function openWorkspaceUserListDialog(): void {
  goToWsMenu();
  cy.get('[data-cy="workspace-edit-unit-user-list"]').click();
  cy.get('studio-lite-workspace-user-list').should('exist');
}

/**
 * Closes the user list dialog
 * @example
 * closeWorkspaceUserListDialog();
 */
export function closeWorkspaceUserListDialog(): void {
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.clickDialogButton(json.close);
  });
  cy.get('studio-lite-workspace-user-list').should('not.exist');
}

/**
 * Selects a unit and navigates to its properties tab
 * @param shortname - Unit shortname or key
 * @example
 * openUnitProperties('UNIT_1');
 */
export function openUnitProperties(shortname: string): void {
  selectUnit(shortname);
  clickIndexTabWorkspace('properties');
  cy.get('input[formControlName="key"]').should('be.visible');
}

/**
 * Clicks the unit properties save button and waits for the PATCH API response
 * @example
 * clickUnitPropertiesSaveButton();
 */
export function clickUnitPropertiesSaveButton(): void {
  cy.get('[data-cy="workspace-unit-save-button"]').should('not.be.disabled').click();
  cy.wait('@saveProps').its('response.statusCode').should('eq', 200);
}

/**
 * Navigates to unit properties, registers PATCH intercept, executes modify action, saves,
 * reloads, and runs verification
 * @param ws - Workspace name
 * @param shortname - Unit shortname
 * @param modify - Function performing form edits
 * @param verify - Function performing assertions after reload
 * @example
 * editUnitPropertiesAndVerify(ws1, 'U1', () => cy.get(...).type('New'), () => cy.get(...).should('have.value', 'New'));
 */
export function editUnitPropertiesAndVerify(
  ws: string,
  shortname: string,
  modify: () => void,
  verify: () => void
): void {
  cy.visitWs(ws);
  openUnitProperties(shortname);
  cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
  modify();
  clickUnitPropertiesSaveButton();
  cy.visitWs(ws);
  openUnitProperties(shortname);
  verify();
}
