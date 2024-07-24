import {
  addFirstUserAPI,
  createGroupAPI,
  createWsAPI, deleteFirstUserAPI, deleteGroupAPI, deleteWsAPI,
  getAdminOfGroupAPI,
  getGroupAPI,
  getUserIdAPI,
  getUsersOfWsAPI,
  getWsAPI,
  setAdminOfGroupAPI,
  updateUsersOfWsAPI
} from '../../../support/utilAPI';
import { GroupData, WsData } from '../../../support/testData';

describe('API metadata tests', () => {
  const group1: GroupData = {
    id: 'id_group1',
    name: 'VERA2002'
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
  context('Preparing context', () => {
    it('a. Add user', () => {
      addFirstUserAPI();
    });
    it('1. should be able to create a new workspace group', () => {
      getUserIdAPI(Cypress.env('username'), Cypress.env('token_admin'));
      createGroupAPI(group1);
    });

    it('2. should be able to create modify details of a group', () => {
      group1.name = 'VERA2022';
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'PATCH',
        url: '/api/admin/workspace-groups',
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          id: `${Cypress.env(group1.id)}`,
          name: `${group1.name}`,
          defaultEditor: {},
          defaultPlayer: {},
          defaultSchemer: {},
          profiles: [
          ],
          states: [
          ]
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it('3. should enable the access to a group to a user', () => {
      setAdminOfGroupAPI(Cypress.env('id_admin'), Cypress.env(group1.id));
    });

    it('4. should enable the access to a group to a user', () => {
      getAdminOfGroupAPI(Cypress.env(group1.id));
    });

    it('5. should be able to get details of a group', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'GET',
        url: '/api/admin/workspace-groups',
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.length).gt(0);
      });
    });

    it('6. should be able to create a workspace in a group', () => {
      // createWsAPI(Cypress.env(group1.id), '01Vorlage', 'id_ws1');
      createWsAPI(Cypress.env(group1.id), ws1);
    });

    it('7. should be able to get all workspaces order by group', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      cy.request({
        method: 'GET',
        url: '/api/admin/workspaces/groupwise',
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body[0].workspaces[0].name).equals(ws1.name);
      });
    });

    it('8.a create a second group', () => {
      // createGroupAPI('GROUP2022', 'id_group2');
      createGroupAPI(group2);
    });

    it('8. should be able to move a workspace to an another group', () => {
      const authorization = `bearer ${Cypress.env('token_admin')}`;
      setAdminOfGroupAPI(Cypress.env('id_admin'), Cypress.env(group2.id));
      cy.request({
        method: 'PATCH',
        url: `/api/admin/workspaces/${Cypress.env(ws1.id)}/${Cypress.env(group2.id)}`,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      }).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
    it('9a. create a second workspace', () => {
      createWsAPI(Cypress.env(group2.id), ws2);
    });
    it('9. should retrieve the workspaces associated to a workspace id', () => {
      // TO DO try to recover the names of ws here and check for equality.
      cy.getWsByGroupAPI(Cypress.env(group2.id), 2);
    });
    it('10. should be able to get details of a workspace group from its group id', () => {
      getGroupAPI(Cypress.env(group1.id));
    });
    it('11. should be able to get details of a workspace from its workspace id', () => {
      getWsAPI(Cypress.env(ws1.id));
    });
    it('12. should be able to get the users of a workspace from its workspace id', () => {
      getUsersOfWsAPI(Cypress.env(ws1.id));
    });
    it('13. should be able to update the users of a workspace from its workspace id', () => {
      updateUsersOfWsAPI(Cypress.env(ws1.id));
    });
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
  context('Delete the context', () => {
    it('15. should be able a workspace from its workspace id and group id', () => {
      deleteWsAPI(Cypress.env(ws1.id), Cypress.env(group2.id));
    });
    it('16. should be able to delete a workspace group', () => {
      deleteGroupAPI(Cypress.env(group1.id));
      deleteGroupAPI(Cypress.env(group2.id));
    });
    it('b. Delete the first user', () => {
      deleteFirstUserAPI();
    });
  });
});
