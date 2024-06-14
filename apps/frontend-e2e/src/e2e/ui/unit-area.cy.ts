/// <reference types="cypress" />
import {
  addFirstUser, addUnitFromExisting, addUnitPred, clickButtonToAccept,
  createWs,
  createGroup,
  deleteFirstUser, deleteGroup,
  grantRemovePrivilege, importExercise
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
    cy.get('[data-cy="workspace-add-units"]')
      .click();
    cy.get('button > span:contains("Neu von vorhandener Aufgabe")')
      .click();
    addUnitFromExisting('Unit_UI_BG: Unit_UI_WS', 'AUF_D1', 'Name Auf 1', 'Gruppe D', 'Neu_AUF_D1', 'New Name Auf 1', 'Group D');
  });

  it('should be add button present and the button to import file is present', () => {
    cy.visitWs('Unit_UI_WS');
    importExercise();
  });

  it('should be able to delete Unit', () => {
    cy.visitWs('Unit_UI_WS');
    cy.get('mat-icon:contains("delete")')
      .click();
    cy.get('mat-dialog-container input[placeholder="Suchbegriff"]')
      .should('exist')
      .click()
      .type('AUF_D1');
    cy.get('mat-cell:contains("AUF_D1 - Name Auf 1")').prev().click();
    clickButtonToAccept('Löschen');
  });

  it('should be able to assign group to the units', () => {
    createWs('API_WS2', 'Unit_UI_BG');
    grantRemovePrivilege(adminData.user_name, 'API_WS2', 'write');
    cy.visit('/');
    cy.visitWs('Unit_UI_WS');
    cy.get('mat-icon:contains("menu")')
      .click();
    cy.get('span:contains("Verschieben")')
      .click();
    cy.get('mat-select')
      .click();
    cy.get('mat-option:contains("API_WS2")').click();
    cy.get('mat-cell:contains("AUF_E1 - Name Auf 2")').prev().click();
    cy.get('mat-dialog-actions > button > span.mdc-button__label:contains("Verschieben")').click();
  });

  it('delete the context ', () => {
    deleteGroup('Unit_UI_BG');
  });
});
