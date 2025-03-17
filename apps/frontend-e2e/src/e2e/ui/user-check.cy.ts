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
import { UserData } from '../../support/testData';

describe.skip('UI User Management', () => {
  const newUser: UserData = {
    username: 'normaluser',
    password: '5678'
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

  it('prepares the context', () => {
    createNewUser(newUser);
    cy.visit('/');
    logout();
  });

  it('should be possible login with credentials', () => {
    login(newUser.username, newUser.password);
  });

  it('should not be able to find admin user setting button', () => {
    cy.get('[data-cy="goto-admin"]')
      .should('not.exist');
  });

  it('should be able to modify personal data', () => {
    updatePersonalData();
  });

  it('should be possible to change the password', () => {
    changePassword('newpass', newUser.password);
    cy.visit('/');
    logout();
    login(newUser.username, 'newpass');
    changePassword(newUser.password, 'newpass');
  });

  it('should be able to log out', () => {
    logout();
  });

  it('should not be able to login with incorrect credentials', () => {
    cy.login(newUser.username, 'nopass');
    cy.buttonToContinue('Weiter', 401, '/api/login', 'POST', 'loginFail');
  });

  it('deletes the user', () => {
    // TODO test with a username as user: check mat-cell
    login(Cypress.env('username'), Cypress.env('password'));
    deleteUser('normaluser');
  });
});
