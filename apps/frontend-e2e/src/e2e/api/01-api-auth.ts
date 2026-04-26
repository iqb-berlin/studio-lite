import {
  noId,
  fakeUser
} from '../../support/util-api';

describe('Auth API tests', () => {
  describe('1. POST /api/init-login', () => {
    it('201 positive test: should allow creating the initial administrator user', () => {
      cy.addFirstUserAPI(Cypress.expose('username'), Cypress.expose('password'))
        .then(resp => {
          Cypress.expose(`token_${Cypress.expose('username')}`, resp.body);
          expect(resp.status).to.equal(201);
        });
    });

    it('403 negative test: should prevent creating a second initial user with the same credentials', () => {
      cy.addFirstUserAPI(Cypress.expose('username'), Cypress.expose('password'))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('403 negative test: should prevent creating a second initial user with different credentials', () => {
      cy.addFirstUserAPI(fakeUser.username, fakeUser.password)
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });
  });

  describe('2. POST /api/login', () => {
    it('201 positive test: should allow logging in with valid credentials', () => {
      cy.loginAPI(Cypress.expose('username'), Cypress.expose('password'))
        .then(resp => {
          Cypress.expose(`token_${Cypress.expose('username')}`, resp.body.accessToken);
          Cypress.expose(`refresh_${Cypress.expose('username')}`, resp.body.refreshToken);
          expect(resp.status).to.equal(201);
        });
    });

    it('401 negative test: should deny access with invalid credentials', () => {
      cy.loginAPI(fakeUser.username, fakeUser.password)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('3. GET /api/auth-data', () => {
    it('200 positive test: should retrieve authorization data for the logged-in user', () => {
      cy.getUserIdAPI(Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          Cypress.expose(`id_${Cypress.expose('username')}`, resp.body.userId);
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should deny access to authorization data for an invalid token', () => {
      cy.getUserIdAPI('12345')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('4. PATCH /api/password', () => {
    it('200 positive test: should allow the logged-in user to change their password', () => {
      cy.updatePasswordAPI(Cypress.expose(`token_${Cypress.expose('username')}`), Cypress.expose('password'), '4567')
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body).to.equal(true);
        });

      cy.loginAPI(Cypress.expose('username'), '4567')
        .then(resp => {
          Cypress.expose(`token_${Cypress.expose('username')}`, resp.body.accessToken);
          expect(resp.status).to.equal(201);
        });

      cy.updatePasswordAPI(Cypress.expose(`token_${Cypress.expose('username')}`), '4567', Cypress.expose('password'))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body).to.equal(true);
        });
    });

    it('500/200 negative test: should fail to update password if the old password is incorrect', () => {
      cy.updatePasswordAPI(Cypress.expose(`token_${Cypress.expose('username')}`), '1111', '4567')
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body).to.equal(false);
        });
    });

    it('401 negative test: should deny password update without a valid authentication token', () => {
      cy.updatePasswordAPI(noId, Cypress.expose('password'), '4567')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });
});
