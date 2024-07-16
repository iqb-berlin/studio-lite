import {
  addFirstUserAPI,
  deleteFirstUserAPI,
  getUserIdAPI
} from '../../support/utilAPI';
import { addModules, login, logout } from '../../support/util';

describe('API unit tests', () => {
  const modules:string[] = ['iqb-schemer-2.0.0-beta.html', 'iqb-editor-aspect-2.5.0-beta5.html', 'iqb-player-aspect-2.5.0-beta5.html'];
  const module = modules[0].replace(/-+(?=[^-\d]*\d)/, '%40').replace(/.html$/, '');
  // 32
  context('Preparing context', () => {
    it('a. Add user', () => {
      addFirstUserAPI();
    });
    it('b. Get user id', () => {
      getUserIdAPI(Cypress.env('username'), Cypress.env('token_admin'));
    });
  });
  context('Positive tests', () => {
    it('1. Add module', () => {
      // TODO Rewrite API tests
      cy.visit('/');
      login(Cypress.env('username'), Cypress.env('password'));
      addModules(modules);
    });
    // 32
    it('2. Get the modules ', () => {
      cy.getModulesAPI(Cypress.env('token_admin'))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.length).equal(3);
        });
    });
    // 33
    it('3. Get the modules with id', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'GET',
        url: `/api/verona-module/${module}`,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
    // 34
    it('4. Download the modules by key', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'GET',
        url: `/api/admin/verona-modules/download/${module}`,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          key: 'iqb-editor-aspect@2.4.9-alpha'
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
    // 34
    it('5. Delete verona modules', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'DELETE',
        url: `/api/admin/verona-modules/${module}`,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });
  context('Negative tests', () => {
    // 32
    it('2. Should not able to get the modules with no credentials ', () => {
      cy.getModulesAPI(Cypress.env('token_adm'))
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
    // 33
    it('3. Get the modules with id', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'GET',
        url: `/api/verona-module/${module}`,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        failOnStatusCode: false
      }).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });
    // 34
    it('4. Download the modules by key', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'GET',
        url: `/api/admin/verona-modules/download/${module}`,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        failOnStatusCode: false,
        body: {
          key: 'iqb-editor-aspect@2.4.8-alpha'
        }
      }).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });
    // 34
    it('5. Delete verona modules', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'DELETE',
        url: `/api/admin/verona-modules/${module}`,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });
  context('Delete the context', () => {
    it('b. Delete the first user', () => {
      deleteFirstUserAPI();
      cy.visit('/');
      logout();
    });
  });
});
