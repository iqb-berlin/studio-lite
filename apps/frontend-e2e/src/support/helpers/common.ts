/**
 * Common utility functions for Cypress E2E tests
 * Contains shared helper functions used across multiple modules
 */

/**
 * Clicks the save button (handles single or multiple save buttons)
 * @example
 * clickSaveButtonRight();
 */
export function clickSaveButtonRight(): void {
  cy.get('mat-icon:contains("save")').then($elements => {
    if ($elements.length === 1) {
      cy.get('mat-icon:contains("save")').click();
    } else {
      cy.get('mat-icon:contains("save")').eq(1).click();
    }
  });
}

/**
 * Selects a checkbox for a unit in the unit list
 * @param name - Unit name to select
 * @example
 * selectCheckBox('Unit 1');
 */
export function selectCheckBox(name: string): void {
  cy.get('studio-lite-select-unit-list').within(() => {
    cy.get(`mat-cell:contains("${name}")`)
      .prev()
      .click();
  });
}

/**
 * Edits an input field if content is provided
 * @param data - data-cy attribute value
 * @param content - Content to type into the field
 * @example
 * editInput('admin-edit-user-username', 'testuser');
 */
export function editInput(data: string, content: string | undefined): void {
  if (content != null && content !== '') {
    cy.get(`[data-cy="${data}"]`)
      .should('exist')
      .type(content, { force: true });
  }
}

/**
 * Adds a status/state to a workspace
 * @param statusName - Name of the status
 * @param position - Position index of the status
 * @example
 * addStatus('In Progress', 0);
 */
export function addStatus(statusName: string, position: number): void {
  cy.get('[data-cy="wsg-admin-states-add-state-button"]').click();
  cy.get('div.state').eq(position).find('input[type="text"]').click()
    .type(statusName);
}
