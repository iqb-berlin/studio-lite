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
    login(username: string, password: string): void;
    clickButton(text: string):void;
    buttonToContinue(text: string, code: number, url: string, rest: string, alias: string):void;
    dialogButtonToContinue(text: string, code: number, url: string, rest: string, alias: string):void;
    loadModule(filename: string, name: string):void;
    selectModule(name: string):void;
    visitWs(ws:string):void;
    loginAPI(username: string, password:string):void;
    getWS_API():void;
  }
}
// -- This is a parent command --
Cypress.Commands.add('login', (username:string, password:string) => {
  cy.get('[data-cy="home-user-name"]')
    .should('exist')
    .clear()
    .type(username);
  cy.get('[data-cy="home-password"]')
    .should('exist')
    .clear()
    .type(password);
});

// TO DO: find the methods that work
Cypress.Commands.add('loginAPI', (username:string, password:string):void => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:4200/api/login',
    headers: {
      'content-Type': 'application/json; charset=utf-8',
      accept: 'application/json; charset=utf-8',
      'app-version': '7.5.1'
    },
    body: {
      username: username,
      password: password
    }
  }).then(resp => {
    console.log(resp);
  });

  // cy.request('POST', '/api/init-login', {
  //   username,
  //   password
  // }).its('body.token').then(token => {
  //   cy.visit('/', {
  //     onBeforeLoad(win) {
  //       win.sessionStorage.setItem('token', token);
  //       console.log(token);
  //     }
  //   });
  // });
});

Cypress.Commands.add('getWS_API', () => {
  cy.request({
    method: 'GET',
    url: 'http://localhost:4200/api/auth-data'
  }).its('response.body.userName').then(userName => {
    console.log(userName);
  });
});

Cypress.Commands.add('clickButton', (text: string) => {
  cy.get('button')
    .contains(text)
    .should('exist')
    .click();
});

Cypress.Commands.add('buttonToContinue', (text: string, code: number, url: string, rest: string, alias:string) => {
  cy.intercept(rest, url).as(alias);
  cy.get('button')
    .contains(text)
    .should('exist')
    .click();
  cy.wait(`@${alias}`)
    .its('response.statusCode').should('eq', code);
});

Cypress.Commands.add('dialogButtonToContinue', (text: string, code: number, url: string, rest: string, alias:string) => {
  cy.intercept(rest, url).as(alias);
  cy.get('mat-dialog-actions button')
    .contains(text)
    .should('exist')
    .click();
  cy.wait(`@${alias}`)
    .its('response.statusCode').should('eq', code);
});

Cypress.Commands.add('loadModule', (filename:string, name:string) => {
  cy.get('input[type=file]')
    .selectFile(filename, {
      action: 'select',
      force: true
    });
  cy.contains(name)
    .should('exist');
});

Cypress.Commands.add('selectModule', (name:string) => {
  cy.get(`span:contains("${name}")`)
    .parent()
    .parent()
    .prev()
    .click();
});

Cypress.Commands.add('visitWs', (ws:string) => {
  cy.get(`a:contains("${ws}")`).click();
});

//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
