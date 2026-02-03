/**
 * Metadata helper functions for Cypress E2E tests
 * Contains functions for managing items and variables
 */

/**
 * Creates a new item in a unit
 * @param itemId - Item ID to create
 * @example
 * createItem('01');
 */
export function createItem(itemId: string): void {
  cy.get('.add-button > .mdc-button__label').click();
  cy.get('[data-cy="metadata-new-item-button"]').click();
  cy.translate(Cypress.env('locale')).then(json => {
    cy.get(`mat-expansion-panel:contains("${json.metadata['without-id']}")`).click();
    cy.get('mat-label:contains("Item ID")').eq(-1).type(itemId);
  });
}

/**
 * Assigns a variable to an item
 * @param variableName - Variable name to assign (empty string to unassign)
 * @example
 * assignVariableToItem('text-field_1');
 * assignVariableToItem(''); // Unassign
 */
export function assignVariableToItem(variableName: string): void {
  cy.translate(Cypress.env('locale')).then(json => {
    cy.get(`mat-select[placeholder="${json.metadata['choose-item-variable']}"]`)
      .eq(-1)
      .find('svg')
      .click();
  });
  cy.get(`mat-option:contains("${variableName}")`).eq(0).click();
}
