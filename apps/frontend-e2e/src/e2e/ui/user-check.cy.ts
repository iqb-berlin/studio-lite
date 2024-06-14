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
} from '../../support/util/util';
import { adminData, userData } from '../../support/config/userdata';

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
    createNewUser(userData.user_name, userData.user_pass);
    cy.visit('/');
    logout();
  });

  it('should be possible login with credentials', () => {
    login(userData.user_name, userData.user_pass);
  });

  it('should not be able to find admin user setting button', () => {
    cy.get('[data-cy="goto-admin"]')
      .should('not.exist');
  });

  it('should be able to modify personal data', () => {
    updatePersonalData();
  });

  it('should be possible change the password', () => {
    changePassword('newpass', userData.user_pass);
    cy.visit('/');
    logout();
    login(userData.user_name, 'newpass');
    changePassword(userData.user_pass, 'newpass');
  });

  it('should be able to logout', () => {
    logout();
  });

  it('should not be able to login with incorrect credentials', () => {
    cy.login(userData.user_name, 'nopass');
    cy.buttonToContinue('Weiter', 401, '/api/login', 'POST', 'loginFail');
  });
  // it('should everyone in the gruppe be able to administrate the Bereichsgruppe were?', () => {
  //
  // });
  // it('should be able to grant other people to ', () => {
  //
  // });
  // it('should be able to delete see enter into a area of work', () => {
  //
  // });
  // it('should someone from the same group grant and remove permissions to other users (from users)?', () => {
  //
  // });
  // it('should someone from a group able to grant permissions person that not belong to the gruppe (from users)?', () => {
  //
  // });
  // it('should someone from the same group grant and remove permissions to other users (from area of work)?', () => {
  //
  // });
  // it('should someone from a group able to grant permissions person ' +
  //   'that not belong to the gruppe (from area of work)?', () => {
  //
  // });
  // it('See fall 4 ');
  //
  // it('should be able to add neu Status', () => {
  //
  // });
  // it('should be delete to add neu Status', () => {
  //
  // });

  it('delete the user', () => {
    login(adminData.user_name, adminData.user_pass);
    deleteUser(userData.user_name);
  });
});
