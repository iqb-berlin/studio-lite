/// <reference types="cypress" />
import { getAppTitle } from '../../../support/app.po';

describe('Application', () => {
  beforeEach(() => cy.visit('/'));

  it('displays IQB-Studio title', () => {
    // Custom command example, see `../support/commands.ts` file
    // cy.login('my-email@something.com', 'myPassword');

    // Function helper example, see `../support/app.po.ts` file
    getAppTitle().contains('IQB-Studio');
  });
});

// Without the visit above: an address the page is loaded with, not one the hash changes to.
describe('Language in the address', () => {
  // The address may name the language; German is written without a prefix, so the address loses it
  // and every link from before stays as it was (#2175).
  it('opens an address with a language prefix and writes it without the prefix for German', () => {
    cy.visit('/#/de/about');

    cy.get('studio-lite-about [data-cy="home-button"]').should('be.visible');
    cy.location('hash').should('eq', '#/about');
  });
});
