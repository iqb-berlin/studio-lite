/**
 * Common utility functions for Cypress E2E tests
 * Contains shared helper functions used across multiple modules
 */

/**
 * Waits for an intercepted request and asserts that it succeeded: any 2xx, and for a GET also
 * 304, which the browser answers from its cache when the same resource is loaded again (#1745).
 * @param alias - Alias of the intercept, with the leading '@'
 * @example
 * cy.intercept('PATCH', '/api/workspaces/*\/settings').as('saveSettings');
 * waitForSuccess('@saveSettings');
 */
export function waitForSuccess(alias: string): void {
  cy.wait(alias).then(({ request, response }) => {
    const status = response?.statusCode;
    const ok = (status !== undefined && status >= 200 && status < 300) ||
      (request.method === 'GET' && status === 304);
    expect(ok, `${request.method} ${request.url} answered ${status}`).to.equal(true);
  });
}

/**
 * Selects a checkbox for a unit in the unit list
 * @param name - Unit name to select
 * @example
 * selectCheckBox('Unit 1');
 */
export function selectCheckBox(name: string): void {
  cy.get(`[data-cy="workspace-select-unit-list-checkbox-${name}"]`).click();
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
