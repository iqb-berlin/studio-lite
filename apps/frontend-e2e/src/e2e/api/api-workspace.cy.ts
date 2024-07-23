import {
  addFirstUserAPI, createGroupAPI, createWsAPI,
  deleteFirstUserAPI, deleteGroupAPI, getAdminOfGroupAPI, getGroupAPI,
  getUserIdAPI, getUsersOfWsAPI, getWsAPI, setAdminOfGroupAPI, updateUsersOfWsAPI
} from '../../support/utilAPI';
import { GroupData, UnitData, WsData } from '../../support/testData';

describe('API unit tests', () => {
  // 32
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
      cy.pause();
    });
    it('14. Create two units POST /api/workspace/id_workspace/units`', () => {
      cy.createUnitAPI(unit1, Cypress.env(ws1.id))
        .then(resp => {
          expect(resp.status)
            .to
            .equal(201);
          Cypress.env(unit1.shortname, resp.body);
        });
      cy.createUnitAPI(unit2, Cypress.env(ws1.id))
        .then(resp => {
          expect(resp.status)
            .to
            .equal(201);
          Cypress.env(unit2.shortname, resp.body);
        });
    });
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
    });

    it('2.Get the data of a unit in the workspace ', () => {
    });
  });
  context('Negative tests', () => {
    it('1. ', () => {
    });

    it('2. ', () => {
    });
  });
  context('Delete the context', () => {
    it('a. should be able to delete a workspace group', () => {
      deleteGroupAPI(Cypress.env(group1.id));
      deleteGroupAPI(Cypress.env(group2.id));
    });
    it('b. Delete the first user', () => {
      deleteFirstUserAPI();
    });
  });
});
