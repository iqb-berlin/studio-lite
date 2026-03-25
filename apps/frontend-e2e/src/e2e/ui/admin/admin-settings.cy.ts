import {
  addFirstUser,
  clearFormControl,
  deleteFirstUser,
  goToSettings,
  saveAndExpect,
  setFormControl,
  logout,
  login,
  createGroup, deleteGroup
} from '../../../support/helpers';
import { group1 } from '../../../support/testData';

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
      saveAndExpect(
        'PATCH',
        '/api/admin/settings/config',
        'saveConfigClean',
        0
      );
    });
  });

  // -------------------------------------------------------------------------
  describe('Email Template card', () => {
    it('displays the Email Template fields', () => {
      goToSettings();
      cy.get('[formcontrolname="emailSubject"]').should('exist');
      cy.get('[formcontrolname="emailBody"]').should('exist');
    });

    it('saves a custom email template', () => {
      goToSettings();
      setFormControl('emailSubject', 'Welcome to Studio Lite!');
      cy.get('[formcontrolname="emailBody"]')
        .should('exist')
        .clear({ force: true })
        .type('Dear {{user}},\n\nWelcome to Studio Lite.', { force: true, parseSpecialCharSequences: false });
      saveAndExpect(
        'PATCH',
        '/api/admin/settings/email-template',
        'saveEmailTemplate',
        1
      );
    });

    it('clears the email template fields', () => {
      goToSettings();
      clearFormControl('emailSubject');
      clearFormControl('emailBody');
      saveAndExpect(
        'PATCH',
        '/api/admin/settings/email-template',
        'clearEmailTemplate',
        1
      );
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
      saveAndExpect(
        'PATCH',
        '/api/admin/settings/app-logo',
        'saveBackground',
        2
      );
      cy.reload();
      cy.window().should(win => {
        const bodyBg = win
          .getComputedStyle(win.document.documentElement)
          .getPropertyValue('--st-body-background')
          .trim();
        expect(bodyBg).to.eq('#f0f4f8');
      });
    });

    it('saves a custom box background color', () => {
      goToSettings();
      setFormControl('boxBackground', '#ffffff');
      saveAndExpect(
        'PATCH',
        '/api/admin/settings/app-logo',
        'saveBoxBackground',
        2
      );
      cy.reload();
      cy.window().should(win => {
        const boxBg = win
          .getComputedStyle(win.document.documentElement)
          .getPropertyValue('--st-box-background')
          .trim();
        expect(boxBg).to.eq('#ffffff');
      });
    });

    it('clears the color settings', () => {
      goToSettings();
      clearFormControl('bodyBackground');
      clearFormControl('boxBackground');
      saveAndExpect(
        'PATCH',
        '/api/admin/settings/app-logo',
        'originalBackground',
        2
      );
      cy.reload();
      cy.window().should(win => {
        const bodyBg = win
          .getComputedStyle(win.document.documentElement)
          .getPropertyValue('--st-body-background')
          .trim();
        expect(bodyBg).not.be.eq('#f0f4f8');
      });
    });
  });

  describe('Unit Export Config card', () => {
    const unitXsdUrl =
      'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Unit.xsd';
    const bookletXsdUrl =
      'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Booklet.xsd';
    const testTakersXsdUrl =
      'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Testtakers.xsd';

    it('displays the Unit Export Config fields', () => {
      goToSettings();
      cy.get('[formcontrolname="unitXsdUrl"]').should('exist');
      cy.get('[formcontrolname="bookletXsdUrl"]').should('exist');
      cy.get('[formcontrolname="testTakersXsdUrl"]').should('exist');
    });

    it('clears the XSD URL fields', () => {
      goToSettings();
      clearFormControl('unitXsdUrl');
      clearFormControl('bookletXsdUrl');
      clearFormControl('testTakersXsdUrl');
      saveAndExpect(
        'PATCH',
        '/api/admin/settings/unit-export-config',
        'clearUnitExport',
        3
      );
    });

    it('saves the three XSD URL parameters', () => {
      goToSettings();
      setFormControl('unitXsdUrl', unitXsdUrl);
      setFormControl('bookletXsdUrl', bookletXsdUrl);
      setFormControl('testTakersXsdUrl', testTakersXsdUrl);
      saveAndExpect(
        'PATCH',
        '/api/admin/settings/unit-export-config',
        'saveUnitExport',
        3
      );
    });
  });

  // -------------------------------------------------------------------------
  describe('Profiles Registry card', () => {
    const testUrl = 'https://raw.githubusercontent.com/iqb-vocabs/profile-registry/refs/heads/master/test-registry.csv';
    const originalUrl =
      'https://raw.githubusercontent.com/iqb-vocabs/profile-registry/master/registry.csv';
    it('displays the Profiles Registry CSV URL field', () => {
      goToSettings();
      cy.get('[formcontrolname="csvUrl"]').should('exist');
    });

    it('clears the profiles registry URL', () => {
      goToSettings();
      clearFormControl('csvUrl');
      saveAndExpect(
        'PATCH',
        '/api/admin/settings/profiles-registry',
        'clearRegistry',
        4
      );
    });

    it('saves a profiles registry CSV URL', () => {
      goToSettings();
      setFormControl('csvUrl', testUrl);
      saveAndExpect(
        'PATCH',
        '/api/admin/settings/profiles-registry',
        'saveRegistry',
        4
      );
    });

    it('checks that the we have only two registry stores with the test registry', () => {
      // create a group workspace
      createGroup(group1);

      // checks that we have only two profiles
      cy.get('mat-table').contains(group1).click();
      cy.get('[data-cy="workspaces-groups-menu-edit"]').click();
      cy.get('studio-lite-profiles')
        .get('mat-expansion-panel').should('have.length', 2);
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.contains('button', json.cancel).click();
      });

      // deletes group
      deleteGroup(group1);
    });

    it('restores the original profile registry CSV URL', () => {
      goToSettings();
      setFormControl('csvUrl', originalUrl);
      saveAndExpect(
        'PATCH',
        '/api/admin/settings/profiles-registry',
        'saveRegistry',
        4
      );
    });
  });

  // -------------------------------------------------------------------------
  describe('Missings Profiles card', () => {
    const validJson =
      '[{"id":"missing_by_intention","label":"missing by intention","description":"","code":-99}]';

    it('displays the Missings Profiles IQB-Standard field', () => {
      goToSettings();
      cy.get('[formcontrolname="iqbStandardMissings"]').should('exist');
    });

    it('sets the original valid IQB-standard missings profile JSON', () => {
      goToSettings();
      clearFormControl('iqbStandardMissings');
      cy.get('[formcontrolname="iqbStandardMissings"]')
        .type(validJson, { parseSpecialCharSequences: false, delay: 0 });
      saveAndExpect(
        'PATCH',
        '/api/admin/settings/missings-profiles',
        'saveMissings',
        5
      );
    });

    it('sets an empty missings profile', () => {
      goToSettings();
      setFormControl('iqbStandardMissings', '[]');
      saveAndExpect(
        'PATCH',
        '/api/admin/settings/missings-profiles',
        'clearMissings',
        5
      );
    });
  });
});
