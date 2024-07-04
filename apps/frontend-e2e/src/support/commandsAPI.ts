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
    getWsByGroupAPI(groupKey: string, num_ws:number):void;
    loginAPI(username: string, password: string): void;
  }
}

Cypress.Commands.add('loginAPI', (username:string, password:string):void => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:4200/api/login',
    headers: {
      'app-version': Cypress.env('version')
    },
    body: {
      username: username,
      password: password
    }
  }).then(resp => {
    Cypress.env('admin_token', resp.body);
  });
});

Cypress.Commands.add('getWsByGroupAPI', (groupKey: string, num_ws: number) => {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/workspace-groups/${groupKey}/workspaces`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    expect(resp.status).to.equal(200);
    expect(resp.body.length).to.equal(num_ws);
  });
});
