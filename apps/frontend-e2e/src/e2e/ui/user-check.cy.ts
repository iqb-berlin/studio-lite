import {
  changePassword,
  clickButtonToAccept, createNewUser, deleteUser, login, logout, visitLoginPage
} from '../../support/util';
import { adminData, userData } from '../../support/config/userdata';

describe('User Management', () => {
  beforeEach(visitLoginPage);

  it('prepare the Context', () => {
    login(adminData.user_name, adminData.user_pass);
    createNewUser(userData.user_name, userData.user_pass);
    visitLoginPage();
    logout();
  });

  it('should be possible login with credentials', () => {
    login(userData.user_name, userData.user_pass);
    visitLoginPage();
    logout();
  });

  it('should not be able to login with correct credentials', () => {
    cy.get('input[placeholder="Anmeldename"]')
      .should('exist')
      .clear()
      .type(userData.user_name);
    cy.get('input[placeholder="Kennwort"]')
      .should('exist')
      .clear()
      .type('nopass');
    cy.intercept('POST', '/api/login').as('responseLogin');
    clickButtonToAccept('Weiter');
    cy.wait('@responseLogin').its('response.statusCode').should('eq', 401);
  });

  it('user should be able to logout', () => {
    login(userData.user_name, userData.user_pass);
    visitLoginPage();
    logout();
  });

  it('should not be able to find admin user setting button', () => {
    login(userData.user_name, userData.user_pass);
    cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
      .should('not.exist');
    visitLoginPage();
    logout();
  });

  it('should be possible change the password', () => {
    login(userData.user_name, userData.user_pass);
    changePassword('newpass', userData.user_pass);
    visitLoginPage();
    logout();
    login(userData.user_name, 'newpass');
    changePassword(userData.user_pass, 'newpass');
    visitLoginPage();
    logout();
  });

  it('delete the Context', () => {
    cy.pause();
    login(adminData.user_name, adminData.user_pass);
    deleteUser(userData.user_name);
    visitLoginPage();
    logout();
  });

  // it('should be able to modify personal data', () => {
  //   // TODO
  // });
});
