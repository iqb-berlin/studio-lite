import { Interception } from 'cypress/types/net-stubbing';
import { selectCheckBox, waitForSuccess } from './common';
import { goToWsMenu } from './navigation';

/**
 * Waits until the review admin shows the selected review: its name in the settings and as many
 * checked units as it has. Only then does a click in the unit list count -- the review arriving
 * later sets the selection anew and undoes it. Waiting for the GET is not enough, since it ends
 * when the answer passes Cypress, before the app has applied it (#1726).
 * @param name - The name of the review
 * @param unitCount - The number of units the review has so far
 */
function waitForReviewShown(name: string, unitCount: number): void {
  cy.get('[data-cy="workspace-review-config-name"]').should('have.value', name);
  cy.get('[data-cy^="workspace-select-unit-list-checkbox-"] input:checked')
    .should('have.length', unitCount);
}

/**
 * The workspace and review id of an intercepted request to `/api/workspaces/:id/reviews/:id`, and
 * the token of the user logged in.
 * @param alias - Alias of the intercepted request
 */
function reviewOfRequest(alias: string): Cypress.Chainable<{ wsId: string, reviewId: string, token: string }> {
  return cy.get<Interception>(alias).then(({ request }) => {
    const [, wsId, reviewId] = new URL(request.url).pathname.match(/\/workspaces\/(\d+)\/reviews\/(\d+)/) || [];
    return cy.window().then(win => ({ wsId, reviewId, token: win.localStorage.getItem('id_token') || '' }));
  });
}

/**
 * The units the review admin holds for the review behind an intercepted request. Asked directly:
 * the app's own GET may come back as 304 without a body.
 * @param alias - Alias of an intercepted request to `/api/workspaces/:id/reviews/:id`
 */
function requestReviewUnits(alias: string): Cypress.Chainable<number[]> {
  return reviewOfRequest(alias)
    .then(({ wsId, reviewId, token }) => cy.getReviewAPI(wsId, reviewId, token))
    .then(resp => {
      expect(resp.status, 'status of the review').to.equal(200);
      return resp.body.units as number[];
    });
}

/**
 * Checks what the save behind `alias` stored: the units it sent, and the units the API returns for
 * the review afterwards -- to the review admin, and to a reviewer, as the tests that play the review
 * see it. A save answered with 2xx can still have lost a unit, and those tests then fail far from
 * the cause (#1726).
 * @param alias - Alias of the intercepted PATCH of the review
 * @param unitCount - The number of units the review should have
 */
function expectSavedReviewUnits(alias: string, unitCount: number): void {
  cy.get<Interception>(alias).then(({ request }) => {
    expect(request.body.units, 'units sent with the save').to.have.length(unitCount);
  });
  requestReviewUnits(alias).then(units => {
    expect(units, 'units of the review after the save').to.have.length(unitCount);
  });
  reviewOfRequest(alias)
    .then(({ reviewId, token }) => cy.getReviewAsReviewerAPI(reviewId, token))
    .then(resp => {
      expect(resp.status, 'status of the review for a reviewer').to.equal(200);
      expect(resp.body.units, 'units a reviewer gets after the save').to.have.length(unitCount);
    });
}

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
  // Selecting the row triggers an async GET for the review's full data. The
  // action buttons (e.g. export) stay disabled until that data — including the
  // unit list — has arrived, so wait for the response before clicking, otherwise
  // the click lands on a still-disabled button and the dialog never opens.
  cy.intercept('GET', '/api/workspaces/*/reviews/*').as('getReviewInteraction');
  cy.contains('mat-row', name)
    .should('exist')
    .click();
  cy.wait('@getReviewInteraction');
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
  // Both requests are awaited WITH a status assertion: a silently failed save
  // used to leave the review without its units and surface three specs later
  // as an inexplicable navigation failure (#1597).
  cy.intercept('POST', '/api/workspaces/*/reviews').as('createReview');
  cy.intercept('PATCH', '/api/workspaces/*/reviews/*').as('saveNewReviewUnits');
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
    waitForSuccess('@createReview');
    waitForReviewShown(name, 0);

    unitNames.forEach(unit => selectCheckBox(unit));

    cy.get('studio-lite-save-changes').within(() => {
      cy.get('button').contains(json.workspace.save).click();
    });
    waitForSuccess('@saveNewReviewUnits');
    expectSavedReviewUnits('@saveNewReviewUnits', unitNames.length);
    cy.get('[data-cy="workspace-review-close"]').click();
  });
}

/**
 * Adds units to an existing review
 * @param name - The name of the review to modify
 * @param unitNames - Names of the units to add; none of them may be in the review yet
 */
export function modifyReviewUnits(name: string, unitNames: string[]): void {
  cy.intercept('GET', '/api/workspaces/*/reviews/*').as('getReviewForModify');
  cy.contains('mat-row', name).click();
  cy.wait('@getReviewForModify');
  requestReviewUnits('@getReviewForModify').then(({ length: unitsBefore }) => {
    waitForReviewShown(name, unitsBefore);
    cy.intercept('PATCH', '/api/workspaces/*/reviews/*').as('updateReview');
    unitNames.forEach(unit => selectCheckBox(unit));
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('studio-lite-save-changes').within(() => {
        cy.get('button').contains(json.workspace.save).click();
      });
    });
    // A lost unit used to pass here and break the two navigation tests that follow (#1597, #1726).
    waitForSuccess('@updateReview');
    expectSavedReviewUnits('@updateReview', unitsBefore + unitNames.length);
  });
  cy.get('[data-cy="workspace-review-close"]').click();
}

/**
 * Saves the configuration of the review opened in the review admin and waits for the API response,
 * so that closing the admin or logging out right after cannot cancel the request (#1743)
 */
export function saveReviewConfig(): void {
  cy.intercept('PATCH', '/api/workspaces/*/reviews/*').as('saveReviewConfig');
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.get('studio-lite-save-changes').within(() => {
      cy.get('button').contains(json.workspace.save).click();
    });
  });
  waitForSuccess('@saveReviewConfig');
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
