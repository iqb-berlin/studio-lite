import { addFirstUser, deleteFirstUser, logout } from '../../../support/helpers';

/**
 * A login without a sessionId creates a session row, and the frontend keeps the tokens of
 * the last response only -- so a second call leaves behind a session nobody can reach or
 * log out, and it lives out the whole inactivity window (#1617).
 *
 * This has to run in a browser: pressing Enter in a text field submits the form by way of
 * the HTML implicit submission, which jsdom does not implement. A unit test therefore sees
 * one call where the browser made two, which is exactly how the doubling stayed unnoticed.
 */
describe('Login form', () => {
  before(() => {
    addFirstUser();
  });

  after(() => {
    deleteFirstUser();
  });

  const enterCredentials = (): void => {
    cy.get('[data-cy="home-user-name"]').should('exist').clear().type(Cypress.expose('username'));
    cy.get('[data-cy="home-password"]').should('exist').clear().type(Cypress.expose('password'));
  };

  let logins = 0;

  beforeEach(() => {
    logins = 0;
    cy.intercept('POST', '/api/login', req => {
      logins += 1;
      req.continue();
    }).as('loginRequest');
    cy.visit('/');
    logout();
  });

  it('should send one login when Enter submits the form', () => {
    cy.get('[data-cy="home-user-name"]').should('exist').clear().type(Cypress.expose('username'));
    cy.get('[data-cy="home-password"]').should('exist').clear()
      .type(`${Cypress.expose('password')}{enter}`);

    cy.wait('@loginRequest');
    cy.get('[data-cy="goto-user-menu"]').should('exist');
    cy.then(() => {
      expect(logins).to.equal(1);
    });
  });

  it('should send one login when the button is clicked twice', () => {
    enterCredentials();
    cy.get('[data-cy="home-submit-button"]').dblclick();

    cy.wait('@loginRequest');
    cy.get('[data-cy="goto-user-menu"]').should('exist');
    cy.then(() => {
      expect(logins).to.equal(1);
    });
  });
});
