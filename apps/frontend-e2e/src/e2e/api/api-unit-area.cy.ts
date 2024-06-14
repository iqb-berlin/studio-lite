/// <reference types="cypress" />
import {
  addFirstUser,
  createAreaForGroupFromAdmin,
  createGroup,
  deleteFirstUser, deleteGroup,
  grantRemovePrivilege, login,
  logout, visitWs
} from '../../support/util/util';
import { adminData } from '../../support/config/userdata';

describe('UI check: workspace', () => {
  // Although this is ui test, it is necessary to introduce a user (api) to test
  // the user workspace
  beforeEach(() => {
    cy.visit('/');
  });

  it('prepare the context for unit area test', () => {
    addFirstUser();
    cy.visit('/');
    login(adminData.user_name, adminData.user_pass);
    createGroup('UnitArea_BG');
    cy.visit('/');
    createAreaForGroupFromAdmin('UnitArea_AB', 'UnitArea_BG');
    grantRemovePrivilege(adminData.user_name, 'UnitArea_AB', 'write');
  });

  it('should be add button present', () => {
    visitWs('UnitArea_AB');
    cy.get('mat-icon:contains("add")')
      .should('exist');
  });
  it('should be add button present and we can add a new exercise', () => {
    visitWs('UnitArea_AB');
    cy.get('mat-icon:contains("add")')
      .click();
    cy.get('button > span:contains("Neue Aufgabe")')
      .should('exist');
  });
  it('should be add button present and can a exercise from existing exercises', () => {
    visitWs('UnitArea_AB');
    cy.get('mat-icon:contains("add")')
      .click();
    cy.get('button > span:contains("Neu von vorhandener Aufgabe")')
      .should('exist');
  });
  it('should be add button present and the button to import file is present', () => {
    visitWs('UnitArea_AB');
    cy.get('mat-icon:contains("add")')
      .click();
    cy.get('button > span:contains("Import")')
      .should('exist')
      .click();
  });

  it('delete the context ', () => {
    deleteGroup('UnitArea_BG');
    cy.visit('/');
    deleteFirstUser();
    cy.visit('/');
    logout();
  });
});
