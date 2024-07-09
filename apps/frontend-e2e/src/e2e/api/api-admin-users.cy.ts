import {
  addFirstUserAPI, createUserAPI, deleteFirstUserAPI, deleteUserAPI, getUserIdAPI
} from '../../support/utilAPI';
import { UserData } from '../../support/testData';

describe('API admin users test', () => {
  const user2:UserData = {
    username: 'admin2',
    password: 'paso',
    isAdmin: false
  };
  const user3:UserData = {
    username: 'admin3',
    password: '1234',
    isAdmin: true
  };
  before(addFirstUserAPI);
  after(deleteFirstUserAPI);
  it('1. should be able to retrieve admin users', () => {
    getUserIdAPI(Cypress.env('username'), Cypress.env('token_admin'));
    cy.getUsersAPI()
      .then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body[0].name).to.equal(Cypress.env('username'));
      });
  });
  it('2. should be able to create an admin users', () => {
    createUserAPI(user2);
  });
  it('3. should be able to retrieve an admin users', () => {
    cy.getUsersAPI()
      .then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.length).to.equal(2);
      });
  });
  it.skip('4.Before: should be able to create an admin users', () => {
    createUserAPI(user3);
  });
  // TO DO: Check again: I can't delete admin users Method not allowed
  it.skip('4. should be able to delete an admin users', () => {
    cy.pause();
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    const nu:number = parseInt(Cypress.env(user3.username), 10);
    cy.request({
      method: 'DELETE',
      url: `/api/admin/users?id=${nu}`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      }
    }).then(resp => {
      expect(resp.status).to.equal(200);
    });
  });
  // CHECK why 3. and 5. have little difference, it really necessary have 2 api?
  it('5. should able to retrieve all users', () => {
    cy.getUsersFullAPI()
      .then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.length).to.equal(2);
      });
  });
  it('6. should able to retrieve a user', () => {
    console.log(Cypress.env(user2.username));
    cy.getUserAPI(Cypress.env(user2.username))
      .then(resp => {
        expect(resp.body.name).to.equal(user2.username);
      });
  });
  it('6.Negativ test: should not be able to retrieve a false user', () => {
    cy.getUserAPI('999')
      .its('status')
      .should('equal', 404);
  });
  it('7. should to retrieve the workspaces', () => {
    // Creating the workspaces
  });

  it('7. Delete the second user', () => {
    deleteUserAPI(Cypress.env(user2.username));
  });
});
