import {
  addFirstUser,
  addUnitFromExisting,
  addUnitPred,
  createWs,
  createGroup,
  deleteFirstUser,
  deleteGroup,
  grantRemovePrivilegeAtWs,
  importExercise,
  deleteUnit,
  moveUnit,
  addModules,
  setVeronaWs,
  addStatus,
  clickSaveButtonRight,
  deleteModule,
  selectListUnits,
  clickIndexTabWsgAdmin,
  goToWsMenu
} from '../../support/util';
import {
  AccessLevel,
  modules,
  UnitData
} from '../../support/testData';
import {
  selectProfileForAreaFromGroup,
  selectProfileForGroup
} from '../../support/metadata/metadata-util';
import { IqbProfile } from '../../support/metadata/iqbProfile';

describe('UI check: workspace', () => {
  const group1:string = 'UI_BG';
  const ws1:string = '01Vorlage';
  const ws2:string = '07Final';
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

  it('prepares the context for unit test', () => {
    addModules(modules);
    createGroup(group1);
    createWs(ws1, group1);
    grantRemovePrivilegeAtWs([Cypress.env('username')], ws1, [AccessLevel.Admin]);
  });

  it('should set player, editor and schemer for the ws', () => {
    setVeronaWs(ws1);
  });

  it('should select the profile for ws from ws settings', () => {
    selectProfileForGroup(group1, IqbProfile.DE);
  });

  it('should select profile for a ws from group settings', () => {
    selectProfileForAreaFromGroup(IqbProfile.DE, ws1, group1);
  });

  it('should add states to the workspace', () => {
    cy.findAdminGroupSettings(group1).click();
    clickIndexTabWsgAdmin('settings');
    addStatus('In Bearbeitung', 0);
    addStatus('Finale', 1);
    clickSaveButtonRight();
  });

  it('should the add button be present and we could add new exercises', () => {
    cy.visitWs(ws1);
    addUnitPred(unit1);
    cy.visitWs(ws1);
    addUnitPred(unit2);
    cy.visitWs(ws1);
    addUnitPred(unit3);
  });

  it('should the add button be present and we could add an exercise from existing exercises', () => {
    cy.visitWs(ws1);
    addUnitFromExisting(`${group1}: ${ws1}`, unit1, newUnit);
  });

  it('should the add button, and the button to import file be present', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
    cy.contains('M6_AK0011')
      .should('exist');
  });

  it('should be able to delete Unit', () => {
    cy.visitWs(ws1);
    deleteUnit(unit2.shortname);
  });

  it('should be able to assign group to the units', () => {
    createWs(ws2, group1);
    grantRemovePrivilegeAtWs([Cypress.env('username')], ws2, [AccessLevel.Admin]);
    moveUnit(ws1, ws2, unit2);
  });

  it('should export selected units', () => {
    cy.visitWs(ws1);
    cy.wait(200);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').click({ force: true });
    selectListUnits([unit3.shortname, newUnit.shortname]);
    cy.clickDataCyWithResponseCheck(
      '[data-cy="workspace-export-unit-button"]',
      [200, 304],
      '/api/workspaces/*',
      'GET',
      'export'
    );
  });

  it('should show metadata report', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-metadata"]').click();
    selectListUnits([unit3.shortname, newUnit.shortname]);
    // eslint-disable-next-line max-len
    cy.clickDataCyWithResponseCheck('[data-cy="workspace-show-metadata-display"]', [200, 304], '/api/workspaces/*/units/properties', 'GET', 'summaryMetadata');
    cy.translate('de').then(json => {
      cy.clickDialogButton(json.download);
    });
  });

  it('should show kodierung ', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-coding-report"]').click();
    // eslint-disable-next-line max-len
    cy.translate('de').then(json => {
      cy.clickDialogButton(json.close);
    });
  });

  it('should export the codebook ', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-export-coding-book"]').click();
    selectListUnits([newUnit.shortname]);
    cy.translate('de').then(json => {
      cy.clickButtonWithResponseCheck(
        json.export,
        [200, 304],
        '/api/workspaces/*/units/coding-book*',
        'GET',
        'codebook'
      );
    });
  });

  it('deletes the context ', () => {
    deleteGroup(group1);
    // deleteUser(newUser.username);
    deleteModule();
  });
});
