import {
  changePassword,
  clickButtonToAccept, insertCredentials, logout, visitLoginPage
} from '../../support/util';
import { adminData, userData } from '../../support/config/userdata';

describe('User Management', () => {
  beforeEach(visitLoginPage);

  it('should not be able to login with correct credentials', () => {
    insertCredentials(userData.user_name, 'nopass');
    cy.intercept('POST', '/api/login').as('responseLogin');
    clickButtonToAccept('Weiter');
    cy.wait('@responseLogin').its('response.statusCode').should('eq', 401);
  });

  it('should not be able to login with correct credentials', () => {
    insertCredentials(userData.user_name, userData.user_pass);
    cy.intercept('POST', '/api/login').as('responseLogin');
    clickButtonToAccept('Weiter');
    cy.wait('@responseLogin').its('response.statusCode').should('eq', 201);
    logout();
  });

  it('should not be able to find admin user setting button', () => {
    insertCredentials(userData.user_name, userData.user_pass);
    cy.intercept('POST', '/api/login').as('responseLogin');
    clickButtonToAccept('Weiter');
    cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
      .should('not.exist');
  });
  it('should be possible log out if the user is logged', () => {
    insertCredentials(userData.user_name, userData.user_pass);
    clickButtonToAccept('Weiter');
    logout();
  });
  it('should be possible change the password', () => {
    insertCredentials(userData.user_name, userData.user_pass);
    cy.intercept('POST', '/api/login').as('responseLogin1');
    clickButtonToAccept('Weiter');
    cy.wait('@responseLogin1').its('response.statusCode').should('eq', 201);
    changePassword('newpass', userData.user_pass);
    logout();

    visitLoginPage();
    insertCredentials(userData.user_name, userData.user_pass);
    cy.intercept('POST', '/api/login').as('responseLogin2');
    clickButtonToAccept('Weiter');
    cy.wait('@responseLogin2').its('response.statusCode').should('eq', 401);

    visitLoginPage();
    insertCredentials(userData.user_name, 'newpass');
    cy.intercept('POST', '/api/login').as('responseLogin3');
    clickButtonToAccept('Weiter');
    cy.wait('@responseLogin3').its('response.statusCode').should('eq', 201);
    changePassword(userData.user_pass, 'newpass');
    logout();
  });
  it('should be able to modify personal data', () => {
    // TODO
  });
});
