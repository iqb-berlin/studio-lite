import {
  addFirstUser,
  changePassword,
  updatePersonalData,
  createNewUser, deleteFirstUser, deleteUser, login, logout, visitLoginPage
} from '../../support/util/util';
import { adminData, userData } from '../../support/config/userdata';

describe('User Management', () => {
  beforeEach(() => {
    cy.viewport(1600, 900);
    visitLoginPage();
  });

  it('prepare the Context', () => {
    addFirstUser();
    login(adminData.user_name, adminData.user_pass);
    createNewUser(userData.user_name, userData.user_pass);
    // TODO find adequate intercept
    cy.wait(100);
    visitLoginPage();
    logout();
  });

  it('should be possible login with credentials', () => {
    login(userData.user_name, userData.user_pass);
    visitLoginPage();
    logout();
  });

  it('should not be able to login with incorrect credentials', () => {
    cy.get('[data-cy="home-user-name"]')
      .should('exist')
      .clear()
      .type(userData.user_name);
    cy.get('[data-cy="home-password"]')
      .should('exist')
      .clear()
      .type('nopass');
    // cy.intercept('POST', '/api/login').as('responseLogin');
    // clickButtonToAccept('Weiter');
    // cy.wait('@responseLogin').its('response.statusCode').should('eq', 401);
    cy.get('button')
      .contains('Weiter')
      .should('exist')
      .click();
    cy.wait(400);
    cy.get('button')
      .contains('Weiter')
      .should('exist');
  });

  it('user should be able to logout', () => {
    login(userData.user_name, userData.user_pass);
    visitLoginPage();
    logout();
  });

  it('should not be able to find admin user setting button', () => {
    login(userData.user_name, userData.user_pass);
    cy.get('[data-cy="goto-admin"]')
      .should('not.exist');
    visitLoginPage();
    logout();
  });

  it('should be able to modify personal data', () => {
    login(userData.user_name, userData.user_pass);
    updatePersonalData();
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
  it('should everyone in the gruppe be able to administrate the Bereichsgruppe were?', () => {

  });
  it('should be able to grant other people to ', () => {

  });
  it('should be able to delete see enter into a area of work', () => {

  });
  it('should someone from the same group grant and remove permissions to other users (from users)?', () => {

  });
  it('should someone from a group able to grant permissions person that not belong to the gruppe (from users)?', () => {

  });
  it('should someone from the same group grant and remove permissions to other users (from area of work)?', () => {

  });
  it('should someone from a group able to grant permissions person ' +
    'that not belong to the gruppe (from area of work)?', () => {

  });
  it('See fall 4 ');

  it('should be able to add neu Status', () => {

  });
  it('should be delete to add neu Status', () => {

  });

  it('delete the Context', () => {
    login(adminData.user_name, adminData.user_pass);
    deleteUser(userData.user_name);
    visitLoginPage();
    deleteFirstUser();
    visitLoginPage();
    logout();
  });
});
