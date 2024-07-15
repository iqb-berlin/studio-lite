import {
  addFirstUserAPI,
  deleteFirstUserAPI,
  getUserIdAPI
} from '../../support/utilAPI';

describe('API unit tests', () => {
  // 32
  context('Preparing context', () => {
    it('a. Add user', () => {
      addFirstUserAPI();
    });
    it('b. Get user id', () => {
      getUserIdAPI(Cypress.env('username'), Cypress.env('token_admin'));
    });
  });
  context('Positive tests', () => {
    it('1. ', () => {
      cy.addModuleAPI('iqb-editor-aspect.2.5.0-beta.html');
      cy.pause();
    });

    it('2. ', () => {
    });
  });
  context('Negative tests', () => {
    it('1. ', () => {
    });

    it('2. ', () => {
    });
  });
  context('Delete the context', () => {
    it('b. Delete the first user', () => {
      deleteFirstUserAPI();
    });
  });
});
