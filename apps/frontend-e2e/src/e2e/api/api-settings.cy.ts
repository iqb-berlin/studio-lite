import { UnitExport } from '../../support/testData';
import { noId, userGroupAdmin } from '../../support/util-api';

describe('Admin settings API tests', () => {
  const unitExport: UnitExport = {
    unitXsdUrl: 'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Unit.xsd',
    bookletXsdUrl: 'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Booklet.xsd',
    testTakersXsdUrl: 'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Testtakers.xsd'
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
  after(() => {
    cy.deleteUsersAPI([Cypress.expose(`id_${userGroupAdmin.username}`)],
      Cypress.expose(`token_${Cypress.expose('username')}`))
      .then(resp => {
        expect(resp.status).to.equal(200);
      });
    cy.deleteUsersAPI([Cypress.expose(`id_${Cypress.expose('username')}`)],
      Cypress.expose(`token_${Cypress.expose('username')}`))
      .then(resp => {
        Cypress.expose('token_admin', '');
        expect(resp.status).to.equal(200);
      });
    // cy.resetDb();
  });

  describe('100. GET /api/admin/settings/config', () => {
    it('200 positive test: should successfully retrieve the current configuration ' +
      'text settings for an administrator', () => {
      cy.getSettingConfigAPI(Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should successfully retrieve the configuration ' +
      'text settings for a regular user profile', () => {
      cy.getSettingConfigAPI(Cypress.expose(`id_${userGroupAdmin.username}`))
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

  describe('101. UPDATE /api/admin/settings/config', () => {
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
    });

    it('401 negative test: should deny configuration updates when no ' +
      'authentication token is provided', () => {
      cy.updateSettingConfigAPI(noId, 17)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should deny configuration updates to a user ' +
      'without administrator privileges', () => {
      cy.updateSettingConfigAPI(Cypress.expose(`token_${userGroupAdmin.username}`), 17)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('102. GET /api/admin/settings/app-logo', () => {
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

  describe('103. UPDATE /api/admin/settings/app-logo', () => {
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

    it('401 negative test: should deny brand setting updates to a user ' +
      'with regular account permissions', () => {
      cy.updateSettingLogoAPI(Cypress.expose(`token_${userGroupAdmin.username}`), 'Gelb')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('104. GET /api/admin/settings/unit-export-config', () => {
    it('200 positive test: should successfully retrieve unit export ' +
      'configuration parameters for an administrator', () => {
      cy.getSettingLogoAPI(Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should successfully retrieve unit export ' +
      'configuration for a user with standard profile', () => {
      cy.getSettingUnitExportAPI(Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
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

  describe('105. UPDATE /api/admin/settings/unit-export-config', () => {
    it('200 positive test: should allow an authorized administrator to update unit ' +
      'export validation parameters', () => {
      unitExport.unitXsdUrl = 'https://github.com/iqb-berlin/testcenter/blob/master/vo_Unit.xsd';
      cy.updateSettingUnitExportAPI(Cypress.expose(`token_${Cypress.expose('username')}`), unitExport)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      unitExport.unitXsdUrl = 'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Unit.xsd';
      cy.updateSettingUnitExportAPI(Cypress.expose(`token_${Cypress.expose('username')}`), unitExport)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should deny unit export configuration updates to a user with regular permissions', () => {
      unitExport.unitXsdUrl = 'https://github.com/iqb-berlin/testcenter/blob/master/vo_Unit.xsd';
      cy.updateSettingUnitExportAPI(Cypress.expose(`token_${userGroupAdmin.username}`), unitExport)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should deny unit export configuration updates ' +
      'when providing an invalid user identifier', () => {
      unitExport.unitXsdUrl = 'https://github.com/iqb-berlin/testcenter/blob/master/vo_Unit.xsd';
      cy.updateSettingUnitExportAPI(noId, unitExport)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('106. GET /api/admin/settings/missings-profiles ', () => {
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

  describe('107. UPDATE /api/admin/settings/missings-profiles ', () => {
    it('200 positive test: should allow an authorized administrator to successfully ' +
      'update the missing value profile definitions', () => {
      // eslint-disable-next-line max-len
      const profile = '[{"id":"missing_by_intention","label":"missing by intention","description":"(1) Item wurde gesehen (2a) Item wurde nicht bearbeitet oder (2b) wurde bearbeitet, aber wieder zurückgesetzt und (3) es gibt nachfolgend Items, die bearbeitet wurden","code":-99},{"id":"missing_not_reached","label":"missing not reached","description":"(1a) Item wurde nicht gesehen oder (1b) Item wurde gesehen und nicht bearbeitet und (2) es folgen nur Items mit demselben Status","code":-96},{"id":"missing_invalid_response","label":"missing invalid response","description":"(1) Item wurde bearbeitet und (2a) leere Antwort oder (2b) sonstwie ungültige (Spaß-)Antwort","code":-98},{"id":"missing_coding_impossible","label":"missing coding impossible","description":"(1) Item müsste/könnte bearbeitet worden sein und (2) Antwort ist aufgrund technischer Probleme nicht auswertbar","code":-97},{"id":"missing_by_design","label":"missing by design","description":"Antwort liegt nicht vor, weil das Item der Testperson planmäßig nicht präsentiert wurde","code":-94}]';
      cy.updateSettingMissingProfilesAPI(Cypress.expose(`token_${Cypress.expose('username')}`), profile)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should deny profile definition updates to a regular user account', () => {
      cy.updateSettingMissingProfilesAPI(Cypress.expose(`token_${userGroupAdmin.username}`), '')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should deny profile definition updates when no authentication token is provided', () => {
      cy.updateSettingMissingProfilesAPI(noId, '')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });
});
