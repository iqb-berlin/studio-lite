/// <reference types="cypress" />

// import { addFirstUser, deleteFirstUser } from '../../support/util/util';

import {
  addFirstUserAPI, createNewUserAPI, deleteFirstUserAPI, deleteUserAPI, getAdminUserAPI
} from '../../support/utilAPI';

describe('API Administration Management', () => {
  // before(() => addFirstUserAPI());
  // after(() => deleteFirstUserAPI());
  // beforeEach(() => {
  //   cy.visit('/');
  // });
  it('API admin login', () => {
    addFirstUserAPI();
  });
  it('API admin login test', () => {
    getAdminUserAPI();
  });
  it('API user with admin credentials can add new user', () => {
    createNewUserAPI('newuser', 'newpass');
  });
  // TO DO
  it.skip('API user with admin credentials can delete a user', () => {
    deleteUserAPI('newuser');
    cy.pause();
  });
  it('API get data', () => {
    deleteFirstUserAPI();
  });
});
