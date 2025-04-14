import { UserData } from '../../support/testData';
import { login } from '../../support/util';

describe('Admin settings API tests', () => {
  const noId: string = '9988';
  const user2: UserData = {
    username: 'user',
    password: 'paso',
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
        cy.createUserAPI(user2, Cypress.env(`token_${Cypress.env('username')}`))
          .then(res => {
            Cypress.env(`id_${user2.username}`, res.body);
            expect(res.status).to.equal(201);
            cy.loginAPI(user2.username, user2.password)
              .then(resp3 => {
                Cypress.env(`token_${user2.username}`, resp3.body);
                expect(resp3.status).to.equal(201);
              });
          });
      });
  });

  describe('108. POST /api/admin/resource-packages', () => {
    const filename = 'GeoGebra.itcr.zip';
    it.skip('200 positive test: should add a resource package the admin', () => {
      cy.visit('/');
      login(Cypress.env('username'), Cypress.env('password'));
      cy.get('[data-cy="goto-admin"]').click();
      cy.get('span:contains("Pakete")')
        .eq(0)
        .click();
      const path:string = `../frontend-e2e/src/fixtures/${filename}`;
      cy.get('input[type=file]')
        .selectFile(path, {
          action: 'select',
          force: true
        });
    });
    //  It is skipped [vite] http proxy error: /api/admin/resource-packages
    it.skip('500 positive test: should add a resource package the admin', () => {
      cy.addPackageAPI(filename, 'noId')
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });
    it('201 positive test: should add a resource package the admin', () => {
      cy.addPackageAPI(filename, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(201);
        });
    });
  });

  describe('109. GET /api/resource-packages', () => {
    it('200 positive test: should get a resource package the admin', () => {
      cy.getPackageAPI(Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should not update the configuration text settings a normal user', () => {
      cy.getPackageAPI(Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200/401 negative test:  should get a resource package text settings without token', () => {
      cy.getPackageAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
  });

  describe('110. DELETE /api/admin/resource-packages', () => {
    it('401 negative test: should get the a normal user', () => {
      cy.deletePackageAPI(Cypress.env(`token_${user2.username}`), '1')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should not delete the resource package a non user', () => {
      cy.deletePackageAPI(noId, '1')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('200 positive test: should delete the package the admin ', () => {
      cy.deletePackageAPI(Cypress.env(`token_${Cypress.env('username')}`), '1')
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
  });

  describe('Erase the database', () => {
    it('Deletes users', () => {
      cy.deleteUserAPI(Cypress.env(`id_${user2.username}`), Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      cy.deleteUserAPI(Cypress.env(`id_${Cypress.env('username')}`), Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          Cypress.env('token_admin', '');
          expect(resp.status).to.equal(200);
        });
    });
  });
});
