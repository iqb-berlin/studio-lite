/// <reference types="cypress" />
import {
  addFirstUser, addUnitPred,
  createAreaForGroupFromAdmin,
  createGroupArea,
  deleteFirstUser, deleteGroupArea,
  grantRemovePrivilegeFromGroup, login,
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
    cy.pause();
    cy.get('mat-icon:contains("add")')
      .click();
    cy.get('button > span:contains("Neu von vorhandener Aufgabe")')
      .click();
  });

  it.skip('should be add button present and the button to import file is present', () => {
    visitArea('UnitArea_API_AB');
    cy.get('mat-icon:contains("add")')
      .click();
    cy.get('button > span:contains("Import")')
      .should('exist')
      .click();
  });

  it('delete the context ', () => {
    deleteGroupArea('UnitArea_API_BG');
    cy.visit('/');
    deleteFirstUser();
    cy.visit('/');
    logout();
  });
});
