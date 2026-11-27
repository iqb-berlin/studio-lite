import { UnitExport } from '../../support/testData';
import { noId, userGroupAdmin } from '../../support/util-api';

describe('Admin settings API tests', () => {
  const unitExport: UnitExport = {
    unitXsdUrl: 'https://w3id.org/iqb/spec/unit-xml/17.6',
    bookletXsdUrl: 'https://w3id.org/iqb/spec/testcenter-booklet-xml/18.0',
    testTakersXsdUrl: 'https://w3id.org/iqb/spec/testcenter-testtaker-xml/18.0'
  };
  before(() => {
    cy.addFirstUserAPI(Cypress.expose('username'), Cypress.expose('password'))
      .then(resp => {
        Cypress.expose(`token_${Cypress.expose('username')}`, resp.body.accessToken);
        expect(resp.status).to.equal(201);
        cy.getUserIdAPI(Cypress.expose(`token_${Cypress.expose('username')}`))
          .then(resp2 => {
            Cypress.expose(`id_${Cypress.expose('username')}`, resp2.body.userId);
            expect(resp2.status).to.equal(200);
          });
        cy.createUserAPI(userGroupAdmin, Cypress.expose(`token_${Cypress.expose('username')}`))
          .then(res => {
            Cypress.expose(`id_${userGroupAdmin.username}`, res.body);
            expect(res.status).to.equal(201);
            cy.loginAPI(userGroupAdmin.username, userGroupAdmin.password)
              .then(resp3 => {
                Cypress.expose(`token_${userGroupAdmin.username}`, resp3.body.accessToken);
                expect(resp3.status).to.equal(201);
              });
          });
      });
  });

  // 104 and 105 change the unit export config, which outlasts the reset before each spec: it is
  // read before them and written back after. Without a stored one, the defaults the API answers are.
  let storedUnitExport: UnitExport | undefined;
  before(() => {
    cy.getSettingUnitExportAPI(Cypress.expose(`token_${Cypress.expose('username')}`)).then(resp => {
      expect(resp.status, 'stored unit export config').to.equal(200);
      storedUnitExport = resp.body;
    });
  });

  after(() => {
    if (storedUnitExport) {
      cy.updateSettingUnitExportAPI(Cypress.expose(`token_${Cypress.expose('username')}`), storedUnitExport)
        .its('status').should('equal', 200);
    }
  });

  describe('100. GET /api/settings/config', () => {
    it('200 positive test: should successfully retrieve the current configuration ' +
      'text settings for an administrator', () => {
      cy.getSettingConfigAPI(Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should successfully retrieve the configuration ' +
      'text settings for a regular user profile', () => {
      cy.getSettingConfigAPI(Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should return default configuration settings ' +
      'when no authentication token is provided', () => {
      cy.getSettingConfigAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
  });

  // A frontend from before #1216, still open after the update, asks the old paths; only 521 makes it
  // show the reload prompt. The current version is sent to show that the answer does not depend on it.
  describe('/api/admin/* and /api/group-admin/* (frontends before #1216)', () => {
    [
      ['GET', '/api/admin/settings/config'],
      ['PATCH', '/api/group-admin/users/1/workspaces']
    ].forEach(([method, url]) => {
      it(`521 negative test: should tell a frontend that sends ${method} ${url} to reload`, () => {
        cy.request({
          method,
          url,
          headers: { 'app-version': Cypress.expose('version') },
          failOnStatusCode: false
        })
          .then(resp => {
            expect(resp.status).to.equal(521);
          });
      });
    });
  });

  describe('101. UPDATE /api/settings/config', () => {
    it('200 positive test: should allow an authorized administrator ' +
      'to update the system configuration settings', () => {
      cy.updateSettingConfigAPI(Cypress.expose(`token_${Cypress.expose('username')}`), 17)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      cy.updateSettingConfigAPI(Cypress.expose(`token_${Cypress.expose('username')}`), 0)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      // each text once per language (#2186)
      cy.getSettingConfigAPI(noId)
        .then(resp => {
          expect(resp.body.appTitle).to.deep.equal({ de: 'IQB-Studio' });
          expect(resp.body.globalWarningText).to.deep.equal({ de: 'Warnung Achtung 2', en: 'Warning 2' });
        });
    });

    // A frontend from before the texts had languages, still open after the update, sends plain strings (#2186)
    it('200 positive test: should store a text sent as a plain string as the German one', () => {
      const token = Cypress.expose(`token_${Cypress.expose('username')}`);
      // expired, as the command above leaves it, so that no later spec sees the warning
      cy.patchSettingConfigAPI({
        appTitle: 'IQB-Studio',
        globalWarningText: 'Warnung',
        globalWarningExpiredDay: new Date(),
        globalWarningExpiredHour: '0',
        hasUsers: true
      }, token)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      cy.getSettingConfigAPI(noId)
        .then(resp => {
          expect(resp.body.appTitle).to.deep.equal({ de: 'IQB-Studio' });
          expect(resp.body.globalWarningText).to.deep.equal({ de: 'Warnung' });
          expect(resp.body.introHtml).to.deep.equal({});
        });
    });

    it('401 negative test: should deny configuration updates when no ' +
      'authentication token is provided', () => {
      cy.updateSettingConfigAPI(noId, 17)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('403 negative test: should deny configuration updates to a user ' +
      'without administrator privileges', () => {
      cy.updateSettingConfigAPI(Cypress.expose(`token_${userGroupAdmin.username}`), 17)
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });
  });

  describe('102. GET /api/settings/app-logo', () => {
    it('200 positive test: should successfully retrieve application logo and ' +
      'color settings for an administrator', () => {
      cy.getSettingLogoAPI(Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should successfully retrieve application logo and ' +
      'color settings for a regular user', () => {
      cy.getSettingLogoAPI(Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should publicly provide application logo and ' +
      'color settings even without authentication', () => {
      cy.getSettingLogoAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
  });

  describe('103. UPDATE /api/settings/app-logo', () => {
    it('200 positive test: should allow an authorized administrator to ' +
      'update the application logo and brand colors', () => {
      // Set the background to the color red
      cy.updateSettingLogoAPI(Cypress.expose(`token_${Cypress.expose('username')}`), 'Red')
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      // Set the background to the original colour

      cy.updateSettingLogoAPI(Cypress.expose(`token_${Cypress.expose('username')}`), '')
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should deny brand setting updates when providing an invalid user identifier', () => {
      cy.updateSettingLogoAPI(noId, 'Gelb')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('403 negative test: should deny brand setting updates to a user ' +
      'with regular account permissions', () => {
      cy.updateSettingLogoAPI(Cypress.expose(`token_${userGroupAdmin.username}`), 'Gelb')
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });
  });

  describe('104. GET /api/settings/unit-export-config', () => {
    // a known value, and not the default the API answers when none is stored
    const known: UnitExport = {
      unitXsdUrl: 'https://w3id.org/iqb/spec/unit-xml/17.4',
      bookletXsdUrl: 'https://w3id.org/iqb/spec/testcenter-booklet-xml/18.0',
      testTakersXsdUrl: 'https://w3id.org/iqb/spec/testcenter-testtaker-xml/18.0'
    };

    before(() => {
      cy.updateSettingUnitExportAPI(Cypress.expose(`token_${Cypress.expose('username')}`), known)
        .its('status').should('equal', 200);
    });

    it('200 positive test: should successfully retrieve unit export ' +
      'configuration parameters for an administrator', () => {
      cy.getSettingUnitExportAPI(Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body).to.deep.equal(known);
        });
    });

    it('200 positive test: should successfully retrieve unit export ' +
      'configuration for a user with standard profile', () => {
      cy.getSettingUnitExportAPI(Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body).to.deep.equal(known);
        });
    });

    it('401 negative test: should deny access to unit export configuration ' +
      'when no valid credentials are provided', () => {
      cy.getSettingUnitExportAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('105. UPDATE /api/settings/unit-export-config', () => {
    it('200 positive test: should allow an authorized administrator to update unit ' +
      'export validation parameters', () => {
      unitExport.unitXsdUrl = 'https://w3id.org/iqb/spec/unit-xml/17.4';
      cy.updateSettingUnitExportAPI(Cypress.expose(`token_${Cypress.expose('username')}`), unitExport)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      unitExport.unitXsdUrl = 'https://w3id.org/iqb/spec/unit-xml/17.6';
      cy.updateSettingUnitExportAPI(Cypress.expose(`token_${Cypress.expose('username')}`), unitExport)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('403 negative test: should deny unit export configuration updates to a user with regular permissions', () => {
      unitExport.unitXsdUrl = 'https://w3id.org/iqb/spec/unit-xml/17.4';
      cy.updateSettingUnitExportAPI(Cypress.expose(`token_${userGroupAdmin.username}`), unitExport)
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('401 negative test: should deny unit export configuration updates ' +
      'when providing an invalid user identifier', () => {
      unitExport.unitXsdUrl = 'https://w3id.org/iqb/spec/unit-xml/17.4';
      cy.updateSettingUnitExportAPI(noId, unitExport)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('106. GET /api/settings/missings-profiles ', () => {
    it('200 positive test: should successfully retrieve the configuration ' +
      'for missing value profiles as an administrator', () => {
      cy.getSettingMissingProfilesAPI(Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should successfully retrieve missing value profiles ' +
      'for a user with standard account access', () => {
      cy.getSettingMissingProfilesAPI(Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should deny access to missing value profiles when no valid ' +
      'authentication token is provided', () => {
      cy.getSettingMissingProfilesAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('107. UPDATE /api/settings/missings-profiles ', () => {
    it('200 positive test: should allow an authorized administrator to successfully ' +
      'update the missing value profile definitions', () => {
      const profile = JSON.stringify([
        {
          id: 'missing_by_intention',
          label: 'missing by intention',
          description: '(1) Item wurde gesehen (2a) Item wurde nicht bearbeitet oder (2b) wurde bearbeitet, aber ' +
            'wieder zurückgesetzt und (3) es gibt nachfolgend Items, die bearbeitet wurden',
          code: -99
        },
        {
          id: 'missing_not_reached',
          label: 'missing not reached',
          description: '(1a) Item wurde nicht gesehen oder (1b) Item wurde gesehen und nicht bearbeitet und (2) es ' +
            'folgen nur Items mit demselben Status',
          code: -96
        },
        {
          id: 'missing_invalid_response',
          label: 'missing invalid response',
          description: '(1) Item wurde bearbeitet und (2a) leere Antwort oder (2b) sonstwie ungültige (Spaß-)Antwort',
          code: -98
        },
        {
          id: 'missing_coding_impossible',
          label: 'missing coding impossible',
          description: '(1) Item müsste/könnte bearbeitet worden sein und (2) Antwort ist aufgrund technischer ' +
            'Probleme nicht auswertbar',
          code: -97
        },
        {
          id: 'missing_by_design',
          label: 'missing by design',
          description: 'Antwort liegt nicht vor, weil das Item der Testperson planmäßig nicht präsentiert wurde',
          code: -94
        }
      ]);
      cy.updateSettingMissingProfilesAPI(Cypress.expose(`token_${Cypress.expose('username')}`), profile)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('403 negative test: should deny profile definition updates to a regular user account', () => {
      cy.updateSettingMissingProfilesAPI(Cypress.expose(`token_${userGroupAdmin.username}`), '')
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('401 negative test: should deny profile definition updates when no authentication token is provided', () => {
      cy.updateSettingMissingProfilesAPI(noId, '')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  // where the levels of a unit's size begin, read in the workspace and set by an administrator (#2229)
  describe('108. GET and PATCH /api/settings/unit-validation', () => {
    const adminToken = () => Cypress.expose(`token_${Cypress.expose('username')}`);
    const defaults = { sizeLevels: { mediumFromKb: 200, largeFromKb: 1024, veryLargeFromKb: 5120 } };
    const sizeLevels = { mediumFromKb: 100, largeFromKb: 500, veryLargeFromKb: 2000 };

    // the settings outlast the reset before each spec: the next one starts with the defaults
    after(() => {
      cy.patchSettingUnitValidationAPI(defaults, adminToken()).its('status').should('equal', 200);
    });

    it('200 positive test: should store the size levels an administrator sets, for every user to read', () => {
      cy.patchSettingUnitValidationAPI({ sizeLevels }, adminToken()).its('status').should('equal', 200);
      cy.getSettingUnitValidationAPI(Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body).to.deep.equal({ sizeLevels });
        });
    });

    it('400 negative test: should refuse size levels that do not rise, and keep the stored ones', () => {
      cy.patchSettingUnitValidationAPI(
        { sizeLevels: { ...sizeLevels, veryLargeFromKb: 400 } },
        adminToken()
      ).its('status').should('equal', 400);
      cy.getSettingUnitValidationAPI(adminToken()).its('body').should('deep.equal', { sizeLevels });
    });

    it('403 negative test: should deny size level updates to a user without admin privileges', () => {
      cy.patchSettingUnitValidationAPI(defaults, Cypress.expose(`token_${userGroupAdmin.username}`))
        .its('status').should('equal', 403);
    });

    it('401 negative test: should deny reading and updating the size levels without a valid token', () => {
      cy.getSettingUnitValidationAPI(noId).its('status').should('equal', 401);
      cy.patchSettingUnitValidationAPI(defaults, noId).its('status').should('equal', 401);
    });
  });

  // The texts of the mail a user is sent; each in its own languages, as the config texts (#2186)
  describe('111. GET and PATCH /api/settings/email-template', () => {
    const adminToken = () => Cypress.expose(`token_${Cypress.expose('username')}`);
    let stored: object | undefined;

    before(() => {
      cy.getEmailTemplateAPI(adminToken()).then(resp => {
        expect(resp.status).to.equal(200);
        stored = resp.body;
      });
    });

    // Settings outlast the reset before each spec. Only what was read is written back: a PATCH
    // without a body would store an empty setting in its place.
    after(() => {
      if (stored) cy.patchEmailTemplateAPI(stored, adminToken()).its('status').should('equal', 200);
    });

    it('200 positive test: should hand back the texts an administrator saved', () => {
      const template = {
        emailSubject: { de: 'Betreff', en: 'Subject' },
        emailBody: { de: 'Text', en: 'Text in English' }
      };
      cy.patchEmailTemplateAPI(template, adminToken()).its('status').should('equal', 200);
      cy.getEmailTemplateAPI(adminToken()).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body).to.deep.equal(template);
      });
    });

    // A frontend from before the texts had languages, still open after the update, sends plain strings
    it('200 positive test: should store a text sent as a plain string as the German one', () => {
      cy.patchEmailTemplateAPI({ emailSubject: 'Betreff', emailBody: 'Text' }, adminToken())
        .its('status').should('equal', 200);
      cy.getEmailTemplateAPI(adminToken()).then(resp => {
        expect(resp.body).to.deep.equal({ emailSubject: { de: 'Betreff' }, emailBody: { de: 'Text' } });
      });
    });

    it('403 negative test: should keep the template from a user without administrator privileges', () => {
      const userToken = Cypress.expose(`token_${userGroupAdmin.username}`);
      cy.getEmailTemplateAPI(userToken).its('status').should('equal', 403);
      cy.patchEmailTemplateAPI({ emailSubject: { de: 'x' }, emailBody: { de: 'x' } }, userToken)
        .its('status').should('equal', 403);
    });
  });

  // Where the metadata profiles are listed. Every user reads it, only an administrator sets it.
  describe('112. GET and PATCH /api/settings/profiles-registry', () => {
    const adminToken = () => Cypress.expose(`token_${Cypress.expose('username')}`);
    let stored: { csvUrl: string } | undefined;

    before(() => {
      cy.getProfilesRegistryAPI(adminToken()).then(resp => {
        expect(resp.status).to.equal(200);
        stored = resp.body;
      });
    });

    after(() => {
      if (stored) cy.patchProfilesRegistryAPI(stored, adminToken()).its('status').should('equal', 200);
    });

    it('200 positive test: should give a user without administrator privileges what an administrator set', () => {
      const registry = { csvUrl: 'https://example.org/registry-2239.csv' };
      cy.patchProfilesRegistryAPI(registry, adminToken()).its('status').should('equal', 200);
      cy.getProfilesRegistryAPI(Cypress.expose(`token_${userGroupAdmin.username}`)).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body).to.deep.equal(registry);
      });
    });

    it('403 negative test: should not let a user without administrator privileges set it', () => {
      cy.patchProfilesRegistryAPI(
        { csvUrl: 'https://example.org/other.csv' },
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).its('status').should('equal', 403);
    });

    it('401 negative test: should not hand it out without a login', () => {
      cy.getProfilesRegistryAPI(noId).its('status').should('equal', 401);
    });
  });

  // The tags of a unit's notes: what a group configures, else what the administrator configured.
  // Given as tags, not as vocabulary URLs, so that nothing has to be fetched.
  describe('113./114. /api/settings/unit-rich-note-tags and unit-rich-note-tags-config', () => {
    const adminToken = () => Cypress.expose(`token_${Cypress.expose('username')}`);
    const tag = (id: string) => ({ id, label: [{ lang: 'de', value: `Schlagwort ${id}` }] });
    const globalTags = [tag('global-2239')];
    const groupTags = [tag('group-2239')];
    const groups = { withTags: '', withoutTags: '' };
    let stored: string[] | object[] | undefined;

    before(() => {
      cy.getRichNoteTagsConfigAPI(adminToken()).then(resp => {
        expect(resp.status).to.equal(200);
        stored = resp.body;
      });
      cy.createGroupAPI({ id: '', name: 'Gruppe mit Schlagworten' }, adminToken(), { richNoteTags: groupTags })
        .then(resp => {
          expect(resp.status).to.equal(201);
          groups.withTags = String(resp.body);
        });
      cy.createGroupAPI({ id: '', name: 'Gruppe ohne Schlagworte' }, adminToken()).then(resp => {
        expect(resp.status).to.equal(201);
        groups.withoutTags = String(resp.body);
      });
      cy.patchRichNoteTagsConfigAPI(globalTags, adminToken()).its('status').should('equal', 200);
    });

    after(() => {
      if (stored) cy.patchRichNoteTagsConfigAPI(stored, adminToken()).its('status').should('equal', 200);
    });

    it('200 positive test: should hand an administrator back the tags configured', () => {
      cy.getRichNoteTagsConfigAPI(adminToken()).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body).to.deep.equal(globalTags);
      });
    });

    it('200 positive test: should give a user the configured tags when no group is named', () => {
      cy.getRichNoteTagsAPI(Cypress.expose(`token_${userGroupAdmin.username}`)).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body).to.deep.equal(globalTags);
      });
    });

    it('200 positive test: should give the tags of a group that has its own', () => {
      cy.getRichNoteTagsAPI(Cypress.expose(`token_${userGroupAdmin.username}`), groups.withTags).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body).to.deep.equal(groupTags);
      });
    });

    it('200 positive test: should give the configured tags for a group without its own', () => {
      cy.getRichNoteTagsAPI(Cypress.expose(`token_${userGroupAdmin.username}`), groups.withoutTags).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body).to.deep.equal(globalTags);
      });
    });

    it('403 negative test: should keep the configuration from a user without administrator privileges', () => {
      const userToken = Cypress.expose(`token_${userGroupAdmin.username}`);
      cy.getRichNoteTagsConfigAPI(userToken).its('status').should('equal', 403);
      cy.patchRichNoteTagsConfigAPI([tag('x')], userToken).its('status').should('equal', 403);
    });
  });
});
