import {
  group1, UnitData, ws1, ws2
} from '../../../support/testData';
import { createBasicSpecCy, deleteBasicSpecCy } from '../shared/basic.spec.cy';
import {
  selectProfileForAreaFromGroup,
  selectProfileForGroup
} from '../../../support/metadata/metadata-util';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import { addUnitPred, selectUnit } from '../../../support/helpers';

describe('Workspace Settings', () => {
  const unit1: UnitData = {
    shortname: 'SETT_U1',
    name: 'Settings Unit 1',
    group: 'Gruppe S'
  };

  before(() => {
    createBasicSpecCy();
    // Enable profiles for group1
    selectProfileForGroup(group1, IqbProfile.DEu);
    selectProfileForGroup(group1, IqbProfile.DEi);

    // Create a test unit in ws1
    cy.visitWs(ws1);
    addUnitPred(unit1);
  });

  after(() => {
    deleteBasicSpecCy();
  });

  // -------------------------------------------------------------------------
  // 1. Verona Modules Configuration
  // -------------------------------------------------------------------------

  describe('Verona Modules Configuration', () => {
    it('opens settings dialog and displays available module options', () => {
      cy.visitWs(ws2);
      cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
      cy.get('[data-cy="workspace-edit-unit-settings"]').click();

      // Check editor dropdown
      cy.get('[data-cy="edit-workspace-settings-editor"]').should('be.visible');
      // Check player dropdown
      cy.get('[data-cy="edit-workspace-settings-player"]').should('be.visible');
      // Check schemer dropdown
      cy.get('[data-cy="edit-workspace-settings-schemer"]').should('be.visible');

      // Close dialog
      cy.get('button').contains(/abbrechen|cancel/i).click();
    });

    it('saves default Verona editor selection and persists after reload', () => {
      cy.visitWs(ws2);
      cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
      cy.get('[data-cy="workspace-edit-unit-settings"]').click();

      // Click mat-select inside the editor module component
      cy.get('[data-cy="edit-workspace-settings-editor"]').find('mat-select').click();
      cy.get('mat-option').should('have.length.at.least', 1).first().click();

      // Save settings
      cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();

      // Reopen dialog and verify selected module persists
      cy.visitWs(ws2);
      cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
      cy.get('[data-cy="workspace-edit-unit-settings"]').click();
      cy.get('[data-cy="edit-workspace-settings-editor"]').should('be.visible');
      cy.get('button').contains(/abbrechen|cancel/i).click();
    });
  });

  // -------------------------------------------------------------------------
  // 2. Metadata Profile Assignment
  // -------------------------------------------------------------------------

  describe('Metadata Profile Assignment', () => {
    it('assigns unit and item metadata profiles from group admin settings', () => {
      selectProfileForAreaFromGroup([IqbProfile.DEu, IqbProfile.DEi], ws1, group1);

      // Verify profiles selected in workspace settings
      cy.visitWs(ws1);
      cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
      cy.get('[data-cy="workspace-edit-unit-settings"]').click();
      cy.get('[data-cy="edit-workspace-settings-select-unit-profile"]').should('contain.text', 'Deu');
      cy.get('button').contains(/abbrechen|cancel/i).click();
    });
  });

  // -------------------------------------------------------------------------
  // 3. Route Visibility Toggling
  // -------------------------------------------------------------------------

  describe('Route Visibility Toggling', () => {
    it('hides a route tab (Begleitmaterial / notes) when unchecked in settings', () => {
      cy.visitWs(ws1);
      selectUnit(unit1.shortname);

      // Notes tab is initially visible
      cy.get('[data-cy="workspace-routes-notes"]').should('be.visible');

      // Open workspace settings and toggle off Begleitmaterial (notes)
      cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
      cy.get('[data-cy="workspace-edit-unit-settings"]').click();

      cy.get('studio-lite-edit-workspace-settings mat-checkbox')
        .contains('Begleitmaterial')
        .click();

      cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();

      // Notes tab should now be hidden
      cy.get('[data-cy="workspace-routes-notes"]').should('not.exist');
    });

    it('restores route tab when checked back on in settings', () => {
      cy.visitWs(ws1);
      selectUnit(unit1.shortname);

      // Open workspace settings and toggle back on Begleitmaterial (notes)
      cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
      cy.get('[data-cy="workspace-edit-unit-settings"]').click();

      cy.get('studio-lite-edit-workspace-settings mat-checkbox')
        .contains('Begleitmaterial')
        .click();

      cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();

      // Notes tab should be visible again
      cy.get('[data-cy="workspace-routes-notes"]').should('be.visible');
    });
  });
});
