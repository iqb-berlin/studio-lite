import { changePasswordAPI } from '../../support/utilAPI';

describe('API general tests', () => {
  context('Positive tests', () => {
    it('1. should be able to add the first user', () => {
      cy.addFirstUserAPI()
        .then(resp => {
          Cypress.env(`token_${Cypress.env('username')}`, resp.body);
          expect(resp.status).to.equal(201);
        });
    });

    it('2. log in a valid user', () => {
      cy.loginAPI(Cypress.env('username'), Cypress.env('password'))
        .then(resp => {
          Cypress.env(`token_${Cypress.env('username')}`, resp.body);
          expect(resp.status).to.equal(201);
        });
    });

    it('3. should be able to retrieve user id', () => {
      cy.getUserIdAPI(Cypress.env('username'), Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          Cypress.env(`id_${Cypress.env('username')}`, resp.body.userId);
          expect(resp.status).to.equal(200);
        });
    });

    it('4. should be able to change the password for a user', () => {
      cy.updatePasswordAPI(Cypress.env(`token_${Cypress.env('username')}`), Cypress.env('password'), '4567')
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      cy.loginAPI(Cypress.env('username'), '4567')
        .then(resp => {
          Cypress.env(`token_${Cypress.env('username')}`, resp.body);
          expect(resp.status).to.equal(201);
        });
      cy.updatePasswordAPI(Cypress.env(`token_${Cypress.env('username')}`), '4567', Cypress.env('password'))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
    it('5. should able to login with keycloak-login', () => {
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
          Cypress.env('idCloack', resp2.body.userId);
          expect(resp2.status).to.equal(200);
        });
      });
    });

    it('110. should be able to add the first user', () => {
      cy.deleteFirstUserAPI().then(resp => {
        Cypress.env('token_admin', '');
        expect(resp.status).to.equal(200);
      });
    });
  });

  context('Negative tests', () => {

  });
});
