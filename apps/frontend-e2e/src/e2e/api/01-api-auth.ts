import {
  noId,
  fakeUser
} from '../../support/util-api';

describe('Auth API tests', () => {
  describe('1. POST /api/init-login', () => {
    it('201 positive test: should allow creating the initial administrator user', () => {
      cy.addFirstUserAPI(
        Cypress.expose('username'),
        Cypress.expose('password')
      ).then(resp => {
        Cypress.expose(`token_${Cypress.expose('username')}`, resp.body);
        expect(resp.status).to.equal(201);
      });
    });

    it('403 negative test: should prevent creating a second initial user with the same credentials', () => {
      cy.addFirstUserAPI(
        Cypress.expose('username'),
        Cypress.expose('password')
      ).then(resp => {
        expect(resp.status).to.equal(403);
      });
    });

    it('403 negative test: should prevent creating a second initial user with different credentials', () => {
      cy.addFirstUserAPI(fakeUser.username, fakeUser.password).then(resp => {
        expect(resp.status).to.equal(403);
      });
    });
  });

  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('2. POST /api/login', () => {
    it('201 positive test: should allow logging in with valid credentials', () => {
      cy.loginAPI(Cypress.expose('username'), Cypress.expose('password')).then(
        resp => {
          Cypress.expose(
            `token_${Cypress.expose('username')}`,
            resp.body.accessToken
          );
          Cypress.expose(
            `refresh_${Cypress.expose('username')}`,
            resp.body.refreshToken
          );
          expect(resp.status).to.equal(201);
        }
      );
    });

    it('401 negative test: should deny access with invalid credentials', () => {
      cy.loginAPI(fakeUser.username, fakeUser.password).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });
  });

  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('3. GET /api/auth-data', () => {
    it('200 positive test: should retrieve authorization data for the logged-in user', () => {
      cy.getUserIdAPI(
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        Cypress.expose(`id_${Cypress.expose('username')}`, resp.body.userId);
        expect(resp.status).to.equal(200);
      });
    });

    it('401 negative test: should deny access to authorization data for an invalid token', () => {
      cy.getUserIdAPI('12345').then(resp => {
        expect(resp.status).to.equal(401);
      });
    });
  });

  describe('4. PATCH /api/password', () => {
    it('200 positive test: should allow the logged-in user to change their password', () => {
      cy.updatePasswordAPI(
        Cypress.expose(`token_${Cypress.expose('username')}`),
        Cypress.expose('password'),
        '4567'
      ).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body).to.equal(true);
      });

      cy.loginAPI(Cypress.expose('username'), '4567').then(resp => {
        Cypress.expose(
          `token_${Cypress.expose('username')}`,
          resp.body.accessToken
        );
        expect(resp.status).to.equal(201);
      });

      cy.updatePasswordAPI(
        Cypress.expose(`token_${Cypress.expose('username')}`),
        '4567',
        Cypress.expose('password')
      ).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body).to.equal(true);
      });
    });

    // A copy of a refresh token must not outlive the old password, not even one of the session the
    // password was changed in (#1901).
    it('200 positive test: should end every session of the account when the password changes', () => {
      const refreshStatuses: number[] = [];
      cy.loginAPI(Cypress.expose('username'), Cypress.expose('password')).then(sessionA => {
        cy.loginAPI(Cypress.expose('username'), Cypress.expose('password')).then(sessionB => {
          cy.updatePasswordAPI(sessionA.body.accessToken, Cypress.expose('password'), '4567').then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body).to.equal(true);
          });
          cy.refreshTokenAPI(sessionA.body.refreshToken).then(resp => refreshStatuses.push(resp.status));
          cy.refreshTokenAPI(sessionB.body.refreshToken).then(resp => refreshStatuses.push(resp.status));
        });
      });

      // Reset before asserting: a failed assertion would otherwise leave the changed password behind
      // for every later spec.
      cy.loginAPI(Cypress.expose('username'), '4567').then(resp => {
        expect(resp.status).to.equal(201);
        cy.updatePasswordAPI(resp.body.accessToken, '4567', Cypress.expose('password')).then(reset => {
          expect(reset.body).to.equal(true);
        });
      });
      cy.wrap(refreshStatuses).should('deep.equal', [401, 401]);
    });

    it('500/200 negative test: should fail to update password if the old password is incorrect', () => {
      cy.updatePasswordAPI(
        Cypress.expose(`token_${Cypress.expose('username')}`),
        '1111',
        '4567'
      ).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body).to.equal(false);
      });
    });

    it('401 negative test: should deny password update without a valid authentication token', () => {
      cy.updatePasswordAPI(noId, Cypress.expose('password'), '4567').then(
        resp => {
          expect(resp.status).to.equal(401);
        }
      );
    });
  });
});
