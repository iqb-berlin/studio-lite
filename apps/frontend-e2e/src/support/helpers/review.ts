import { selectCheckBox } from './common';
import { goToWsMenu } from './navigation';

/**
 * Navigates to the review administration view within a workspace
 */
export function goToReviewAdmin(): void {
  goToWsMenu();
  cy.get('[data-cy="workspace-edit-unit-review-admin"]')
    .should('be.visible')
    .click();
}

/**
 * Generic function to interact with a review row in the administration list
 * @param name - The name of the review
 * @param actionButtonDataCy - data-cy attribute of the action button
 * @param confirmKey - Optional translation key for a confirmation button in a dialog
 */
function interactWithReview(name: string, actionButtonDataCy: string, confirmKey?: string): void {
  cy.contains('mat-row', name)
    .should('exist')
    .click();
  cy.get(`[data-cy="${actionButtonDataCy}"]`)
    .should('be.visible')
    .click();

  if (confirmKey) {
    cy.translate(Cypress.expose('locale')).then(json => {
      // confirmKey could be a nested path or a simple key
      const translated = confirmKey.split('.')
        .reduce<unknown>((obj, key) => (obj as Record<string, unknown>)?.[key], json as Record<string, unknown>);
      const confirmText = typeof translated === 'string' ? translated : confirmKey;
      cy.get('button').contains(confirmText).click({ force: true });
    });
  }
}

/**
 * Creates a new unit review from the workspace admin menu
 * @param name - The name of the review
 * @param unitNames - Array of unit names to include in the review
 */
export function createReview(name: string, unitNames: string[]): void {
  cy.get('[data-cy="workspace-review-menu-add-review-button"]')
    .should('be.visible')
    .click();
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.get(`input[placeholder="${json.workspace['new-review-name']}"]`)
      .should('be.visible')
      .clear()
      .type(name);

    cy.get('.mat-mdc-dialog-component-host > .mat-mdc-dialog-actions').within(() => {
      cy.get('button').contains(json.workspace.save).click();
    });

    unitNames.forEach(unit => selectCheckBox(unit));

    cy.get('studio-lite-save-changes').within(() => {
      cy.get('button').contains(json.workspace.save).click();
    });
    cy.get('[data-cy="workspace-review-close"]').click();
  });
}

/**
 * Modifies the unit selection for an existing review
 * @param name - The name of the review to modify
 * @param unitNames - Array of unit names to select
 */
export function modifyReviewUnits(name: string, unitNames: string[]): void {
  cy.contains('mat-row', name).click();
  cy.intercept('PATCH', '/api/workspaces/*/reviews/*').as('updateReview');
  unitNames.forEach(unit => selectCheckBox(unit));
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.get('studio-lite-save-changes').within(() => {
      cy.get('button').contains(json.workspace.save).click();
    });
  });
  cy.wait('@updateReview');
  cy.get('[data-cy="workspace-review-close"]').click();
}

/**
 * Opens a review from the dashboard area
 * @param name - The name of the review to open
 */
export function openReview(name: string): void {
  cy.get('studio-lite-user-reviews-area').within(() => {
    // Invoke removeAttr target to open in same tab
    cy.contains('a', name)
      .invoke('removeAttr', 'target')
      .click();
  });
}

/**
 * Verifies the review metadata on the start page
 * @param name - Expected review name
 * @param workspaceName - Expected workspace name
 */
export function verifyReviewStartPage(name: string, workspaceName: string): void {
  cy.get('.start-page', { timeout: 15000 }).should('be.visible');
  cy.get('.start-data h1').should('contain', name);
  cy.get('.start-data h2').should('contain', workspaceName);
}

/**
 * Clicks the continue/start button on the review start page
 */
export function startReview(): void {
  cy.get('.continue-button a').invoke('removeAttr', 'target').click();
  // Ensure the player iframe loads
  cy.get('studio-lite-unit-player iframe', { timeout: 20000 }).should('be.visible');
}

/**
 * Exports a review from the workspace admin menu
 * @param name - The name of the review to export
 */
export function exportReview(name: string): void {
  interactWithReview(name, 'workspace-review-menu-export-review-button', 'unit-download.dialog.ok-button-label');
}

/**
 * Prints a review summary from the workspace admin menu
 * @param name - The name of the review to print
 */
export function printReview(name: string): void {
  interactWithReview(name, 'workspace-review-menu-print-review-button', 'workspace.print');
}

/**
 * Deletes a review from the workspace admin menu
 * @param name - The name of the review to delete
 */
export function deleteReview(name: string): void {
  interactWithReview(name, 'workspace-review-menu-delete-review-button', 'workspace.delete');
}
