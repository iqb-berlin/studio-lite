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

Cypress.Commands.add('clickButton', (text: string) => {
  cy.get('button')
    .contains(text)
    .should('exist')
    .click();
});

Cypress.Commands.add('buttonToContinue',
  (text: string, code: number, url: string, rest: string, alias:string) => {
    cy.intercept(rest, url).as(alias);
    cy.get('button')
      .contains(text)
      .should('exist')
      .click();
    cy.wait(`@${alias}`)
      .its('response.statusCode').should('eq', code);
  });

Cypress.Commands.add('dialogButtonToContinue',
  (text: string, code: number, url: string, rest: string, alias:string) => {
    cy.intercept(rest, url)
      .as(alias);
    cy.get('mat-dialog-actions button')
      .contains(text)
      .should('exist')
      .click();
    cy.wait(`@${alias}`)
      .its('response.statusCode')
      .should('eq', code);
  });

Cypress.Commands.add('loadModule', (filename:string) => {
  const path:string = `../frontend-e2e/src/fixtures/${filename}`;
  const name = filename.replace(/-+(?=[^-\d]*\d)/, '@').replace(/...html$/, '');
  cy.get('input[type=file]')
    .selectFile(path, {
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
