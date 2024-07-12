import {
  addFirstUserAPI,
  createGroupAPI,
  createWsAPI,
  deleteFirstUserAPI,
  deleteGroupAPI,
  getUserIdAPI, grantAccessWsAPI,
  setAdminOfGroupAPI
} from '../../support/utilAPI';
import {
  AccessLevel, GroupData, UnitData, WsData
} from '../../support/testData';

describe('API unit tests', () => {
  const group1: GroupData = {
    id: 'id_group1',
    name: 'VERA2023'
  };
  const ws1: WsData = {
    id: 'id_ws1',
    name: '01Vorlage'
  };
  const ws2: WsData = {
    id: 'id_ws2',
    name: 'NoAccess'
  };
  const unit1: UnitData = {
    shortname: 'D01',
    name: 'Maus',
    group: ''
  };
  // 32
  context('Preparing context', () => {
    it('a. Add user', () => {
      addFirstUserAPI();
    });
    it('b. Get user id', () => {
      getUserIdAPI(Cypress.env('username'), Cypress.env('token_admin'));
    });
    it('c. Create group', () => {
      createGroupAPI(group1);
    });
    it('d. Grant admin privileges in the group', () => {
      setAdminOfGroupAPI(Cypress.env('id_admin'), Cypress.env(group1.id));
    });
    it('e. Create a workspace', () => {
      createWsAPI(Cypress.env(group1.id), ws1);
    });
    it('f. Grant admin privileges in the workspace', () => {
      grantAccessWsAPI(Cypress.env(ws1.id), Cypress.env('id_admin'), AccessLevel.Admin);
    });
    it('g. G Create a workspace w2', () => {
      createWsAPI(Cypress.env(group1.id), ws2);
    });
  });
  context('Positive tests', () => {
    // 32
    it('1. Create a Unit POST /api/workspace/id_workspace/units`', () => {
      cy.createUnitAPI(unit1, Cypress.env(ws1.id))
        .then(resp => {
          expect(resp.status)
            .to
            .equal(201);
          Cypress.env(unit1.shortname, resp.body);
        });
    });
    // 33
    it('2. Delete a Unit POST /api/workspace/id_workspace/ids`', () => {
      cy.deleteUnitAPI(Cypress.env(unit1.shortname), Cypress.env(ws1.id))
        .then(resp => {
          expect(resp.status).to.equal(200);
          Cypress.env(unit1.shortname, resp.body);
        });
    });
  });
  context('Negative tests', () => {
    // 32
    it('1. Create a Unit POST /api/workspace/id_workspace/units`', () => {
      cy.createUnitAPI(unit1, Cypress.env(ws2.id))
        .then(resp => {
          expect(resp.status)
            .to
            .equal(403);
        });
    });
    // 33
    it('2. Delete a Unit POST /api/workspace/id_workspace/ids`', () => {
      cy.deleteUnitAPI(Cypress.env(unit1.shortname), Cypress.env(ws2.id))
        .then(resp => {
          expect(resp.status).to.equal(404);
        });
    });
  });
  context('Delete the context', () => {
    it('a. Delete the group', () => {
      deleteGroupAPI(Cypress.env(group1.id));
    });
    it('b. Delete the first user', () => {
      deleteFirstUserAPI();
    });
  });
});
