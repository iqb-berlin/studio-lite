// -- This is a parent command --

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.get('[data-cy="home-user-name"]')
    .should('exist')
    .clear()
    .type(username);
  cy.get('[data-cy="home-password"]')
    .should('exist')
    .clear()
    .type(password);
});

Cypress.Commands.add('clickButton', (buttonName: string) => {
  cy.get('button')
    .contains(buttonName)
    .should('exist')
    .click();
});

Cypress.Commands.add('clickDialogButton', (buttonName: string) => {
  cy.get('mat-dialog-actions button')
    .contains(buttonName)
    .should('exist')
    .click();
});

Cypress.Commands.add('clickButtonWithResponseCheck',
  (text: string, code: number[], url: string, rest: string, alias:string) => {
    cy.intercept(rest, url).as(alias);
    cy.get('button')
      .contains(text)
      .should('exist')
      .click();
    cy.wait(`@${alias}`)
      .its('response.statusCode').should('be.oneOf', code);
  });

Cypress.Commands.add('clickDialogButtonWithResponseCheck',
  (text: string, code: number[], url: string, rest: string, alias:string) => {
    cy.intercept(rest, url)
      .as(alias);
    cy.get('mat-dialog-actions button')
      .contains(text)
      .should('exist')
      .click();
    cy.wait(`@${alias}`)
      .its('response.statusCode')
      .should('be.oneOf', code);
  });

Cypress.Commands.add('findAdminGroupSettings', (group:string) => {
  cy.get('studio-lite-user-workspaces-groups')
    .get(`div>div>div>div:contains("${group}")`)
    .parent()
    .contains('mat-icon', 'settings');
});

Cypress.Commands.add('findAdminSettings', () => {
  cy.get('[data-cy="goto-admin"]');
});

Cypress.Commands.add('loadModule', (filename:string) => {
  const path:string = `../frontend-e2e/src/fixtures/${filename}`;
  const name = filename.replace(/-+(?=[^-\d]*\d)/, '@').replace(/...html$/, '');
  cy.get('input[type=file]')
    .selectFile(path, {
      action: 'select',
      force: true
    });
  cy.contains('mat-row', name)
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

Cypress.Commands.add('runUntracked', fn => {
  cy.then(() => {
    fn();
  });
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
