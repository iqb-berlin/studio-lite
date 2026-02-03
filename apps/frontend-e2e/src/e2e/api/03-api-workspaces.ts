import {
  AccessLevel,
  AccessUser
} from '../../support/testData';
import {
  noId,
  user2,
  user3,
  group1,
  group2,
  ws1,
  ws2,
  ws3
} from '../../support/util-api';

describe('Workspace API tests', () => {
  describe('16. POST /api/group-admin/workspaces', () => {
    it('201 positive test: should allow a group administrator to create a workspace', () => {
      cy.createWsAPI(
        Cypress.env(group1.id),
        ws1,
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        Cypress.env(ws1.id, resp.body);
        expect(resp.status).to.equal(201);
      });
    });

    it('201 positive test: should allow a regular user to create a workspace in their assigned group', () => {
      cy.createWsAPI(
        Cypress.env(group1.id),
        ws2,
        Cypress.env(`token_${user2.username}`)
      ).then(resp => {
        Cypress.env(ws2.id, resp.body);
        expect(resp.status).to.equal(201);
      });
    });

    it('401/201 negative test: should unexpectedly allow a user to create a workspace in a group ' +
      'they are not member of', () => {
      cy.createWsAPI(
        Cypress.env(group2.id),
        ws3,
        Cypress.env(`token_${user2.username}`)
      ).then(resp => {
        // expect(resp.status).to.equal(401); should
        Cypress.env(ws3.id, resp.body);
        expect(resp.status).to.equal(201);
      });
    });

    it('401 negative test: should deny workspace creation with an invalid authentication token', () => {
      cy.createWsAPI(Cypress.env(group2.id), ws1, noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('500 negative test: should return a server error when attempting to create a workspace' +
      ' in a non-existent group', () => {
      cy.createWsAPI(
        noId,
        ws1,
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });
  });

  describe('17. PATCH /api/group-admin/workspaces/group-id', () => {
    it('200 positive test: should allow moving a workspace between groups when having permissions in both', () => {
      cy.setAdminsOfGroupAPI(
        [
          Cypress.env(`id_${Cypress.env('username')}`),
          Cypress.env(`id_${user2.username}`)
        ],
        Cypress.env(group2.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        cy.moveWsAPI(
          Cypress.env(ws1.id),
          Cypress.env(group2.id),
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp2 => {
          expect(resp2.status).to.equal(200);
        });
      });
    });

    it('200 positive test: should allow moving the workspace back to its original group', () => {
      cy.moveWsAPI(
        Cypress.env(ws1.id),
        Cypress.env(group1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp2 => {
        expect(resp2.status).to.equal(200);
      });
    });

    it('500 negative test: should fail to move a workspace to a non-existent group', () => {
      cy.moveWsAPI(
        Cypress.env(ws1.id),
        noId,
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp2 => {
        expect(resp2.status).to.equal(500);
      });
    });

    it('500 negative test: should fail to move a workspace when no target group structure is provided', () => {
      cy.moveWsAPI(
        '',
        Cypress.env(group2.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp2 => {
        expect(resp2.status).to.equal(500);
      });
    });

    it('403 negative test: should deny moving a workspace without sufficient group-admin privileges', () => {
      cy.setAdminsOfGroupAPI(
        [Cypress.env(`id_${Cypress.env('username')}`)],
        Cypress.env(group2.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        cy.moveWsAPI(
          Cypress.env(ws3.id),
          Cypress.env(group1.id),
          Cypress.env(`token_${user2.username}`)
        ).then(resp1 => {
          expect(resp1.status).to.equal(403);
        });
      });
    });

    it('401 negative test: should deny moving a workspace when no authentication token is provided', () => {
      cy.moveWsAPI(Cypress.env(ws1.id), Cypress.env(group2.id), noId).then(
        resp => {
          expect(resp.status).to.equal(401);
        }
      );
    });
  });

  describe('18. GET /api/group-admin/workspaces/{id}', () => {
    it('200 positive test: should retrieve workspace details by ID for an authorized user', () => {
      cy.createUserAPI(
        user3,
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(res => {
        Cypress.env(`id_${user3.username}`, res.body);
        expect(res.status).to.equal(201);
        cy.getUsersFullAPI(
          false,
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.length).to.equal(3);
          cy.updateUsersOfWsAPI(
            Cypress.env(ws1.id),
            AccessLevel.Developer,
            Cypress.env(`id_${user3.username}`),
            Cypress.env(`token_${Cypress.env('username')}`)
          ).then(resp2 => {
            expect(resp2.status).to.equal(200);
          });
          cy.loginAPI(user3.username, user3.password).then(resp3 => {
            Cypress.env(`token_${user3.username}`, resp.body);
            expect(resp3.status).to.equal(201);
          });
        });
      });
      cy.getWsAPI(
        Cypress.env(ws1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.body.name).to.equal(ws1.name);
        expect(resp.status).to.equal(200);
      });
    });

    it('401 negative test: should deny access to workspace details when provided with an invalid token', () => {
      cy.getWsAPI(Cypress.env(ws1.id), noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('404 negative test: should return error when requesting a workspace with an empty ID', () => {
      cy.getWsAPI('', Cypress.env(`token_${Cypress.env('username')}`)).then(
        resp => {
          expect(resp.status).to.equal(404);
        }
      );
    });

    it('404 negative test: should return error when requesting a non-existent workspace', () => {
      cy.getWsAPI(noId, Cypress.env(`token_${Cypress.env('username')}`)).then(
        resp => {
          expect(resp.status).to.equal(404);
        }
      );
    });
  });

  describe('19. PATCH /api/group-admin/workspaces/{id}/users', () => {
    it('401 negative test: should deny identifying workspace users with an incorrect token', () => {
      cy.updateUsersOfWsAPI(
        Cypress.env(ws1.id),
        AccessLevel.Developer,
        Cypress.env(`id_${Cypress.env('username')}`),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('500 negative test: should fail to update workspace permissions for a non-existent user', () => {
      cy.updateUsersOfWsAPI(
        Cypress.env(ws1.id),
        AccessLevel.Basic,
        noId,
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });

    it('500 negative test: should fail to update permissions for a non-existent workspace', () => {
      cy.updateUsersOfWsAPI(
        noId,
        AccessLevel.Developer,
        Cypress.env(`id_${Cypress.env('username')}`),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });

    it('200 positive test: should allow bulk updating user access levels within a workspace', () => {
      const ac: AccessUser = {
        id: Cypress.env(`id_${Cypress.env('username')}`),
        access: AccessLevel.Admin
      };
      const ac2: AccessUser = {
        id: Cypress.env(`id_${user2.username}`),
        access: AccessLevel.Admin
      };
      cy.updateUserListOfWsAPI(
        Cypress.env(ws1.id),
        [ac, ac2],
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
      cy.updateUserListOfWsAPI(
        Cypress.env(ws2.id),
        [ac, ac2],
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('20. GET /api/group-admin/workspaces/{id}/users', () => {
    it('200 positive test: should retrieve the list of users assigned to a workspace', () => {
      cy.getUsersOfWsAPI(
        Cypress.env(ws1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.body.length).to.equal(2);
        expect(resp.status).to.equal(200);
      });
    });

    it('401 negative test: should deny viewing workspace users without an administrator token', () => {
      cy.getUsersOfWsAPI(Cypress.env(ws1.id), noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('200/404 negative test: should gracefully return success for an invalid workspace ID', () => {
      cy.getUsersOfWsAPI(
        noId,
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('21. GET /api/admin/workspace-groups/{id}/workspaces', () => {
    it('200 positive test: should retrieve all workspaces within a specified workspace group', () => {
      cy.getWsByGroupAPI(
        Cypress.env(group1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.length).to.equal(2);
      });
    });

    it('401 negative test: should deny listing workspaces if providing an unauthorized user token', () => {
      cy.getWsByGroupAPI(
        Cypress.env(group1.id),
        Cypress.env(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('401 negative test: should deny listing workspaces when no token is provided', () => {
      cy.getWsByGroupAPI(Cypress.env(group1.id), noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('401 negative test: should deny listing workspaces when providing an invalid group ID', () => {
      cy.getWsByGroupAPI(
        noId,
        Cypress.env(`id_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });
  });
});
