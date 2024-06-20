/// <reference types="cypress" />

// import { addFirstUser, deleteFirstUser } from '../../support/util/util';

describe('API Administration Management', () => {
  // before(() => addFirstUser());
  // after(() => deleteFirstUser());
  // beforeEach(() => {
  //   cy.visit('/');
  // });
  it.only('API login', () => {
    cy.loginAPI(Cypress.env('username'), Cypress.env('password'));
  });
  it('API get data', () => {
    cy.getWS_API();
  });
});
