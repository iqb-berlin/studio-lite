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
  createNewUser,
  setVeronaWs,
  addStatus,
  clickSaveButtonRight,
  deleteUser,
  logout,
  login,
  selectUnit,
  deleteModule,
  selectListUnits,
  focusOnMenu,
  clickIndexTabWorkspace,
  clickIndexTabWsgAdmin
} from '../../support/util';
import {
  AccessLevel,
  modules,
  newUser,
  UnitData
} from '../../support/testData';
import { selectProfileForGroup } from '../../support/metadata/metadata-util';
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

  // it('should select profile for a ws from group settings', () => {
  //   cy.visit('/');
  //   selectProfileForAreaFromGroup(IqbProfile.DE, ws1, group1);
  // });

  it('should add state to the workspace', () => {
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
    deleteUnit(unit1.shortname);
  });

  it('should be able to assign group to the units', () => {
    createWs(ws2, group1);
    grantRemovePrivilegeAtWs([Cypress.env('username')], ws2, [AccessLevel.Admin]);
    moveUnit(ws1, ws2, unit2);
  });

  it('should export selected units', () => {
    cy.visitWs(ws1);
    cy.wait(1000);
    cy.get('mat-icon:contains("menu")')
      .click();
    cy.get('span:contains("Export")')
      .click();
    selectListUnits([unit3.shortname, newUnit.shortname]);
    cy.clickButtonWithResponseCheck('Herunterladen', [200, 304], '/api/workspaces/*', 'GET', 'export');
  });

  it('should show metadata', () => {
    cy.visitWs(ws1);
    cy.wait(1000);
    focusOnMenu('Berichte', 'Metadaten');
    selectListUnits([unit3.shortname, newUnit.shortname]);
    // eslint-disable-next-line max-len
    cy.clickButtonWithResponseCheck('Anzeigen', [200, 304], '/api/workspaces/*/units/properties', 'GET', 'summaryMetadata');
    cy.clickButton('Herunterladen');
  });

  it('should export the codebook', () => {
    cy.visitWs(ws1);
    cy.wait(1000);
    focusOnMenu('Berichte', 'Codebook');
    selectListUnits([newUnit.shortname]);
    // eslint-disable-next-line max-len
    cy.clickButtonWithResponseCheck('Exportieren', [200, 304], '/api/workspaces/*/units/coding-book*', 'GET', 'codebook');
  });

  it('should add an user to the ws1 with basic credentials', () => {
    cy.findAdminSettings().click();
    createNewUser(newUser);
    cy.findAdminGroupSettings(group1).click();
    clickIndexTabWsgAdmin('workspaces');
    grantRemovePrivilegeAtWs([newUser.username], ws1, [AccessLevel.Basic]);
    logout();
  });

  it('should able to comment an unit a normal user', () => {
    login(newUser.username, newUser.password);
    cy.visitWs(ws1);
    selectUnit(unit3.shortname);
    clickIndexTabWorkspace('comments');
    cy.get('tiptap-editor').type('Neue Kommentar zu unit2');
    cy.contains('button', 'send').click();
  });

  it('should reply to a comment, and delete a comment', () => {
    cy.visitWs(ws1);
    selectUnit(unit3.shortname);
    clickIndexTabWorkspace('comments');
    cy.contains('button', 'reply').click();
    cy.get('tiptap-editor').eq(0).type('Antworten zu Neue Kommentar zu unit2');
    cy.contains('button', 'send').click();
    cy.get('studio-lite-comments').find('mat-icon:contains("delete")').eq(0).click();
    cy.get('studio-lite-delete-dialog').find('button:contains("Löschen")').click();
    logout();
    login(Cypress.env('username'), Cypress.env('password'));
  });

  it('deletes the context ', () => {
    deleteGroup(group1);
    deleteUser(newUser.username);
    deleteModule();
  });
});
