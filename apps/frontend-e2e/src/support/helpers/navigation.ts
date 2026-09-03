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
 * Navigates to the wsg-admin Workspaces tab and selects a workspace row.
 * Waits for the user list (roles-header) to be visible, ensuring the async
 * GET for users has completed before the caller proceeds.
 * @param ws - Workspace name to click
 * @example
 * openWsTab('Workspace 1');
 */
export function openWsTab(ws: string): void {
  clickIndexTabWsgAdmin('workspaces');
  cy.contains('mat-row', ws).click();
  cy.get('studio-lite-roles-header').should('be.visible');
}

/**
 * Navigates to the wsg-admin Users tab and selects a user row.
 * Waits for the workspace list (roles-header) to be visible, ensuring the async
 * GET for workspaces has completed before the caller proceeds.
 * @param username - Username to click
 * @example
 * openUsersTab('normaluser');
 */
export function openUsersTab(username: string): void {
  clickIndexTabWsgAdmin('users');
  cy.contains('mat-row', username).click();
  cy.get('studio-lite-roles-header').should('be.visible');
}
