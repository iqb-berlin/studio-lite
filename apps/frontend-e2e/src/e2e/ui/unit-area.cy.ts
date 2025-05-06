/// <reference types="cypress" />
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
  findWorkspaceGroupSettings, clickIndexTab, addStatus, clickSaveButtonRight
} from '../../support/util';
import { AccessLevel, UnitData, UserData } from '../../support/testData';
import { selectProfileForAreaFromGroup, selectProfileForGroup } from '../../support/metadata/metadata-util';
import { IqbProfile } from '../../support/metadata/iqbProfile';

describe('UI check: workspace', () => {
  const modules:string[] = ['iqb-schemer-2.5.3.html', 'iqb-editor-aspect-2.9.3.html', 'iqb-player-aspect-2.9.3.html'];
  const group1:string = 'UI_BG';
  const ws1:string = '01Vorlage';
  const ws2:string = '07Final';
  const newUser: UserData = {
    username: 'normaluser',
    password: '5678'
  };
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
  beforeEach(() => {
    cy.visit('/');
  });

  it('prepares the context for unit test', () => {
    cy.visit('/');
    addModules(modules, 'Module');
    cy.visit('/');
    createGroup(group1);
    cy.visit('/');
    createWs(ws1, group1);
    grantRemovePrivilegeAtWs([Cypress.env('username')], ws1, [AccessLevel.Admin]);
  });

  it('should set player, editor and schemer for the ws', () => {
    setVeronaWs(ws1);
    cy.visit('/');
    selectProfileForGroup(group1, IqbProfile.DE);
    cy.visit('/');
    selectProfileForAreaFromGroup(IqbProfile.DE, ws1, group1);
  });

  it('should add state to the workspace', () => {
    findWorkspaceGroupSettings(group1).click();
    clickIndexTab('Einstellungen');
    addStatus('In Bearbeitung', 0);
    addStatus('Finale', 1);
    clickSaveButtonRight();
  });

  it('should the add button be present and we could add new exercises', () => {
    cy.visitWs(ws1);
    addUnitPred(unit1);
    cy.visit('/');
    cy.visitWs(ws1);
    addUnitPred(unit2);
    cy.visit('/');
    cy.visitWs(ws1);
    addUnitPred(unit3);
  });

  it('should the add button be present and we could add an exercise from existing exercises', () => {
    cy.visitWs(ws1);
    addUnitFromExisting(`${group1}: ${ws1}`, unit1, newUnit);
  });

  it('should the add button, and the button to import file be present', () => {
    cy.visitWs(ws1);
    importExercise();
  });

  it('should be able to delete Unit', () => {
    cy.visitWs(ws1);
    deleteUnit(unit1.shortname);
  });

  it('should be able to assign group to the units', () => {
    createWs(ws2, group1);
    cy.visit('/');
    grantRemovePrivilegeAtWs([Cypress.env('username')], ws2, [AccessLevel.Admin]);
    moveUnit(ws1, ws2, unit2);
  });

  it('should add a user to the ws1 with basic creedentials', () => {
    createNewUser(newUser);
    findWorkspaceGroupSettings(group1).click();
    grantRemovePrivilegeAtWs([newUser.username], ws1, [AccessLevel.Basic]);
  });

  it('should able to comment a unit', () => {

  });

  it('deletes the context ', () => {
    deleteGroup(group1);
  });
});
