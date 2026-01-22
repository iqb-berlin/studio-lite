/**
 * User authentication and profile helper functions for Cypress E2E tests
 * Contains functions for login, logout, and user profile management
 */

import { UserData } from '../testData';
import { editInput } from './common';

/**
 * Logs in a user with username and password
 * @param username - Username
 * @param password - Password (defaults to empty string)
 * @example
 * login('testuser', '1234');
 */
export function login(username: string, password = ''): void {
  cy.visit('/');
  cy.login(username, password);
  cy.translate(Cypress.env('locale')).then(json => {
    cy.clickButtonWithResponseCheck(json.home.login, [201], '/api/login', 'POST', 'responseLogin');
  });
  cy.get('[data-cy="goto-user-menu"]').should('exist');
}

/**
 * Logs in with a specific user (logs out first if needed)
 * @param username - Username
 * @param pass - Password
 * @example
 * loginWithUser('testuser', '1234');
 */
export function loginWithUser(username: string, pass: string): void {
  cy.visit('/');
  logout();
  cy.wait(100);
  login(username, pass);
}

/**
 * Logs out the current user
 * @example
 * logout();
 */
export function logout(): void {
  cy.get('[data-cy="goto-user-menu"]').click();
  cy.get('[data-cy="user-menu-logout"]').click();
  cy.translate(Cypress.env('locale')).then(json => {
    cy.clickDialogButton(json.home.logout);
  });
  cy.get('[data-cy="home-imprint-button"]').should('exist');
}

/**
 * Changes the user's password
 * @param newPass - New password
 * @param oldPass - Current password
 * @example
 * changePassword('newpass123', 'oldpass123');
 */
export function changePassword(newPass: string, oldPass: string): void {
  cy.get('[data-cy="goto-user-menu"]').click();
  cy.get('[data-cy="user-menu-change-password"]').click();
  editInput('change-password-password', oldPass);
  editInput('change-password-new-password', newPass);
  editInput('change-password-new2-password', newPass);
  cy.clickDataCyWithResponseCheck('[data-cy="change-password-save"]',
    [200],
    '/api/password',
    'PATCH',
    'updatePass'
  );
}

/**
 * Updates the user's personal data
 * @param newData - User data to update
 * @example
 * updatePersonalData({
 *   username: 'user',
 *   password: 'pass',
 *   lastName: 'Doe',
 *   firstName: 'John',
 *   email: 'john@example.com'
 * });
 */
export function updatePersonalData(newData: UserData): void {
  cy.get('[data-cy="goto-user-menu"]').click();
  cy.get('[data-cy="user-menu-edit-my-data"]').click();
  editInput('edit-my-data-lastname', <string>newData.lastName);
  editInput('edit-my-data-firstname', <string>newData.firstName);
  editInput('edit-my-data-email', <string>newData.email);
  cy.clickDataCyWithResponseCheck('[data-cy="edit-my-data-save"]', [200], '/api/my-data', 'PATCH', 'updateData');
}
