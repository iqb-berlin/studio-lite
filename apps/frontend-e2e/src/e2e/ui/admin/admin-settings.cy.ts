import {
  addFirstUser,
  clearFormControl,
  deleteFirstUser,
  goToSettings,
  saveAndExpect,
  setFormControl,
  logout,
  login
} from '../../../support/helpers';

describe('Admin Settings Tab Configuration', () => {
  before(() => addFirstUser());
  after(() => {
    deleteFirstUser();
    cy.resetDb();
  });

  // -------------------------------------------------------------------------
  describe('App Config – Texts card', () => {
    it('displays the Texts card fields', () => {
      goToSettings();
      cy.get('[formcontrolname="globalWarningText"]').should('exist');
      cy.get('[formcontrolname="appTitle"]').should('exist');
      cy.get('[formcontrolname="introHtml"]').should('exist');
      cy.get('[formcontrolname="imprintHtml"]').should('exist');
    });

    it('saves a start-page warning message', () => {
      goToSettings();
      setFormControl('globalWarningText', 'System-Wartung am 01.01.2026');
      saveAndExpect('PATCH', '/api/admin/settings/config', 'saveConfig');
    });

    it('saves application title and HTML content', () => {
      goToSettings();
      setFormControl('appTitle', 'IQB Studio Test');
      setFormControl('introHtml', '<p>Willkommen im Testsystem</p>');
      setFormControl('imprintHtml', '<p>Impressum Test</p>');
      saveAndExpect('PATCH', '/api/admin/settings/config', 'saveConfigFull');
    });

    it('sets a warning expiration time to a day after today', () => {
      goToSettings();
      setFormControl('globalWarningText', 'System-Wartung am 01.01.2026');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const day = String(tomorrow.getDate()).padStart(2, '0');
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const year = tomorrow.getFullYear();

      setFormControl('globalWarningExpiredDay', `${day}.${month}.${year}`);
      saveAndExpect('PATCH', '/api/admin/settings/config', 'saveConfigWithDate');
    });

    it('displays the warning on the start page after logout', () => {
      logout();
      cy.visit('/');
      cy.get('studio-lite-warning').should('contain.text', 'System-Wartung am 01.01.2026');

      // Log back in so that subsequent tests (which require admin access) can pass
      login(Cypress.env('username'), Cypress.env('password'));
    });

    it('clears the warning message and restores defaults', () => {
      goToSettings();
      clearFormControl('globalWarningText');
      clearFormControl('appTitle');
      clearFormControl('introHtml');
      clearFormControl('imprintHtml');
      saveAndExpect('PATCH', '/api/admin/settings/config', 'saveConfigClean');
    });
  });
});
