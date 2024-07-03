import {
  addFirstUserAPI,
  createGroupAPI,
  createWsAPI, deleteFirstUserAPI, deleteGroupAPI, getAdminOfGroupAPI,
  getUserIdAPI,
  setAdminOfGroupAPI
} from '../../support/utilAPI';

describe('API admin workspace tests', () => {
  before(() => {
    addFirstUserAPI();
  });
  after(() => deleteFirstUserAPI());

  it('1. should be able to create a new workspace group', () => {
    getUserIdAPI(Cypress.env('username'), Cypress.env('token_admin'));
    createGroupAPI('VERA2002', 'id_group1');
  });

  it('2. should be able to create modify details of a group', () => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    cy.request({
      method: 'PATCH',
      url: '/api/admin/workspace-groups',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: {
        id: `${Cypress.env('id_group1')}`,
        name: 'VERA2022',
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
    setAdminOfGroupAPI(Cypress.env('id_admin'), Cypress.env('id_group1'));
  });

  it('4. should enable the access to a group to a user', () => {
    getAdminOfGroupAPI(Cypress.env('id_group1'));
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
    createWsAPI(Cypress.env('id_group1'), '01Vorlage', 'id_ws1');
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
      expect(resp.body[0].workspaces[0].name).equals('01Vorlage');
    });
  });

  it('8.a create a second group', () => {
    createGroupAPI('GROUP2022', 'id_group2');
  });

  it('8. should be able to move a workspace to an another group', () => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    setAdminOfGroupAPI(Cypress.env('id_admin'), Cypress.env('id_group2'));
    cy.request({
      method: 'PATCH',
      url: `/api/admin/workspaces/${Cypress.env('id_ws1')}/${Cypress.env('id_group2')}`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      }
    }).then(resp => {
      expect(resp.status).to.equal(200);
    });
  });
  it('9. should be able to delete a workspace group', () => {
    deleteGroupAPI(Cypress.env('id_group1'));
    deleteGroupAPI(Cypress.env('id_group2'));
  });
});
