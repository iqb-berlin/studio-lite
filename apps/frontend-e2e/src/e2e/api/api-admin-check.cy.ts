/// <reference types="cypress" />

import {
  addFirstUserAPI,
  createGroupAPI,
  createNewUserAPI,
  createWsAPI,
  deleteFirstUserAPI, deleteGroupAPI,
  deleteUserAPI
} from '../../support/utilAPI';

describe('API Administration Management', () => {
  // before(() => addFirstUserAPI());
  // after(() => deleteFirstUserAPI());
  // beforeEach(() => {
  //   cy.visit('/');
  // });
  it('API Add first user', () => {
    addFirstUserAPI();
  });
  it('API user with admin credentials can add new user', () => {
    createNewUserAPI('newuser', 'newpass');
  });
  it('API delete a user that is not the active admin', () => {
    deleteUserAPI('newuser');
  });
  it('API create a group', () => {
    createGroupAPI('Mathematik Primär Bereichsgruppe');
  });
  it('API create a ws for a group', () => {
    createWsAPI(Cypress.env('groupID'), 'ws');
  });
  it('API delete with admin credentials can delete groups', () => {
    deleteGroupAPI(Cypress.env('groupID'));
    cy.pause();
  });

  it.skip('API user with admin credentials can Modules upload', () => {
    // addModuleAPI();
  });

  it.skip('API user with admin credentials delete Modules', () => {
    // deleteModuleAPI();
  });

  it('API delete first User', () => {
    deleteFirstUserAPI();
  });
});
