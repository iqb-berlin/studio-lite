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
  after(() => deleteFirstUser());

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
      saveAndExpect('PATCH', '/api/admin/settings/config', 'saveConfig', 0);
    });

    it('saves application title and HTML content', () => {
      goToSettings();
      setFormControl('appTitle', 'IQB Studio Test');
      setFormControl('introHtml', '<p>Willkommen im Testsystem</p>');
      setFormControl('imprintHtml', '<p>Impressum Test</p>');
      saveAndExpect('PATCH', '/api/admin/settings/config', 'saveConfigFull', 0);
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
      saveAndExpect(
        'PATCH',
        '/api/admin/settings/config',
        'saveConfigWithDate',
        0
      );
    });

    it('displays the warning on the start page after logout', () => {
      logout();
      cy.visit('/');
      cy.get('studio-lite-warning').should(
        'contain.text',
        'System-Wartung am 01.01.2026'
      );

      // Log back in so that subsequent tests (which require admin access) can pass
      login(Cypress.expose('username'), Cypress.expose('password'));
    });

    it('clears the warning message and restores defaults', () => {
      goToSettings();
      clearFormControl('globalWarningText');
      clearFormControl('appTitle');
      clearFormControl('introHtml');
      clearFormControl('imprintHtml');
      saveAndExpect('PATCH', '/api/admin/settings/config', 'saveConfigClean', 0);
    });
  });

  // -------------------------------------------------------------------------
  describe('Logo and Colors card', () => {
    it('checks that the Colors card fields exist', () => {
      goToSettings();
      cy.get('[formcontrolname="bodyBackground"]').should('exist');
      cy.get('[formcontrolname="boxBackground"]').should('exist');
    });

    it('replaces the red to black logo', () => {
      goToSettings();
      cy.loadModule('iqb-logo-black.png');
      saveAndExpect('PATCH', '/api/admin/settings/app-logo', 'saveLogo', 2);
    });

    it('saves a custom application background color', () => {
      goToSettings();
      setFormControl('bodyBackground', '#f0f4f8');
      saveAndExpect('PATCH', '/api/admin/settings/app-logo', 'saveBackground', 2);
      cy.reload();
      cy.window().should(win => {
        const bodyBg = win.getComputedStyle(win.document.documentElement)
          .getPropertyValue('--st-body-background').trim();
        expect(bodyBg).to.eq('#f0f4f8');
      });
    });

    it('saves a custom box background color', () => {
      goToSettings();
      setFormControl('boxBackground', '#ffffff');
      saveAndExpect('PATCH', '/api/admin/settings/app-logo', 'saveBoxBackground', 2);
      cy.reload();
      cy.window().should(win => {
        const boxBg = win.getComputedStyle(win.document.documentElement)
          .getPropertyValue('--st-box-background').trim();
        expect(boxBg).to.eq('#ffffff');
      });
    });

    it('clears the color settings', () => {
      goToSettings();
      clearFormControl('bodyBackground');
      clearFormControl('boxBackground');
      saveAndExpect('PATCH', '/api/admin/settings/app-logo', 'originalBackground', 2);
      cy.reload();
      cy.window().should(win => {
        const bodyBg = win.getComputedStyle(win.document.documentElement)
          .getPropertyValue('--st-body-background').trim();
        expect(bodyBg).not.be.eq('#f0f4f8');
      });
    });
  });
});
