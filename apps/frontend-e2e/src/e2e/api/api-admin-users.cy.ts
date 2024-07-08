import {
  addFirstUserAPI, createUserAPI, deleteFirstUserAPI, deleteUserAPI, getAdminUserAPI, getUserIdAPI
} from '../../support/utilAPI';
import { UserData } from '../../support/testData';

describe('API admin users test', () => {
  const user2:UserData = {
    username: 'admin2',
    password: 'paso',
    isAdmin: true
  };
  before(addFirstUserAPI);
  after(deleteFirstUserAPI);
  it('1. should be able to retrieve admin users', () => {
    getUserIdAPI(Cypress.env('username'), Cypress.env('token_admin'));
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    cy.request({
      method: 'GET',
      url: '/api/admin/users',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      }
    }).then(resp => {
      expect(resp.status).to.equal(200);
      expect(resp.body[0].name).to.equal(Cypress.env('username'));
    });
  });
  it('2. should be able to create an admin users', () => {
    createUserAPI(user2);
  });
  it('3. should be able to retrieve an admin users', () => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    cy.request({
      method: 'GET',
      url: '/api/admin/users',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      }
    }).then(resp => {
      expect(resp.status).to.equal(200);
      expect(resp.body.length).to.equal(2);
    });
  });
  // TO DO: Check again: I can't delete admin users
  it.skip('4. should be able to delete an admin users', () => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    const nu:number = parseInt(Cypress.env(user2.username), 10);
    cy.request({
      method: 'DELETE',
      url: '/api/admin/users/full',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: [
        Cypress.env(user2.username)
      ]
    }).then(resp => {
      expect(resp.status).to.equal(200);
    });
  });
  // NO DIFFERENCE BETWEEN 3 and 5.
  it('5. should able to retrieve all users', () => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    cy.request({
      method: 'GET',
      url: '/api/admin/users/full',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      }
    }).then(resp => {
      expect(resp.status).to.equal(200);
      expect(resp.body.length).to.equal(2);
    });
  });
  it.skip('6. should able to retrieve a user', () => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    cy.getUsersAPI(authorization)
      .then(resp => {
        expect(resp.status).to.equal(200);
      });
  });
  it('7. Delete the second user', () => {
    deleteUserAPI(Cypress.env(user2.username));
  });
});
