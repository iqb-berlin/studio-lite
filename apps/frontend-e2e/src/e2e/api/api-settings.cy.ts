export interface UnitExport {
  unitXsdUrl: string;
  bookletXsdUrl: string;
  testTakersXsdUrl: string;
}
describe('Admin settings API tests', () => {
  const noId: string = '9988';
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
      });
  });
  after(() => {
    cy.deleteFirstUserAPI().then(resp => {
      Cypress.env('token_admin', '');
      expect(resp.status).to.equal(200);
    });
  });
  describe('100. GET /api/admin/settings/config', () => {
    it('200 positive test', () => {
      cy.getSettingConfigAPI(Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
    it('200/401 negative test', () => {
      cy.getSettingConfigAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
  });
  describe('101. UPDATE /api/admin/settings/config', () => {
    it('200 positive test', () => {
      cy.updateSettingConfigAPI(Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      cy.pause();
    });
    it('200/401 negative test', () => {
      const authorization = `bearer ${Cypress.env(`token_${Cypress.env('username')}`)}`;
      cy.request({
        method: 'PATCH',
        url: '/api/admin/settings/config',
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          appTitle: 'IQB-Studio',
          globalWarningExpiredHour: 0,
          globalWarningExpiredDay: '2024-12-03T12:14:37.507Z'
        }
      })
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      cy.pause();
    });
  });
  describe('102. GET /api/admin/settings/app-logo', () => {
    it('200 positive test', () => {
      cy.getSettingLogoAPI(Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
    it('200/401 negative test', () => {
      cy.getSettingLogoAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
  });
  describe('103. UPDATE /api/admin/settings/app-logo', () => {
    // Set the background to colour red
    it('200 positive test', () => {
      cy.updateSettingLogoAPI(Cypress.env(`token_${Cypress.env('username')}`), 'Red')
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
    it('200 positive test', () => {
      // Set the background to the original colour
      cy.updateSettingLogoAPI(Cypress.env(`token_${Cypress.env('username')}`), '')
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
  });
  describe('104. GET /api/admin/settings/unit-export-config', () => {
    it('200 positive test', () => {
      cy.getSettingLogoAPI(Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
    it('200/401 negative test', () => {
      cy.getSettingUnitExportAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
  });
  describe('105. UPDATE /api/admin/settings/unit-export-config', () => {
    it('200 positive test', () => {
      unitExport.unitXsdUrl = 'https://github.com/iqb-berlin/testcenter/blob/master/vo_Unit.xsd';
      cy.updateSettingUnitExportAPI(Cypress.env(`token_${Cypress.env('username')}`), unitExport)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      cy.pause();
    });
    it('200 positive test', () => {
      unitExport.unitXsdUrl = 'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Unit.xsd';
      cy.updateSettingUnitExportAPI(Cypress.env(`token_${Cypress.env('username')}`), unitExport)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      cy.pause();
    });
    it('200/401 negative test', () => {
      cy.getSettingUnitExportAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
  });

  describe('106. GET /api/admin/settings/missings-profiles ', () => {
    it('200 positive test', () => {
      cy.getSettingMissingProfilesAPI(Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      cy.pause();
    });
    it('401 negative test', () => {

    });
  });

  describe('107. GET /api/admin/settings/missings-profiles ', () => {
    it('200 positive test', () => {
      // eslint-disable-next-line max-len
      const profile = '[{"id":"missing_by_intention","label":"missing by intention","description":"(1) Item wurde gesehen (2a) Item wurde nicht bearbeitet oder (2b) wurde bearbeitet, aber wieder zurückgesetzt und (3) es gibt nachfolgend Items, die bearbeitet wurden","code":-99},{"id":"missing_not_reached","label":"missing not reached","description":"(1a) Item wurde nicht gesehen oder (1b) Item wurde gesehen und nicht bearbeitet und (2) es folgen nur Items mit demselben Status","code":-96},{"id":"missing_invalid_response","label":"missing invalid response","description":"(1) Item wurde bearbeitet und (2a) leere Antwort oder (2b) sonstwie ungültige (Spaß-)Antwort","code":-98},{"id":"missing_coding_impossible","label":"missing coding impossible","description":"(1) Item müsste/könnte bearbeitet worden sein und (2) Antwort ist aufgrund technischer Probleme nicht auswertbar","code":-97},{"id":"missing_by_design","label":"missing by design","description":"Antwort liegt nicht vor, weil das Item der Testperson planmäßig nicht präsentiert wurde","code":-94}]';
      cy.updateSettingMissingProfilesAPI(Cypress.env(`token_${Cypress.env('username')}`), profile)
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      cy.pause();
    });
    it('401 negative test', () => {

    });
  });
});
