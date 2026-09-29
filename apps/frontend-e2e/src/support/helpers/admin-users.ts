/**
 * Admin user-table helper functions for Cypress E2E tests.
 *
 * These helpers are shared between the regular user-management spec
 * (which reaches the same admin UI) and the dedicated admin-user-management
 * spec (which exercises additional admin-only flows like edit-user, admin
 * toggle, workspace-groups-menu, etc.).
 */

import { clickIndexTabAdmin } from './navigation';

/**
 * Navigate to the admin Users tab from the home page.
 * @example
 * goToAdminUsers();
 */
export function goToAdminUsers(): void {
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('users');
}

/**
 * Click a user row in the admin users mat-table.
 * @param username - The username whose row should be selected.
 * @example
 * selectUserRow('testuser');
 */
export function selectUserRow(username: string): void {
  cy.contains('mat-row', username).click();
}

/**
 * Type into the user-list search/filter input.
 * Supports both the data-cy selector used in the users-menu component
 * and the generic search-filter-input used in the workspaces table.
 * @param term - Text to filter by.
 * @example
 * filterUsers('adam');
 */
export function filterUsers(term: string): void {
  cy.get('[data-cy="admin-users-menu-filter"], [data-cy="search-filter-input"]')
    .first()
    .clear()
    .type(term);
}

/**
 * Clear the user-list search/filter input.
 * @example
 * clearUserFilter();
 */
export function clearUserFilter(): void {
  cy.get('[data-cy="admin-users-menu-filter"], [data-cy="search-filter-input"]')
    .first()
    .clear();
}

/**
 * Save a user edit form and wait for the PATCH /api/admin/users/* response.
 * @param alias - cy.intercept alias (must be unique per test).
 * @example
 * saveUserEdit('updateEmail');
 */
export function saveUserEdit(alias: string): void {
  cy.clickDataCyWithResponseCheck(
    '[data-cy="admin-edit-user-button"]',
    [200],
    '/api/admin/users/*',
    'PATCH',
    alias
  );
}
