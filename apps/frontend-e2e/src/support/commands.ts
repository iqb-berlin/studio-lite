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
    buttonToContinue(text: string, code: number, url: string, rest: string, alias: string):void;
    dialogButtonToContinue(text: string, code: number, url: string, rest: string, alias: string):void;
    loadModule(filename: string, name: string):void;
    selectModule(name: string):void;
    visitWs(ws:string):void;
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
