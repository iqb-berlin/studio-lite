/// <reference types="cypress" />
import {
  addFirstUser, addUnitFromExisting, addUnitPred,
  createWs,
  createGroup,
  deleteFirstUser, deleteGroup,
  grantRemovePrivilege, importExercise, deleteUnit, moveUnit
} from '../../support/util';
import { AccessLevel, UnitData } from '../../support/testData';

describe.skip('UI check: workspace', () => {
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
  beforeEach(() => {
    cy.visit('/');
  });

  it('prepares the context for unit test', () => {
    createGroup(group1);
    cy.visit('/');
    createWs(ws1, group1);
    grantRemovePrivilege(Cypress.env('username'), ws1, AccessLevel.Admin);
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
    deleteUnit(unit1);
  });

  it('should be able to assign group to the units', () => {
    createWs(ws2, group1);
    grantRemovePrivilege(Cypress.env('username'), ws2, AccessLevel.Admin);
    moveUnit(ws1, ws2, unit2);
  });

  it('deletes the context ', () => {
    deleteGroup(group1);
  });
});
