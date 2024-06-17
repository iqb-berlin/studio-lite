/// <reference types="cypress" />
import {
  addFirstUser, addUnitFromExisting, addUnitPred,
  createWs,
  createGroup,
  deleteFirstUser, deleteGroup,
  grantRemovePrivilege, importExercise, deleteUnit, moveUnit
} from '../../support/util/util';

import { adminData } from '../../support/config/userdata';

describe('UI check: workspace', () => {
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
    createGroup('Unit_UI_BG');
    cy.visit('/');
    createWs('Unit_UI_WS', 'Unit_UI_BG');
    grantRemovePrivilege(adminData.user_name, 'Unit_UI_WS', 'write');
  });

  it('should be add button present and we can add new exercises', () => {
    cy.visitWs('Unit_UI_WS');
    addUnitPred('AUF_D1', 'Name Auf 1', 'Gruppe D');
    addUnitPred('AUF_E1', 'Name Auf 2', 'Gruppe E');
    addUnitPred('AUF_D2', 'Name Auf 2', 'Gruppe D');
  });

  it('should be add button present and can a exercise from existing exercises', () => {
    cy.visitWs('Unit_UI_WS');
    addUnitFromExisting('Unit_UI_BG: Unit_UI_WS', 'AUF_D1', 'Name Auf 1', 'Gruppe D', 'Neu_AUF_D1', 'New Name Auf 1', 'Group D');
  });

  it('should be add button present and the button to import file is present', () => {
    cy.visitWs('Unit_UI_WS');
    importExercise();
  });

  it('should be able to delete Unit', () => {
    cy.visitWs('Unit_UI_WS');
    deleteUnit('AUF_D1', 'Name Auf 1');
  });

  it('should be able to assign group to the units', () => {
    createWs('UI_WS2', 'Unit_UI_BG');
    grantRemovePrivilege(adminData.user_name, 'UI_WS2', 'write');
    moveUnit('Unit_UI_WS', 'UI_WS2', 'AUF_E1', 'Name Auf 2');
  });

  it('delete the context ', () => {
    deleteGroup('Unit_UI_BG');
  });
});
