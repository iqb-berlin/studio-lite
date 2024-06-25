import {
  addFirstUserAPI, changePasswordAPI, deleteFirstUserAPI, deleteUserAPI, getUserIdAPI, keyCloakLogin, loginAPI
} from '../../support/utilAPI';

describe('API Login and authorization testing', () => {
  // NOTE: Status response for the post is 201 instead of 200
  it('init-login: create first, log in and store token', () => {
    addFirstUserAPI();
  });
  it('login: log in the api and store token', () => {
    loginAPI(Cypress.env('username'), Cypress.env('password'));
  });
  it('auth-data: get authorization data of a user', () => {
    getUserIdAPI(Cypress.env('username'), 'id_admin');
  });
  it('password: change the password for a user', () => {
    changePasswordAPI(Cypress.env('password'), '4567');
    changePasswordAPI('4567', Cypress.env('password'));
  });
  it.skip('keycloak-login: log in the app', () => {
    keyCloakLogin();
    const userId = getUserIdAPI('xxx', 'id_cloak');
    deleteUserAPI(userId);
  });
  it.skip('delete admin users', () => {
    cy.pause();
    deleteFirstUserAPI();
  });
});
