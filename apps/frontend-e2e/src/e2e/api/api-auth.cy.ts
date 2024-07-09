import {
  addFirstUserAPI,
  changePasswordAPI,
  deleteFirstUserAPI,
  deleteUserAPI,
  getCloakIdAPI,
  getUserIdAPI,
  keyCloakLogin,
  loginAPI
} from '../../support/utilAPI';

describe('API Login and authorization tests', () => {
  // NOTE: Status response for the post is 201 instead of 200
  it('init-login: create first, log in and store token', () => {
    addFirstUserAPI();
  });
  it('login: log in the api and store token', () => {
    loginAPI(Cypress.env('username'), Cypress.env('password'));
  });
  it('auth-data: get authorization data of a user', () => {
    getUserIdAPI(Cypress.env('username'), Cypress.env('token_admin'));
  });
  it('password: change the password for a user', () => {
    changePasswordAPI(Cypress.env('password'), '4567');
    changePasswordAPI('4567', Cypress.env('password'));
  });
  it.skip('keycloak-login: log in the app', () => {
    // This test doesn't work properly since I can not get the userId from a keycloaklogin
    // Maybe if we have implemented before log out, it can work.
    // The code in utilAPI is replaced with a dummy user
    // TODO PROBLEMATIC asynchronous call
    keyCloakLogin();
    cy.wait('@tokenCloak').then(() => {
      // console.log(Cypress.env('token_cloak'));
      getCloakIdAPI();
      cy.wait('@idCloak').then(() => {
        // console.log(Cypress.env('id_cloak'));
        deleteUserAPI(Cypress.env('id_cloak'));
      });
    });
  });
  it('delete admin users', () => {
    deleteFirstUserAPI();
  });
});
