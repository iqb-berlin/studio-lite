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

  // The address may name the language; German is written without a prefix, so the address loses it
  // and every link from before stays as it was (#2175). After the visit above this is a change of the
  // hash, not a new page (testIsolation is off); the router reads and writes it the same way.
  it('opens an address with a language prefix and writes it without the prefix for German', () => {
    cy.visit('/#/de/about');

    cy.get('studio-lite-about [data-cy="home-button"]').should('be.visible');
    cy.location('hash').should('eq', '#/about');
  });

  // The menu reloads the page under the prefix of the language chosen, and back without one (#2178).
  it('switches to English in the header and back to German', () => {
    cy.visit('/#/about');
    cy.translate('en').then(english => {
      cy.get('[data-cy="language-menu"]').click();
      cy.get('[data-cy="language-en"]').click();

      cy.location('hash').should('eq', '#/en/about');
      cy.get('html').should('have.attr', 'lang', 'en');
      cy.get('studio-lite-about [data-cy="home-button"]').should('have.text', english.home['home-page']);
    });

    cy.get('[data-cy="language-menu"]').click();
    cy.get('[data-cy="language-de"]').click();

    cy.location('hash').should('eq', '#/about');
    cy.get('html').should('have.attr', 'lang', 'de');
  });

  // A link with the prefix, loaded as a page: another path than before, so that it is not a hash change.
  it('opens a link with the English prefix in English', () => {
    cy.visit('/index.html#/en/about');

    cy.get('html').should('have.attr', 'lang', 'en');
    cy.location('hash').should('eq', '#/en/about');
  });
});
