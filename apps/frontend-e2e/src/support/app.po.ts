// TypeScript with Cypress
/// <reference types="cypress" />

// export const getAppTitle = () => cy.get('.page-title > div');
export const getAppTitle = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.get('.page-title > div');

// Function to check if a button is clickable
export const isButtonClickable = (selector: string): Cypress.Chainable<boolean> => cy.get(selector).then($button => {
  const isVisible = $button.is(':visible');
  const isEnabled = !$button.is(':disabled');
  const isClickable = isVisible && isEnabled;
  return isClickable;
});
