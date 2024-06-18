/// <reference types="cypress" />
/*
import {
  addFirstUser, deleteFirstUser, login, logout
} from '../../support/util/util';
import { adminData } from '../../support/config/userdata';

describe('UI check: workspace', () => {
  let testIndex = 0;

  beforeEach(() => {
    testIndex += 1;
    cy.visit('/');
    if (testIndex !== 1) {
      login(adminData.user_name, adminData.user_pass);
    }
  });

  afterEach(() => {
    if (testIndex !== 1) {
      logout();
    }
  });
  // Although this is ui test, it is necessary to introduce a user (api) to test
  // the user workspace
  it('should be able to create the first user', () => {
    addFirstUser();
  });

  it('should be the menu user present', () => {
    cy.get('[data-cy=goto-user-menu]')
      .should('exist');
  });

  it('should be the menu user present and the change password', () => {
    cy.get('[data-cy=goto-user-menu]')
      .should('exist')
      .click();
    cy.get('span:contains("Kennwort ändern")')
      .should('exist');
    cy.get('body')
      .click();
  });

  it('should be the menu user present and manage user data', () => {
    cy.get('[data-cy=goto-user-menu]')
      .should('exist')
      .click();
    cy.get('span:contains("Nutzerdaten ändern")')
      .should('exist');
    cy.get('body')
      .click();
  });

  it('should be the menu user and logout present ', () => {
    cy.get('[data-cy=goto-user-menu]')
      .should('exist')
      .click();
    cy.get('span:contains("Abmelden")')
      .should('exist');
    cy.get('body')
      .click();
  });
  it('delete the first user', () => {
    deleteFirstUser();
    cy.visit('/');
  });
});
*/
