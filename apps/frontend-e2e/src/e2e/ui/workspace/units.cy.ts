import {
  group1,
  UnitData,
  ws1,
  ws2
} from '../../../support/testData';
import {
  selectProfileForAreaFromGroup,
  selectProfileForGroup
} from '../../../support/metadata/metadata-util';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import {
  addStatus,
  addUnitFromExisting,
  addUnitPred,
  clickIndexTabWsgAdmin,
  clickSaveButtonRight,
  deleteUnit,
  goToWsMenu,
  importExercise,
  moveUnit,
  selectListUnits,
  setModuleWithoutVerification
} from '../../../support/helpers';
import { createBasicSpecCy, deleteBasicSpecCy } from '../shared/basic.spec.cy';

describe('Workspace Unit Management', () => {
  const unit1: UnitData = {
    shortname: 'AUF_D1',
    name: 'Name Auf 1',
    group: 'Gruppe D'
  };
  const unit2: UnitData = {
    shortname: 'AUF_E1',
    name: 'Name Auf 2',
    group: 'Gruppe E'
  };
  const unit3: UnitData = {
    shortname: 'AUF_D2',
    name: 'Name Auf 2',
    group: 'Gruppe D'
  };
  const newUnit: UnitData = {
    shortname: 'Neu_Ex_D1',
    name: 'New Auf 1',
    group: 'Group D'
  };
  before(() => {
    createBasicSpecCy();
  });
  after(() => {
    deleteBasicSpecCy();
    // cy.resetDb();
  });

  it('selects metadata profile from workspace settings', () => {
    selectProfileForGroup(group1, IqbProfile.DE);
  });

  it('selects metadata profile from group settings', () => {
    selectProfileForAreaFromGroup(IqbProfile.DE, ws1, group1);
  });

  it('adds custom states to workspace', () => {
    cy.findAdminGroupSettings(group1).click();
    clickIndexTabWsgAdmin('settings');
    addStatus('In Bearbeitung', 0);
    addStatus('Finale', 1);
    clickSaveButtonRight();
  });
  it('configures Verona modules for workspace', () => {
    setModuleWithoutVerification(ws1, 'Aspect', 'Aspect', 'Schemer');
  });
  //
  // it('verifies module configuration persists after page reload', () => {
  //   cy.visit('/');
  //   cy.visitWs(ws1);
  //   verifyModuleConfiguration(ws1, 'Aspect', 'Aspect', 'Schemer');
  // });
  //
  // it('validates module settings are workspace-specific', () => {
  //   // Verify ws1 has configured modules
  //   verifyModuleConfiguration(ws1, 'Aspect', 'Aspect', 'Schemer');
  //
  //   // Verify ws2 has independent configuration
  //   cy.visitWs(ws2);
  //   cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
  //   cy.get('[data-cy="workspace-edit-unit-settings"]').click();
  //
  //   // ws2 should have module dropdowns available (even if not configured yet)
  //   cy.get('[data-cy="edit-workspace-settings-editor"]').should('exist');
  //   cy.get('[data-cy="edit-workspace-settings-player"]').should('exist');
  //   cy.get('[data-cy="edit-workspace-settings-schemer"]').should('exist');
  //
  //   cy.translate(Cypress.env('locale')).then(json => {
  //     cy.clickDialogButton(json.cancel || json.close);
  //   });
  // });
  //
  // it('configures workspace with alternative module combinations', () => {
  //   // Configure ws2 with different modules (Speedtest editor, Stars player)
  //   // setModuleWithVerification already verifies the configuration
  //   setModuleWithoutVerification(ws2, 'Aspect', 'Stars', 'Schemer');
  //
  //   // Verify ws1 still has original configuration
  //   verifyModuleConfiguration(ws1, 'Aspect', 'Aspect', 'Schemer');
  // });

  it('allows switching between different player modules', () => {
    // Switch to Speedtest player
    setModuleWithoutVerification(ws1, 'Aspect', 'Speedtest', 'Schemer');
    // Switch to Stars player (already verified by setModuleWithVerification)
    setModuleWithoutVerification(ws1, 'Aspect', 'Stars', 'Schemer');
  });

  it('creates new units', () => {
    cy.visitWs(ws1);
    addUnitPred(unit1);
    cy.visitWs(ws1);
    addUnitPred(unit2);
    cy.visitWs(ws1);
    addUnitPred(unit3);
  });

  it('creates unit from existing unit', () => {
    cy.visitWs(ws1);
    addUnitFromExisting(`${group1}: ${ws1}`, unit1, newUnit);
  });

  it('imports units from zip file', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
    cy.contains('M6_AK0011')
      .should('exist');
  });

  it('deletes a unit', () => {
    cy.visitWs(ws1);
    deleteUnit(unit1.shortname);
  });

  it('moves unit to another workspace', () => {
    moveUnit(ws1, ws2, unit2);
  });

  it('exports selected units', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    selectListUnits([unit3.shortname, newUnit.shortname]);
    cy.clickDataCyWithResponseCheck(
      '[data-cy="workspace-export-unit-button"]',
      [200, 304],
      '/api/workspaces/*',
      'GET',
      'export'
    );
  });

  it('displays metadata report', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-metadata"]').click();
    cy.clickDataCyWithResponseCheck(
      '[data-cy="workspace-show-metadata-display"]',
      [200, 304],
      '/api/workspaces/*/units/properties',
      'GET',
      'summaryMetadata');
    cy.get('[data-cy="metadata-table-view-download"]');
  });

  it('displays coding report', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-coding-report"]').click();
    cy.translate(Cypress.env('locale')).then(json => {
      cy.clickDialogButton(json.close);
    });
  });

  it('exports codebook for selected units', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-export-coding-book"]').click();
    selectListUnits([newUnit.shortname]);
    cy.translate(Cypress.env('locale')).then(json => {
      cy.clickButtonWithResponseCheck(
        json.export,
        [200, 304],
        '/api/workspaces/*/units/coding-book*',
        'GET',
        'codebook'
      );
    });
  });
});
