/// <reference types="cypress" />
import {
  addFirstUser, addUnitFromExisting, addUnitPred,
  createWs,
  createGroup,
  deleteFirstUser, deleteGroup,
  grantRemovePrivilege, importExercise, deleteUnit, moveUnit
} from '../../support/util';
import { AccessLevel } from '../../support/testData';

describe('UI check: workspace', () => {
  const group1:string = 'Unit_UI_BG';
  const ws1:string = 'Unit_UI_WS';

  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
  });
  beforeEach(() => {
    cy.visit('/');
  });

  it('prepare the context for unit test', () => {
    createGroup(group1);
    cy.visit('/');
    createWs(ws1, group1);
    grantRemovePrivilege(Cypress.env('username'), ws1, AccessLevel.Admin);
  });

  it('should be add button present and we can add new exercises', () => {
    cy.visitWs(ws1);
    addUnitPred('AUF_D1', 'Name Auf 1', 'Gruppe D');
    cy.visit('/');
    cy.visitWs(ws1);
    addUnitPred('AUF_E1', 'Name Auf 2', 'Gruppe E');
    cy.visit('/');
    cy.visitWs(ws1);
    addUnitPred('AUF_D2', 'Name Auf 2', 'Gruppe D');
  });

  it('should be add button present and can a exercise from existing exercises', () => {
    cy.visitWs(ws1);
    // eslint-disable-next-line max-len
    addUnitFromExisting('Unit_UI_BG: Unit_UI_WS', 'AUF_D1', 'Name Auf 1', 'Gruppe D', 'Neu_AUF_D1', 'New Name Auf 1', 'Group D');
  });

  it('should be add button present and the button to import file is present', () => {
    cy.visitWs(ws1);
    importExercise();
  });

  it('should be able to delete Unit', () => {
    cy.visitWs(ws1);
    deleteUnit('AUF_D1', 'Name Auf 1');
  });

  it('should be able to assign group to the units', () => {
    createWs('UI_WS2', group1);
    grantRemovePrivilege(Cypress.env('username'), 'UI_WS2', AccessLevel.Admin);
    moveUnit(ws1, 'UI_WS2', 'AUF_E1', 'Name Auf 2');
  });

  it('delete the context ', () => {
    deleteGroup(group1);
  });
});
