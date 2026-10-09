// -- This is a parent command --
import Chainable = Cypress.Chainable;

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
  (text: string, code: number[], url: string, rest: string, alias: string) => {
    cy.intercept(rest, url).as(alias);
    cy.get('button').contains(text).should('exist').click({ force: true });
    cy.wait(`@${alias}`)
      .its('response.statusCode').should('be.oneOf', code);
  });

Cypress.Commands.add('clickDataCyWithResponseCheck',
  (data_cy: string, code: number[], url: string, rest: string, alias: string) => {
    cy.intercept(rest, url).as(alias);
    cy.get(data_cy).should('exist').click({ force: true });
    cy.wait(`@${alias}`).its('response.statusCode').should('be.oneOf', code);
  });

Cypress.Commands.add('clickDialogButtonWithResponseCheck',
  (text: string, code: number[], url: string, rest: string, alias: string) => {
    cy.intercept(rest, url)
      .as(alias);
    cy.get('mat-dialog-actions button')
      .contains(text)
      .should('exist')
      .click({ force: true });
    cy.wait(`@${alias}`)
      .its('response.statusCode')
      .should('be.oneOf', code);
  });

Cypress.Commands.add('findAdminGroupSettings', (group: string): Chainable<JQuery<HTMLElement>> => {
  cy.visit('/');
  return cy.get(`[data-cy="home-group-settings-${group}"]`);
});

Cypress.Commands.add('findAdminSettings', (): Chainable<JQuery<HTMLElement>> => cy.get('[data-cy="goto-admin"]'));

Cypress.Commands.add('loadModule', (filename: string) => {
  const path: string = `../frontend-e2e/src/fixtures/${filename}`;
  cy.get('input[type=file]')
    .selectFile(path, {
      action: 'select',
      force: true
    });
});

Cypress.Commands.add('selectModule', (name: string) => {
  cy.get('mat-row')
    .filter(`:contains("${name}")`)
    .find('mat-checkbox')
    .click({ multiple: true });
});

Cypress.Commands.add('visitWs', (ws: string) => {
  cy.visit('/');
  // The workspace's link is followed by its address, not clicked: home draws its list anew when its
  // own auth-data request answers, and a click on the link being replaced went nowhere -- no units
  // were ever requested (#1781). The address is the same before and after. Once home keeps its
  // links (#1822), this can click again.
  cy.get(`studio-lite-user-workspaces-groups a.issue-item:contains("${ws}")`)
    .should('have.length', 1)
    .should('have.attr', 'href')
    .and('match', /^#\/a\/\d+$/)
    .then(href => {
      cy.intercept('GET', '**/workspaces/*/units*').as('getUnits');
      cy.visit(`/${href}`);
    });
  cy.wait('@getUnits');
  cy.get('[data-cy="workspace-unit-selection-filter-units"]').should('be.visible');
});

Cypress.Commands.add('runUntracked', fn => {
  cy.then(() => {
    fn();
  });
});

Cypress.Commands.add('resetDb', () => cy.task('resetDatabase') as Cypress.Chainable<void>);

Cypress.Commands.add('translate', (language: string): Chainable => {
  const path: string = `../../../frontend/src/assets/i18n/${language}`;
  return cy.fixture(path);
});

Cypress.Commands.add('getIFrameBody', selector => cy.get(selector)
  .its('0.contentDocument.body')
  .should('not.be.empty')
  .then(cy.wrap)
);
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
