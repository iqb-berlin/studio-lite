/// <reference types="cypress" />
import {
  addFirstUser,
  createAreaForGroupFromAdmin,
  createGroupArea,
  deleteFirstUser, deleteGroupArea,
  grantRemovePrivilegeFromGroup, login,
  logout, visitArea
} from '../../support/util/util';
import { adminData } from '../../support/config/userdata';

describe('IU check: workspace', () => {
  // Although this is ui test, it is necessary to introduce a user (api) to test
  // the user workspace
  beforeEach(() => {
    cy.visit('/');
  });

  it('prepare the context for unit area test', () => {
    addFirstUser();
    cy.visit('/');
    login(adminData.user_name, adminData.user_pass);
    createGroupArea('UnitArea_BG');
    cy.visit('/');
    createAreaForGroupFromAdmin('UnitArea_AB', 'UnitArea_BG');
    grantRemovePrivilegeFromGroup(adminData.user_name, 'UnitArea_AB', 'write');
  });

  it('should be add button present', () => {
    visitArea('UnitArea_AB');
    cy.get('mat-icon:contains("add")')
      .should('exist');
  });
  it('should be add button present and we can add a new exercise', () => {
    visitArea('UnitArea_AB');
    cy.get('mat-icon:contains("add")')
      .click();
    cy.get('button > span:contains("Neue Aufgabe")')
      .should('exist');
  });
  it('should be add button present and can a exercise from existing exercises', () => {
    visitArea('UnitArea_AB');
    cy.get('mat-icon:contains("add")')
      .click();
    cy.get('button > span:contains("Neu von vorhandener Aufgabe")')
      .should('exist');
  });
  it('should be add button present and the button to import file is present', () => {
    visitArea('UnitArea_AB');
    cy.get('mat-icon:contains("add")')
      .click();
    cy.get('button > span:contains("Import")')
      .should('exist')
      .click();
  });

  it('delete the context ', () => {
    deleteGroupArea('UnitArea_BG');
    cy.visit('/');
    deleteFirstUser();
    cy.visit('/');
    logout();
  });
});
