import { UserData } from '../../support/testData';

describe('Studio API tests', () => {
  const fakeUser:UserData = {
    username: 'falseUser',
    password: 'paso',
    isAdmin: false
  };
  const user2:UserData = {
    username: 'normalUser',
    password: 'paso',
    isAdmin: false
  };

  describe('Auth API tests', () => {
    describe('1. POST /api/init-login', () => {
      it('201 positive test: should create a first user.', () => {
        cy.addFirstUserAPI(Cypress.env('username'), Cypress.env('password'))
          .then(resp => {
            Cypress.env(`token_${Cypress.env('username')}`, resp.body);
            expect(resp.status).to.equal(201);
          });
      });
      it('403 negative test: should to create a second first user with the same user data.', () => {
        cy.addFirstUserAPI(Cypress.env('username'), Cypress.env('password'))
          .then(resp => {
            expect(resp.status).to.equal(403);
          });
      });
      // eslint-disable-next-line max-len
      it('403 negative test: should not create a second first user with the different user data.', () => {
        cy.addFirstUserAPI(fakeUser.username, fakeUser.password)
          .then(resp => {
            expect(resp.status).to.equal(403);
          });
      });
    });
    describe('2. POST /api/login', () => {
      it('201 positive test: should be logging in with the correct data', () => {
        cy.loginAPI(Cypress.env('username'), Cypress.env('password'))
          .then(resp => {
            Cypress.env(`token_${Cypress.env('username')}`, resp.body);
            expect(resp.status).to.equal(201);
          });
      });
      it('401 negative test: should not be able to log in with false data.', () => {
        cy.loginAPI(fakeUser.username, fakeUser.password)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });
    describe('3. GET /api/auth-data', () => {
      it('200 positive test: should get the id of the logged in user.', () => {
        cy.getUserIdAPI(Cypress.env('username'), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            Cypress.env(`id_${Cypress.env('username')}`, resp.body.userId);
            expect(resp.status).to.equal(200);
          });
      });
      it('200 negative test: should get the id with the correct token', () => {
        cy.getUserIdAPI(fakeUser.username, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            cy.log(resp.body.userId);
            expect(resp.status).to.equal(200);
          });
      });
      it('401 negative test: should not obtain the id of a non-existent user.', () => {
        cy.getUserIdAPI(Cypress.env('username'), '12345')
          .then(resp => {
            cy.log(resp.body.userId);
            expect(resp.status).to.equal(401);
          });
      });
    });
    describe('4. PATCH /api/password', () => {
      it('200 positive test: should be able to change password', () => {
        cy.updatePasswordAPI(Cypress.env(`token_${Cypress.env('username')}`), Cypress.env('password'), '4567')
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body).to.equal(true);
          });
        cy.loginAPI(Cypress.env('username'), '4567')
          .then(resp => {
            Cypress.env(`token_${Cypress.env('username')}`, resp.body);
            expect(resp.status).to.equal(201);
          });
        cy.updatePasswordAPI(Cypress.env(`token_${Cypress.env('username')}`), '4567', Cypress.env('password'))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body).to.equal(true);
          });
      });

      it('200 negative test: should not update user password with false old pass', () => {
        // Should return 400
        cy.updatePasswordAPI(Cypress.env(`token_${Cypress.env('username')}`), '1111', '4567')
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body).to.equal(false);
          });
      });
    });
  });
  describe('Admin workspaces API tests', () => {
    describe('6. POST api/admin/users: should create a new user', () => {
      it('201 positive test: ', () => {
        cy.createUserAPI(user2, Cypress.env(`token_${Cypress.env('username')}`))
          .then(res => {
            Cypress.env(`id_${user2.username}`, res.body);
            expect(res.status).to.equal(201);
            cy.getUsersAPI()
              .then(resp => {
                expect(resp.status).to.equal(200);
                expect(resp.body.length).to.equal(2);
              });
            cy.loginAPI(user2.username, user2.password)
              .then(resp => {
                Cypress.env(`token_${user2.username}`, resp.body);
                expect(resp.status).to.equal(201);
              });
          });
      });
      // No negative tests found
    });

    describe('8. GET /api/admin/users/full', () => {
      it('200 positive test', () => {
        cy.getUsersFullAPI(Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body.length).to.equal(2);
          });
      });
      it('401 negative test: normal user can not use this api call', () => {
        cy.getUsersFullAPI(Cypress.env(`token_${user2.username}`))
          .then(resp2 => {
            expect(resp2.status).to.equal(401);
          });
      });
    });
    describe('7. DELETE /api/admin/users/id ', () => {
      it('200 positive test', () => {
        cy.deleteUserAPI(Cypress.env(`id_${user2.username}`), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
      it('No negative test', () => {
        cy.deleteUserAPI('1000', Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
    });
  });
  describe('Admin users API tests', () => {
    describe('', () => {
      it('', () => {

      });
      it('', () => {

      });
    });
  });

  describe('Delete the contents of the database', () => {
    describe('110. DELETE /api/admin/users/id', () => {
      it('200 positive test: should be possible to delete the first user', () => {
        cy.deleteFirstUserAPI().then(resp => {
          Cypress.env('token_admin', '');
          expect(resp.status).to.equal(200);
        });
      });
      it('401 negative test: should not be possible to delete user if it does not exist', () => {
        cy.deleteFirstUserAPI().then(resp => {
          expect(resp.status).to.equal(401);
        });
      });
    });
  });
});
// 400 Bad Request
// 401 Unauthorized
// 403 Forbidden
// 404 Not found
// 406 Not acceptable
// 408 Request Timeout
// 429 Too Many Requests
// 500 Internal Server Error
// 502: Bad Gateway
// 504: Gateway timeout
