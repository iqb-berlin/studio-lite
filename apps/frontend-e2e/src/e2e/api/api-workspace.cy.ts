import {
  deleteFirstUserAPI, deleteGroupAPI,
  setAdminOfGroupAPI
} from '../../support/utilAPI';
import {
  AccessLevel,
  GroupData, UnitData, WsData
} from '../../support/testData';

describe('API unit tests', () => {
  // 32
  const group1: GroupData = {
    id: 'id_group1',
    name: 'VERA2022'
  };
  const group2: GroupData = {
    id: 'id_group2',
    name: 'GROUP2022'
  };
  const ws1: WsData = {
    id: 'id_ws1',
    name: '01Vorlage'
  };
  const ws2: WsData = {
    id: 'id_ws2',
    name: '02Vorlage'
  };
  const unit1: UnitData = {
    shortname: 'D01',
    name: 'Maus',
    group: ''
  };
  const unit2: UnitData = {
    shortname: 'D02',
    name: 'Hund',
    group: ''
  };
  before(() => {
    cy.addFirstUserAPI()
      .then(resp => {
        Cypress.env(`token_${Cypress.env('username')}`, resp.body);
        expect(resp.status).to.equal(201);
        cy.getUserIdAPI(Cypress.env('username'), resp.body)
          .then(resp1 => {
            expect(resp1.status).to.equal(200);
            Cypress.env(`id_${Cypress.env('username')}`, resp1.body.userId);
            cy.createGroupAPI(group1, Cypress.env(`token_${Cypress.env('username')}`))
              .then(resp_g1 => {
                Cypress.env(group1.id, resp_g1.body);
                expect(resp_g1.status).to.equal(201);
                setAdminOfGroupAPI(Cypress.env('id_admin'), Cypress.env(group1.id));
                cy.createWsAPI(Cypress.env(group1.id), ws1, Cypress.env(`token_${Cypress.env('username')}`))
                  .then(resp_w1 => {
                    Cypress.env(ws1.id, resp_w1.body);
                    expect(resp_w1.status).to.equal(201);
                    cy.updateUsersOfWsAPI(Cypress.env(ws1.id), AccessLevel.Admin, Cypress.env(`token_${Cypress.env('username')}`))
                      .then(resp_level => {
                        expect(resp_level.status).to.equal(200);
                        cy.createUnitAPI(unit1, Cypress.env(ws1.id))
                          .then(resp_u1 => {
                            expect(resp_u1.status)
                              .to
                              .equal(201);
                            Cypress.env(unit1.shortname, resp_u1.body);
                          });
                        cy.createUnitAPI(unit2, Cypress.env(ws1.id))
                          .then(resp_u2 => {
                            expect(resp_u2.status)
                              .to
                              .equal(201);
                            Cypress.env(unit2.shortname, resp_u2.body);
                          });
                      });
                  });
              });
            cy.createGroupAPI(group2, Cypress.env(`token_${Cypress.env('username')}`))
              .then(resp_g2 => {
                Cypress.env(group2.id, resp_g2.body);
                expect(resp_g2.status).to.equal(201);
                setAdminOfGroupAPI(Cypress.env('id_admin'), Cypress.env(group2.id));
                cy.createWsAPI(Cypress.env(group2.id), ws2, Cypress.env(`token_${Cypress.env('username')}`))
                  .then(resp_w2 => {
                    Cypress.env(ws2.id, resp_w2.body);
                    expect(resp_w2.status).to.equal(201);
                  });
              });
          });
      });
  });
  after(() => {
    deleteGroupAPI(Cypress.env(group1.id));
    deleteGroupAPI(Cypress.env(group2.id));
    deleteFirstUserAPI();
  });

  context('Positive tests', () => {
    it('1. Get the units of a workspace', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'GET',
        url: `/api/workspace/${Cypress.env(ws1.id)}/units?withLastSeenCommentTimeStamp=true`,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.length).to.equal(2);
      });
      cy.pause();
    });

    it('2.Get the metadadata of a workspace ', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'GET',
        url: `/api/workspace/${Cypress.env(ws1.id)}/${Cypress.env(unit1.shortname)}/metadata`,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      }).then(resp => {
        expect(resp.status).to.equal(304);
      });
    });
    // 21.
    it('3. should to retrieve the workspaces of a user (admin). /api/admin/users/{id}/workspaces', () => {
      cy.getWsByUserAPI(Cypress.env('id_admin'))
        .then(resp => {
          expect(resp.status).to.equal(200);
          // expect(resp.body.length).to.equal(2);
        });
    });
  });
  context('Negative tests', () => {
    it('1. ', () => {
    });

    it('2. ', () => {
    });
  });
});
