import { resource, UserData } from '../../support/testData';

describe('Admin settings API tests', () => {
  const noId: string = '9988';
  const user2: UserData = {
    username: 'userzwei',
    password: 'paso',
    isAdmin: false
  };
  before(() => {
    cy.addFirstUserAPI(Cypress.expose('username'), Cypress.expose('password'))
      .then(resp => {
        Cypress.expose(`token_${Cypress.expose('username')}`, resp.body);
        expect(resp.status).to.equal(201);
        cy.getUserIdAPI(Cypress.expose(`token_${Cypress.expose('username')}`))
          .then(resp2 => {
            Cypress.expose(`id_${Cypress.expose('username')}`, resp2.body.userId);
            expect(resp2.status).to.equal(200);
          });
        cy.createUserAPI(user2, Cypress.expose(`token_${Cypress.expose('username')}`))
          .then(res => {
            Cypress.expose(`id_${user2.username}`, res.body);
            expect(res.status).to.equal(201);
            cy.loginAPI(user2.username, user2.password)
              .then(resp3 => {
                Cypress.expose(`token_${user2.username}`, resp3.body);
                expect(resp3.status).to.equal(201);
              });
          });
      });
  });
  // after(() => cy.resetDb());
  describe('108. POST /api/admin/resource-packages', () => {
    // It is skipped because it results in [vite] http proxy error: /api/admin/resource-packages
    // it.skip('500 negative test: should not add a resource package a false user', () => {
    //   cy.addPackageAPI(filename, 'noId')
    //     .then(resp => {
    //       expect(resp.status).to.equal(500);
    //     });
    // });
    it('201 positive test: should allow an authorized administrator to successfully add a resource package', () => {
      cy.addPackageAPI(resource, Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(201);
        });
    });
  });

  describe('109. GET /api/resource-packages', () => {
    it('200 positive test: should allow an authorized administrator to successfully ' +
      'retrieve a resource package', () => {
      cy.getPackageAPI(Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should allow a regular user to successfully retrieve a resource package', () => {
      cy.getPackageAPI(Cypress.expose(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should deny resource package retrieval when no authentication token is provided', () => {
      cy.getPackageAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('110. DELETE /api/admin/resource-packages', () => {
    it('401 negative test: should deny resource package deletion to a user with regular permissions', () => {
      cy.deletePackageAPI(Cypress.expose(`token_${user2.username}`), '1')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should deny resource package deletion when providing an invalid user identifier', () => {
      cy.deletePackageAPI(noId, '1')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('200 positive test: should allow an authorized administrator to successfully delete a resource package', () => {
      cy.deletePackageAPI(Cypress.expose(`token_${Cypress.expose('username')}`), '1')
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
  });

  describe('Erase the database', () => {
    it('Deletes users', () => {
      cy.deleteUsersAPI([Cypress.expose(`id_${user2.username}`)], Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      cy.deleteUsersAPI([Cypress.expose(`id_${Cypress.expose('username')}`)],
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          Cypress.expose('token_admin', '');
          expect(resp.status).to.equal(200);
        });
    });
  });
});
