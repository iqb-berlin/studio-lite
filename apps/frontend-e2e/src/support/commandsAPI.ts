/// <reference types="cypress" />
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    loginAPI(username: string, password:string):void;
  }
}

Cypress.Commands.add('loginAPI', (username:string, password:string):void => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:4200/api/login',
    headers: {
      'app-version': '7.5.1'
    },
    body: {
      username: username,
      password: password
    }
  }).then(resp => {
    Cypress.env('admin_token', resp.body);
  });
});
