import {
  addFirstUserAPI,
  createGroupAPI,
  createWsAPI, deleteFirstUserAPI, deleteGroupAPI, deleteWsAPI, getAdminOfGroupAPI, getGroupAPI,
  getUserIdAPI, getUsersOfWsAPI, getWsAPI,
  setAdminOfGroupAPI, updateUsersOfWsAPI, updateWsAPI
} from '../../support/utilAPI';
import { GroupData, WsData } from '../../support/testData';

describe('API admin workspace tests', () => {
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
  before(() => {
    addFirstUserAPI();
  });
  after(() => deleteFirstUserAPI());

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

  // TO DO, find out what does
  it('14. should be able to update a workspace ', () => {
    ws1.name = 'LESEN';
    updateWsAPI(Cypress.env(ws1.id), Cypress.env(group1.id), ws1.name, group1.name);
  });
  it('16. should be able a workspace from its workspace id and group id', () => {
    // deleteWsAPI(Cypress.env('id_ws1'), Cypress.env('id_group2'));
    cy.pause();
    deleteWsAPI(Cypress.env(ws1.id), Cypress.env(group2.id));
  });
  it('17. should be able to delete a workspace group', () => {
    deleteGroupAPI(Cypress.env(group1.id));
    deleteGroupAPI(Cypress.env(group2.id));
  });
});
