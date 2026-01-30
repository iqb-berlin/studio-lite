import {
  AccessLevel,
  modules,
  testGroups,
  testWorkspaces,
  UnitData
} from '../../../support/testData';
import {
  selectProfileForAreaFromGroup,
  selectProfileForGroup
} from '../../../support/metadata/metadata-util';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import {
  addFirstUser,
  addModules,
  addStatus,
  addUnitFromExisting,
  addUnitPred,
  clickIndexTabWsgAdmin,
  clickSaveButtonRight,
  createGroup,
  createWs,
  deleteFirstUser,
  deleteGroup,
  deleteModule,
  deleteUnit,
  goToWsMenu,
  grantRemovePrivilegeAtWs,
  importExercise,
  moveUnit,
  selectListUnits,
  setVeronaWs
} from '../../../support/helpers';

describe('Workspace Unit Management', () => {
  const group1 = testGroups.ui;
  const ws1 = testWorkspaces.ui.template;
  const ws2 = testWorkspaces.ui.final;
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
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
    // cy.resetDb();
  });

  it('sets up workspace with modules and profiles', () => {
    addModules(modules);
    createGroup(group1);
    createWs(ws1, group1);
    grantRemovePrivilegeAtWs([Cypress.env('username')], ws1, [AccessLevel.Admin]);
  });

  it('configures Verona modules for workspace', () => {
    setVeronaWs(ws1);
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
    createWs(ws2, group1);
    grantRemovePrivilegeAtWs([Cypress.env('username')], ws2, [AccessLevel.Admin]);
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

  it('cleans up test data', () => {
    deleteGroup(group1);
    deleteModule();
  });
});
