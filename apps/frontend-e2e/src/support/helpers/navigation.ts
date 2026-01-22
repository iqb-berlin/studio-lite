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
  cy.wait(200);
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
