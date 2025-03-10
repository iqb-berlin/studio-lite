// import { HttpParams } from '@angular/common/http';
import { UserData } from '../../support/testData';
import { buildQueryParameters } from '../../support/utilAPI';

describe('Identity tests users API tests', () => {
  const cloakUser1:UserData = {
    username: 'xxx',
    password: 'xxx',
    isAdmin: true
  };
  const cloakUser2:UserData = {
    username: 'yyy',
    password: 'yyy',
    isAdmin: false
  };
  const fakeCloakUser1:UserData = {
    username: 'xxA',
    password: 'xxA',
    isAdmin: false
  };
  const fakeCloakUser2:UserData = {
    username: 'yyA',
    password: 'yyA',
    isAdmin: false
  };
  const fakeCloakUser3:UserData = {
    username: 'zzA',
    password: 'zzA',
    isAdmin: false
  };
  before(() => {
    cy.addFirstUserAPI(Cypress.env('username'), Cypress.env('password'))
      .then(resp => {
        Cypress.env(`token_${Cypress.env('username')}`, resp.body);
        expect(resp.status).to.equal(201);
        cy.getUserIdAPI(Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp2 => {
            Cypress.env(`id_${Cypress.env('username')}`, resp2.body.userId);
            expect(resp2.status).to.equal(200);
          });
      });
  });
  after(() => {
    cy.deleteUserAPI(Cypress.env(`id_${Cypress.env('username')}`), Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        Cypress.env('token_admin', '');
        expect(resp.status).to.equal(200);
      });
  });
  describe('5. POST /api/keycloak-login', () => {
    it('201 positive test: all users are not admin users', () => {
      cy.keycloakAPI(cloakUser1)
        .then(resp => {
          Cypress.env(`token_${cloakUser1.username}`, resp.body);
          expect(resp.status).to.equal(201); // We use dummy data, with real data we use code 201
          cy.getUserIdAPI(resp.body)
            .then(resp2 => {
              Cypress.env(`id_${cloakUser1.username}`, resp2.body.userId);
              expect(resp2.status).to.equal(200);
            });
        });
      cy.keycloakAPI(cloakUser2)
        .then(resp => {
          Cypress.env(`token_${cloakUser2.username}`, resp.body);
          expect(resp.status).to.equal(201); // We use dummy data, with real data we use code 201
          cy.getUserIdAPI(resp.body)
            .then(resp2 => {
              Cypress.env(`id_${cloakUser2.username}`, resp2.body.userId);
              expect(resp2.status).to.equal(200);
            });
        });
    });
    it('201 positive test: should create a user typing correctly the parameter but identity and name.', () => {
      // It does not create the user, if we don't type identity parameter correctly but other parameters.
      cy.request({
        method: 'POST',
        url: '/api/keycloak-login',
        headers: {
          'app-version': Cypress.env('version')
        },
        body: {
          description: '',
          email: `${fakeCloakUser3.username}@hu-berlin.com`,
          firstName: `${fakeCloakUser3.username}`,
          identity: `${fakeCloakUser3.username}`,
          isAdmin: 'false',
          issuer: 'https://www.iqb-login.de/realms/iqb',
          lastName: `${fakeCloakUser3.username}`,
          name: `${fakeCloakUser3.username}`,
          password: ''
        }
      }).then(resp => {
        Cypress.env(`token_${fakeCloakUser3.username}`, resp.body);
        expect(resp.status).to.equal(201);
        cy.getUserIdAPI(resp.body)
          .then(resp2 => {
            Cypress.env(`id_${fakeCloakUser3.username}`, resp2.body.userId);
            expect(resp2.status).to.equal(200);
          });
      });
    });
    it('200 negative test identity: should not create' +
      ' a user if we do not type correctly the parameter identity.', () => {
      // It does not create the user, if we don't type identity parameter correctly but other parameters.
      // create the token but not the id
      cy.request({
        method: 'POST',
        url: '/api/keycloak-login',
        headers: {
          'app-version': Cypress.env('version')
        },
        body: {
          description: '',
          email: `${fakeCloakUser1.username}@hu-berlin.com`,
          firstName: `${fakeCloakUser1.username}`,
          identityq: `${fakeCloakUser1.username}`,
          isAdmin: `${fakeCloakUser1.isAdmin}`,
          issuer: 'https://www.iqb-login.de/realms/iqb',
          lasName: `${fakeCloakUser1.username}`,
          name: `${fakeCloakUser1.username}`,
          password: ''
        }
      }).then(resp => {
        expect(resp.status).to.equal(201);
        cy.getUserIdAPI(resp.body)
          .then(resp2 => {
            expect(resp2.status).to.equal(200);
          });
      });
    });
    it('500 negative test: should not create a user if we do not type correctly the parameter name.', () => {
      // sometimes it returns 201
      cy.request({
        method: 'POST',
        url: '/api/keycloak-login',
        headers: {
          'app-version': Cypress.env('version')
        },
        body: {
          description: '',
          email: `${fakeCloakUser2.username}@hu-berlin.com`,
          firstName: `${fakeCloakUser2.username}`,
          identity: `${fakeCloakUser2.username}`,
          isAdmin: `${fakeCloakUser2.isAdmin}`,
          issuer: 'https://www.iqb-login.de/realms/iqb',
          lastName: `${fakeCloakUser2.username}`,
          nameq: `${fakeCloakUser2.username}`,
          password: ''
        },
        failOnStatusCode: false
      }).then(resp => {
        Cypress.env(`token_${fakeCloakUser2.username}`, resp.body);
        expect(resp.status).to.equal(500);
      });
    });
    it('201 negative test: should not create a user with the same email twice.', () => {
      // But, it does not create a same user twice, but there is no way to get a bad 4xx response.
      cy.keycloakAPI(cloakUser1)
        .then(resp => {
          expect(resp.status).to.equal(201);
        });
    });
    it('Delete all users', () => {
      const ids = [
        Cypress.env(`id_${cloakUser1.username}`),
        Cypress.env(`id_${cloakUser2.username}`),
        Cypress.env(`id_${fakeCloakUser3.username}`)];

      cy.deleteUsersAPI(
        ids,
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });
});
