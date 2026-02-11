import {
  modules
} from '../../support/testData';
import {
  noId
} from '../../support/util-api';

describe('Admin verona API tests', () => {
  describe('Register Module (POST /api/verona-modules)', () => {
    it('201 positive test: should allow an administrator to add schemer, player, and editor modules', () => {
      modules.forEach(m => {
        cy.addModuleAPI(
          m,
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(201);
        });
      });
    });
  });

  describe('23. GET /api/verona-modules', () => {
    it('200 positive test: should retrieve all registered Verona modules', () => {
      cy.wait(200);
      cy.getModulesAPI(Cypress.env(`token_${Cypress.env('username')}`)).then(
        resp => {
          expect(resp.status).to.be.oneOf([200, 304]);
          expect(resp.body.length).equal(6);
        }
      );
    });

    it('401 negative test: should deny access to the module list when no authentication token is provided', () => {
      cy.getModulesAPI(noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });
  });

  describe('24. GET /api/verona-modules/{key}', () => {
    it('200 positive test: should retrieve metadata for a specific Verona module by its key', () => {
      cy.getModuleAPI(
        'iqb-schemer%402.6',
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it('401 negative test: should deny access to module details when no authentication token is provided', () => {
      cy.getModuleAPI('iqb-schemer%402.6', noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('404 negative test: should return error when requesting a module with a non-existent key', () => {
      cy.getModuleAPI(
        noId,
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });
  });
});
