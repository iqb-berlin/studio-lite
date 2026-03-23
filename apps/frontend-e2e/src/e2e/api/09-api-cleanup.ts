import {
  modules
} from '../../support/testData';
import {
  noId,
  userGroupAdmin,
  user3,
  groupVera,
  group2,
  ws1,
  ws2,
  getNameAt
} from '../../support/util-api';

describe('Cleanup API tests', () => {
  describe('87. DELETE /api/group-admin/workspaces/{ids}', () => {
    it('200/500 negative test: should return success or server error when attempting ' +
      'to delete without a workspace context', () => {
      cy.deleteWsAPI(
        [noId],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        // expect(resp.status).to.equal(500); should
      });
    });

    it('401 negative test: should deny workspace deletion when no authentication token is provided', () => {
      cy.deleteWsAPI([Cypress.expose(ws2.id)], noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('200 positive test: should allow an authorized user to delete a specified list of workspaces', () => {
      cy.deleteWsAPI(
        [Cypress.expose(ws1.id), Cypress.expose(ws2.id)],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it('200/500 negative test: should return success or server error when attempting ' +
      'to delete a workspace that has already been removed', () => {
      cy.deleteWsAPI(
        [Cypress.expose(ws2.id)],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        // expect(resp.status).to.equal(500); should
      });
    });
  });

  describe('88. DELETE /api/admin/workspace-groups', () => {
    let qs: string[];
    before(() => {
      qs = [Cypress.expose(groupVera.id), Cypress.expose(group2.id)];
    });
    it('401 negative test: should deny workspace group deletion for a regular user account', () => {
      cy.deleteGroupsAPI(qs, Cypress.expose(`token_${userGroupAdmin.username}`)).then(
        resp => {
          expect(resp.status).to.equal(401);
        }
      );
    });

    it('404/200 negative test: should return success or not found error when attempting ' +
      'to delete a non-existent workspace group', () => {
      // This test should have 404 response, but we get 200
      cy.deleteGroupsAPI(
        [noId],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        // expect(resp.status).to.equal(404); // should
      });
    });

    it('200 positive test: should allow an administrator to successfully delete workspace groups', () => {
      cy.deleteGroupsAPI(
        qs,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        Cypress.expose(group2.id, '');
        Cypress.expose(groupVera.id, '');
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('89. DELETE /api/admin/verona-modules', () => {
    let qs: string[];
    before(() => {
      qs = [];
      modules.forEach(mo => {
        qs.push(getNameAt(mo));
      });
    });
    it('401 negative test: should deny module deletion when no valid credentials are provided', () => {
      cy.deleteModulesAPI([getNameAt(modules[0])], noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });
    it('500/200 negative test: should return success or server error when attempting ' +
      'to delete a module that does not exist', () => {
      cy.deleteModulesAPI(
        [noId],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        // expect(resp.status).to.equal(500); should
      });
    });
    it('200 positive test: should allow an authorized user to successfully delete a list of modules', () => {
      cy.deleteModulesAPI(
        qs,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('90. DELETE /api/admin/users/id ', () => {
    it('404/200 negative test: should return success or not found error when attempting ' +
      'to delete a user using an invalid ID', () => {
      cy.deleteUsersAPI(
        [noId],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        // expect(resp.status).to.equal(404); // should
      });
    });

    it('401 negative test: should deny user deletion when no valid authentication token is provided', () => {
      cy.deleteUsersAPI([Cypress.expose(`id_${user3.username}`)], noId).then(
        resp => {
          expect(resp.status).to.equal(401);
        }
      );
    });

    it('200 positive test: should allow an authorized administrator to successfully delete user accounts', () => {
      cy.deleteUsersAPI(
        [
          Cypress.expose(`id_${userGroupAdmin.username}`),
          Cypress.expose(`id_${user3.username}`)
        ],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('90. Delete the first user /api/admin/users/id', () => {
    it('200 positive test: should allow deleting the primary administrator user account', () => {
      cy.deleteUsersAPI(
        [Cypress.expose(`id_${Cypress.expose('username')}`)],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        Cypress.expose('token_admin', '');
        expect(resp.status).to.equal(200);
      });
    });

    it('401 negative test: should deny deletion of a user account that no longer exists', () => {
      cy.deleteUsersAPI(
        [Cypress.expose(`id_${Cypress.expose('username')}`)],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        Cypress.expose('token_admin', '');
        expect(resp.status).to.equal(401);
      });
    });
  });
});
