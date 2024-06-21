/// <reference types="cypress" />
import {
  addFirstUser,
  changePassword,
  updatePersonalData,
  createNewUser,
  deleteFirstUser,
  deleteUser,
  login,
  logout
} from '../../support/util';

describe('UI User Management', () => {
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
  });
  beforeEach(() => {
    cy.visit('/');
  });

  it('prepare the Context', () => {
    createNewUser('normaluser', '5678');
    cy.visit('/');
    logout();
  });

  it('should be possible login with credentials', () => {
    login('normaluser', '5678');
  });

  it('should not be able to find admin user setting button', () => {
    cy.get('[data-cy="goto-admin"]')
      .should('not.exist');
  });

  it('should be able to modify personal data', () => {
    updatePersonalData();
  });

  it('should be possible change the password', () => {
    changePassword('newpass', '5678');
    cy.visit('/');
    logout();
    login('normaluser', 'newpass');
    changePassword('5678', 'newpass');
  });

  it('should be able to logout', () => {
    logout();
  });

  it('should not be able to login with incorrect credentials', () => {
    cy.login('normaluser', 'nopass');
    cy.buttonToContinue('Weiter', 401, '/api/login', 'POST', 'loginFail');
  });

  it('delete the user', () => {
    // TODO test with a username as user: check mat-cell
    login(Cypress.env('username'), Cypress.env('password'));
    deleteUser('normaluser');
  });
});
