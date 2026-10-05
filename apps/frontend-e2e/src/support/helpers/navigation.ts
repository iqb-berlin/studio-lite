/**
 * Navigation helper functions for Cypress E2E tests
 * Contains functions for navigating between tabs and menus
 */

/**
 * Clicks a tab in the workspace group admin interface
 * @param tabName - Tab name: 'users', 'workspaces', 'units', or 'settings'
 * @example
 * clickIndexTabWsgAdmin('users');
 */
export function clickIndexTabWsgAdmin(tabName: string): void {
  cy.get(`[data-cy="wsg-admin-routes-${tabName}"]`).click();
}

/**
 * Clicks a tab in the workspace interface
 * @param tabName - Tab name: 'properties', 'editor', 'preview', 'schemer', or 'comments'
 * @example
 * clickIndexTabWorkspace('comments');
 */
export function clickIndexTabWorkspace(tabName: string): void {
  cy.get(`[data-cy="workspace-routes-${tabName}"]`).click();
}

/**
 * Clicks a tab in the admin interface
 * @param tabName - Tab name: 'users', 'workspace-groups', 'workspaces', 'units', 'v-modules', 'settings', or 'packages'
 * @example
 * clickIndexTabAdmin('workspace-groups');
 */
export function clickIndexTabAdmin(tabName: string): void {
  cy.get(`[data-cy="admin-tab-${tabName}"]`).click();
}

/**
 * Opens the workspace menu (three-dot menu)
 * @example
 * goToWsMenu();
 * cy.get('[data-cy="workspace-edit-unit-settings"]').click();
 */
export function goToWsMenu(): void {
  cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
}

/**
 * Navigates to a specific item in the unit
 * @param itemId - The item ID to navigate to
 * @example
 * goToItem('01');
 */
export function goToItem(itemId: string): void {
  cy.get(`studio-lite-item:contains("${itemId}")`).click();
}

/**
 * Waits until the radio buttons of the access-rights panel accept input. The panel disables
 * them while the rights of the selected row load, so this is the moment those rights arrived.
 */
function waitForAccessRights(): void {
  cy.get('studio-lite-roles-header').should('be.visible');
  cy.get('[data-cy="access-rights-row"] input[type="radio"]')
    .first()
    .should('be.enabled');
}

/**
 * Navigates to the wsg-admin Workspaces tab and selects a workspace row.
 * Waits until the rights of that workspace have arrived before the caller proceeds.
 * @param ws - Workspace name to click
 * @example
 * openWsTab('Workspace 1');
 */
export function openWsTab(ws: string): void {
  clickIndexTabWsgAdmin('workspaces');
  cy.contains('mat-row', ws).click();
  waitForAccessRights();
}

/**
 * Navigates to the wsg-admin Users tab and selects a user row.
 * Waits until the rights of that user have arrived before the caller proceeds.
 * @param username - Username to click
 * @example
 * openUsersTab('normaluser');
 */
export function openUsersTab(username: string): void {
  clickIndexTabWsgAdmin('users');
  cy.contains('mat-row', username).click();
  waitForAccessRights();
}
