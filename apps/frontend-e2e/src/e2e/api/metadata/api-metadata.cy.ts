import {
  deleteFirstUserAPI, deleteGroupAPI,
  setAdminOfGroupAPI
} from '../../../support/utilAPI';
import {
  AccessLevel, GroupData, UnitData, WsData
} from '../../../support/testData';

describe('API metadata tests', () => {
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
  // 32
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
    // 35
    it('1. Check the number of profiles in the profile registry', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'GET',
        url: '/api/metadata-profile/registry',
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.length).to.equal(8);
      });
    });
    // 36
    it('2. Get the primary German profile data ', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'GET',
        url: '/api/metadata-profile/registry',
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.length).to.equal(8);
        // We keep two of them of the profiles
        const profile1 = resp.body[0].url.replace('profile-config.json', '') +
          resp.body[0].profiles[0];
        const profile2 = resp.body[0].url.replace('profile-config.json', '') +
          resp.body[0].profiles[1];
        Cypress.env('profile1', profile1);
        Cypress.env('profile2', profile2);
      });
    });

    it('3. Get the label of the profile ', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'GET',
        url: `/api/metadata-profile?url=${Cypress.env('profile1')}`,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
        Cypress.env('label1', resp.body.label.value);
      });
      cy.request({
        method: 'GET',
        url: `/api/metadata-profile?url=${Cypress.env('profile2')}`,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      }).then(resp2 => {
        expect(resp2.status).to.equal(200);
        Cypress.env('label2', resp2.body.label.value);
      });
    });

    // 37
    it('4. Set the profile Data for a specific group', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'PATCH',
        url: `/api/workspace-groups/${Cypress.env('id_group1')}`,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          id: `${Cypress.env('id_group1')}`,
          settings: {
            profiles: [
              {
                id: `${Cypress.env('profile1')}`,
                label: `${Cypress.env('label1')}`
              },
              {
                id: `${Cypress.env('profile2')}`,
                label: `${Cypress.env('label2')}`
              }]
          }
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
    // 38
    it('5. Get the vocabulary from a specific profile', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'GET',
        url: '/api/metadata-profile/vocabularies',
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          url: `${Cypress.env('profile1')}`
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
    // 39
    it.skip('6. Set the workspace the vocabulary from a specific profile', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'GET',
        url: `/api/workspace/${Cypress.env('id_ws1')}/settings`,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          itemMDProfile: `${Cypress.env('profile2')}`,
          unitMDProfile: `${Cypress.env('profile1')}`
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });
  context('Negative tests', () => {
    it('1. ', () => {
    });

    it('2. ', () => {
    });
  });
  // context('Delete the context', () => {
  //   it('15. should be able a workspace from its workspace id and group id', () => {
  //     deleteWsAPI(Cypress.env(ws1.id), Cypress.env(group2.id));
  //   });
  //   it('16. should be able to delete a workspace group', () => {
  //     deleteGroupAPI(Cypress.env(group1.id));
  //     deleteGroupAPI(Cypress.env(group2.id));
  //   });
  //   it('b. Delete the first user', () => {
  //     deleteFirstUserAPI();
  //   });
  // });
});
