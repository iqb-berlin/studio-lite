import { UserData, UnitExport } from '../../support/testData';

describe('Admin settings API tests', () => {
  const noId: string = '9988';
  const user2: UserData = {
    username: 'userzwei',
    password: 'paso',
    isAdmin: false
  };
  const unitExport: UnitExport = {
    unitXsdUrl: 'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Unit.xsd',
    bookletXsdUrl: 'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Booklet.xsd',
    testTakersXsdUrl: 'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Testtakers.xsd'
  };
  before(() => {
    cy.addFirstUserAPI(Cypress.env('username'), Cypress.env('password'))
      .then(resp => {
        Cypress.env(`token_${Cypress.env('username')}`, resp.body);
        expect(resp.status).to.equal(201);
        cy.getUserIdAPI(Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp2 => {
            Cypress.env(`id_${Cypress.env('username')}`, resp2.body.userId);
            expect(resp2.status).to.equal(200);
          });
        cy.createUserAPI(user2, Cypress.env(`token_${Cypress.env('username')}`))
          .then(res => {
            Cypress.env(`id_${user2.username}`, res.body);
            expect(res.status).to.equal(201);
            cy.loginAPI(user2.username, user2.password)
              .then(resp3 => {
                Cypress.env(`token_${user2.username}`, resp3.body);
                expect(resp3.status).to.equal(201);
              });
          });
      });
  });
  after(() => {
    cy.deleteUsersAPI([Cypress.env(`id_${user2.username}`)], Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        expect(resp.status).to.equal(200);
      });
    cy.deleteUsersAPI([Cypress.env(`id_${Cypress.env('username')}`)], Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        Cypress.env('token_admin', '');
        expect(resp.status).to.equal(200);
      });
  });

  describe('100. GET /api/admin/settings/config', () => {
    it('200 positive test: should get the configuration text settings the admin', () => {
      cy.getSettingConfigAPI(Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should get the configuration text settings a normal user', () => {
      cy.getSettingConfigAPI(Cypress.env(`id_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should get configuration settings without token', () => {
      cy.getSettingConfigAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
  });

  describe('101. UPDATE /api/admin/settings/config', () => {
    it('200 positive test: should update the configuration text settings the admin', () => {
      cy.updateSettingConfigAPI(Cypress.env(`token_${Cypress.env('username')}`), 17)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      cy.updateSettingConfigAPI(Cypress.env(`token_${Cypress.env('username')}`), 0)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should not update the configuration text settings without token', () => {
      cy.updateSettingConfigAPI(noId, 17)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should not update the configuration text settings a normal user', () => {
      cy.updateSettingConfigAPI(Cypress.env(`token_${user2.username}`), 17)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('102. GET /api/admin/settings/app-logo', () => {
    it('200 positive test: should get the configuration logo-color settings the admin ', () => {
      cy.getSettingLogoAPI(Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should get the configuration logo-color settings a normal user', () => {
      cy.getSettingLogoAPI(Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should get configuration logo-color settings a non user', () => {
      cy.getSettingLogoAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
  });

  describe('103. UPDATE /api/admin/settings/app-logo', () => {
    it('200 positive test: should update the configuration logo-color settings the admin', () => {
      // Set the background to the color red
      cy.updateSettingLogoAPI(Cypress.env(`token_${Cypress.env('username')}`), 'Red')
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      // Set the background to the original colour

      cy.updateSettingLogoAPI(Cypress.env(`token_${Cypress.env('username')}`), '')
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should not update the configuration logo-color settings a non user', () => {
      cy.updateSettingLogoAPI(noId, 'Gelb')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should not update the configuration logo-color settings a normal user', () => {
      cy.updateSettingLogoAPI(Cypress.env(`token_${user2.username}`), 'Gelb')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('104. GET /api/admin/settings/unit-export-config', () => {
    it('200 positive test: should get the configuration unit export settings the admin', () => {
      cy.getSettingLogoAPI(Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should get the configuration unit export settings a normal user', () => {
      cy.getSettingUnitExportAPI(Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should not get the configuration unit export settings a non user', () => {
      cy.getSettingUnitExportAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('105. UPDATE /api/admin/settings/unit-export-config', () => {
    it('200 positive test: should update the configuration unit export parameters the admin', () => {
      unitExport.unitXsdUrl = 'https://github.com/iqb-berlin/testcenter/blob/master/vo_Unit.xsd';
      cy.updateSettingUnitExportAPI(Cypress.env(`token_${Cypress.env('username')}`), unitExport)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      unitExport.unitXsdUrl = 'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Unit.xsd';
      cy.updateSettingUnitExportAPI(Cypress.env(`token_${Cypress.env('username')}`), unitExport)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should not update the configuration unit export parameters a normal user', () => {
      unitExport.unitXsdUrl = 'https://github.com/iqb-berlin/testcenter/blob/master/vo_Unit.xsd';
      cy.updateSettingUnitExportAPI(Cypress.env(`token_${user2.username}`), unitExport)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should not update the configuration unit export parameters a non user', () => {
      unitExport.unitXsdUrl = 'https://github.com/iqb-berlin/testcenter/blob/master/vo_Unit.xsd';
      cy.updateSettingUnitExportAPI(noId, unitExport)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('106. GET /api/admin/settings/missings-profiles ', () => {
    it('200 positive test: should get the configuration missing profile settings the admin', () => {
      cy.getSettingMissingProfilesAPI(Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should get the configuration missing profile setting a normal user', () => {
      cy.getSettingMissingProfilesAPI(Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should not get the configuration missing profile setting a non user', () => {
      cy.getSettingMissingProfilesAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('107. UPDATE /api/admin/settings/missings-profiles ', () => {
    it('200 positive test: should update the configuration missing profiles the admin', () => {
      // eslint-disable-next-line max-len
      const profile = '[{"id":"missing_by_intention","label":"missing by intention","description":"(1) Item wurde gesehen (2a) Item wurde nicht bearbeitet oder (2b) wurde bearbeitet, aber wieder zurückgesetzt und (3) es gibt nachfolgend Items, die bearbeitet wurden","code":-99},{"id":"missing_not_reached","label":"missing not reached","description":"(1a) Item wurde nicht gesehen oder (1b) Item wurde gesehen und nicht bearbeitet und (2) es folgen nur Items mit demselben Status","code":-96},{"id":"missing_invalid_response","label":"missing invalid response","description":"(1) Item wurde bearbeitet und (2a) leere Antwort oder (2b) sonstwie ungültige (Spaß-)Antwort","code":-98},{"id":"missing_coding_impossible","label":"missing coding impossible","description":"(1) Item müsste/könnte bearbeitet worden sein und (2) Antwort ist aufgrund technischer Probleme nicht auswertbar","code":-97},{"id":"missing_by_design","label":"missing by design","description":"Antwort liegt nicht vor, weil das Item der Testperson planmäßig nicht präsentiert wurde","code":-94}]';
      cy.updateSettingMissingProfilesAPI(Cypress.env(`token_${Cypress.env('username')}`), profile)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should not update the configuration missing profiles a normal user ', () => {
      cy.updateSettingMissingProfilesAPI(Cypress.env(`token_${user2.username}`), '')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test should not update the configuration missing profiles a non user ', () => {
      cy.updateSettingMissingProfilesAPI(noId, '')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });
});
