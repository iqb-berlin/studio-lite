/// <reference types="cypress" />
import {
  addFirstUser, addUnitFromExisting, addUnitPred, clickButtonToAccept,
  createAreaForGroupFromAdmin,
  createGroupArea,
  deleteFirstUser, deleteGroupArea,
  grantRemovePrivilegeFromGroup, importExercise, login,
  logout, visitArea
} from '../../support/util/util';
import { adminData } from '../../support/config/userdata';

describe('API check: workspace', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('prepare the context for unit area test', () => {
    addFirstUser();
    cy.visit('/');
    login(adminData.user_name, adminData.user_pass);
    createGroupArea('UnitArea_API_BG');
    cy.visit('/');
    createAreaForGroupFromAdmin('UnitArea_API_AB', 'UnitArea_API_BG');
    grantRemovePrivilegeFromGroup(adminData.user_name, 'UnitArea_API_AB', 'write');
  });

  it('should be add button present and we can add new exercises', () => {
    visitArea('UnitArea_API_AB');
    addUnitPred('AUF_D1', 'Name Auf 1', 'Gruppe D');
    addUnitPred('AUF_E1', 'Name Auf 2', 'Gruppe E');
    addUnitPred('AUF_D2', 'Name Auf 2', 'Gruppe D');
  });

  it('should be add button present and can a exercise from existing exercises', () => {
    visitArea('UnitArea_API_AB');
    cy.get('[data-cy="workspace-add-units"]')
      .click();
    cy.get('button > span:contains("Neu von vorhandener Aufgabe")')
      .click();
    addUnitFromExisting('UnitArea_API_BG: UnitArea_API_AB', 'AUF_D1', 'Name Auf 1', 'Gruppe D', 'Neu_AUF_D1', 'New Name Auf 1', 'Group D');
  });

  it('should be add button present and the button to import file is present', () => {
    visitArea('UnitArea_API_AB');
    importExercise();
  });

  it('should be able to delete Unit', () => {
    visitArea('UnitArea_API_AB');
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
    cy.visit('/');
    createAreaForGroupFromAdmin('API_AB2', 'UnitArea_API_BG');
    grantRemovePrivilegeFromGroup(adminData.user_name, 'API_AB2', 'write');

    visitArea('UnitArea_API_AB');
    cy.get('mat-icon:contains("menu")')
      .click();
    cy.get('span:contains("Verschieben")')
      .click();
    cy.get('mat-select')
      .click();
    cy.get('mat-option:contains("API_AB2")').click();
    // const search_text = `${shortname}: ${name}`;
    cy.get('mat-cell:contains("AUF_E1 - Name Auf 2")').prev().click();
    cy.get('mat-dialog-actions > button > span.mdc-button__label:contains("Verschieben")').click();
  });

  it('delete the context ', () => {
    cy.pause();
    deleteGroupArea('UnitArea_API_BG');
    cy.visit('/');
    deleteFirstUser();
    cy.visit('/');
    logout();
  });
});
