import {
  addFirstUserAPI,
  changePasswordAPI,
  deleteFirstUserAPI,
  deleteUserAPI,
  getUserIdAPI,
  loginAPI
} from '../../support/utilAPI';

// DONE
describe('API Login and authorization tests', () => {
  // NOTE: Status response for the post is 201 instead of 200
  it('init-login: create first, log in and store token', () => {
    addFirstUserAPI(); // 25
  });
  it('login: log in the api and store token', () => {
    loginAPI(Cypress.env('username'), Cypress.env('password')); // 26
  });
  it('auth-data: get authorization data of a user', () => {
    getUserIdAPI(Cypress.env('username'), Cypress.env('token_admin')); // 27
  });
  it('password: change the password for a user', () => {
    changePasswordAPI(Cypress.env('password'), '4567'); // 28
    changePasswordAPI('4567', Cypress.env('password'));
  });
  it('keycloak-login: log in the app', () => {
    cy.request({
      method: 'POST',
      url: '/api/keycloak-login',
      headers: {
        'app-version': Cypress.env('version')
      },
      body: {
        description: '',
        email: 'xxx@hu-berlin.com',
        firstName: 'xxx',
        identity: 'xxx',
        isAdmin: 'false',
        issuer: 'https://www.iqb-login.de/realms/iqb',
        lasName: 'xxx',
        name: 'xxx',
        password: ''
      }
    }).then(resp => {
      Cypress.env('token_cloak', resp.body);
      const authorization = `bearer ${resp.body}`;
      expect(resp.status).to.equal(201); // We use dummy data, with real data we use code 201
      cy.request({
        method: 'GET',
        url: '/api/auth-data',
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      }).then(resp2 => {
        Cypress.env('id_cloack', resp2.body.userId);
        expect(resp2.status).to.equal(200);
      });
    });
  });
  it('delete key cloak user', () => {
    deleteUserAPI(Cypress.env('id_cloack'));
  });
  it('delete admin users', () => {
    deleteFirstUserAPI();
  });
});
