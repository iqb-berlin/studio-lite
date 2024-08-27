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

// General
Cypress.Commands.add('runAndIgnore', (testFn: () => void) => {
  testFn();
  throw new Error('Skipping test count');
});

// 21.
Cypress.Commands.add('getWsByUserAPI',
  (id:string) => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    cy.request({
      method: 'GET',
      url: `/api/admin/users/${id}/workspaces`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      failOnStatusCode: false
    });
  });

// 17.
Cypress.Commands.add('getUsersAPI',
  () => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    cy.request({
      method: 'GET',
      url: '/api/admin/users',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      }
    });
  });

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
// 9
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
