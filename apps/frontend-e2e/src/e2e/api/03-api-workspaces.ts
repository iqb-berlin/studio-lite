import {
  AccessLevel,
  AccessUser
} from '../../support/testData';
import {
  noId,
  userGroupAdmin,
  user3,
  groupVera,
  group2,
  ws1,
  ws2,
  ws3
} from '../../support/util-api';

describe('Workspace API tests', () => {
  describe('16. POST /api/group-admin/workspaces', () => {
    it('201 positive test: should allow a group administrator to create a workspace', () => {
      cy.createWsAPI(
        Cypress.expose(groupVera.id),
        ws1,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        Cypress.expose(ws1.id, resp.body);
        expect(resp.status).to.equal(201);
      });
    });

    it('201 positive test: should allow a regular user to create a workspace in their assigned group', () => {
      cy.createWsAPI(
        Cypress.expose(groupVera.id),
        ws2,
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        Cypress.expose(ws2.id, resp.body);
        expect(resp.status).to.equal(201);
      });
    });

    it('401/201 negative test: should unexpectedly allow a user to create a workspace in a group ' +
      'they are not member of', () => {
      cy.createWsAPI(
        Cypress.expose(group2.id),
        ws3,
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        // expect(resp.status).to.equal(401); should
        Cypress.expose(ws3.id, resp.body);
        expect(resp.status).to.equal(201);
      });
    });

    it('401 negative test: should deny workspace creation with an invalid authentication token', () => {
      cy.createWsAPI(Cypress.expose(group2.id), ws1, noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('500 negative test: should return a server error when attempting to create a workspace' +
      ' in a non-existent group', () => {
      cy.createWsAPI(
        noId,
        ws1,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });
  });

  describe('17. PATCH /api/group-admin/workspaces/group-id', () => {
    it('200 positive test: should allow moving a workspace between groups when having permissions in both', () => {
      cy.setAdminsOfGroupAPI(
        [
          Cypress.expose(`id_${Cypress.expose('username')}`),
          Cypress.expose(`id_${userGroupAdmin.username}`)
        ],
        Cypress.expose(group2.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        cy.moveWsAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(group2.id),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp2 => {
          expect(resp2.status).to.equal(200);
        });
      });
    });

    it('200 positive test: should allow moving the workspace back to its original group', () => {
      cy.moveWsAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(groupVera.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp2 => {
        expect(resp2.status).to.equal(200);
      });
    });

    it('500 negative test: should fail to move a workspace to a non-existent group', () => {
      cy.moveWsAPI(
        Cypress.expose(ws1.id),
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp2 => {
        expect(resp2.status).to.equal(500);
      });
    });

    it('500 negative test: should fail to move a workspace when no target group structure is provided', () => {
      cy.moveWsAPI(
        '',
        Cypress.expose(group2.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp2 => {
        expect(resp2.status).to.equal(500);
      });
    });

    it('403 negative test: should deny moving a workspace without sufficient group-admin privileges', () => {
      cy.setAdminsOfGroupAPI(
        [Cypress.expose(`id_${Cypress.expose('username')}`)],
        Cypress.expose(group2.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        cy.moveWsAPI(
          Cypress.expose(ws3.id),
          Cypress.expose(groupVera.id),
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp1 => {
          expect(resp1.status).to.equal(403);
        });
      });
    });

    it('401 negative test: should deny moving a workspace when no authentication token is provided', () => {
      cy.moveWsAPI(Cypress.expose(ws1.id), Cypress.expose(group2.id), noId).then(
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
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(res => {
        Cypress.expose(`id_${user3.username}`, res.body);
        expect(res.status).to.equal(201);
        cy.getUsersFullAPI(
          false,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.length).to.equal(3);
          cy.updateUsersOfWsAPI(
            Cypress.expose(ws1.id),
            AccessLevel.Developer,
            Cypress.expose(`id_${user3.username}`),
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp2 => {
            expect(resp2.status).to.equal(200);
          });
          cy.loginAPI(user3.username, user3.password).then(resp3 => {
            Cypress.expose(`token_${user3.username}`, resp3.body.accessToken);
            expect(resp3.status).to.equal(201);
          });
        });
      });
      cy.getWsAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.body.name).to.equal(ws1.name);
        expect(resp.status).to.equal(200);
      });
    });

    it('401 negative test: should deny access to workspace details when provided with an invalid token', () => {
      cy.getWsAPI(Cypress.expose(ws1.id), noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('404 negative test: should return error when requesting a workspace with an empty ID', () => {
      cy.getWsAPI('', Cypress.expose(`token_${Cypress.expose('username')}`)).then(
        resp => {
          expect(resp.status).to.equal(404);
        }
      );
    });

    it('404 negative test: should return error when requesting a non-existent workspace', () => {
      cy.getWsAPI(noId, Cypress.expose(`token_${Cypress.expose('username')}`)).then(
        resp => {
          expect(resp.status).to.equal(404);
        }
      );
    });
  });

  describe('19. PATCH /api/group-admin/workspaces/{id}/users', () => {
    it('401 negative test: should deny identifying workspace users with an incorrect token', () => {
      cy.updateUsersOfWsAPI(
        Cypress.expose(ws1.id),
        AccessLevel.Developer,
        Cypress.expose(`id_${Cypress.expose('username')}`),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('500 negative test: should fail to update workspace permissions for a non-existent user', () => {
      cy.updateUsersOfWsAPI(
        Cypress.expose(ws1.id),
        AccessLevel.Basic,
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });

    it('500 negative test: should fail to update permissions for a non-existent workspace', () => {
      cy.updateUsersOfWsAPI(
        noId,
        AccessLevel.Developer,
        Cypress.expose(`id_${Cypress.expose('username')}`),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });

    it('200 positive test: should allow bulk updating user access levels within a workspace', () => {
      const ac: AccessUser = {
        id: Cypress.expose(`id_${Cypress.expose('username')}`),
        access: AccessLevel.Admin
      };
      const ac2: AccessUser = {
        id: Cypress.expose(`id_${userGroupAdmin.username}`),
        access: AccessLevel.Admin
      };
      cy.updateUserListOfWsAPI(
        Cypress.expose(ws1.id),
        [ac, ac2],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
      cy.updateUserListOfWsAPI(
        Cypress.expose(ws2.id),
        [ac, ac2],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('20. GET /api/group-admin/workspaces/{id}/users', () => {
    it('200 positive test: should retrieve the list of users assigned to a workspace', () => {
      cy.getUsersOfWsAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.body.length).to.equal(2);
        expect(resp.status).to.equal(200);
      });
    });

    it('401 negative test: should deny viewing workspace users without an administrator token', () => {
      cy.getUsersOfWsAPI(Cypress.expose(ws1.id), noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('200/404 negative test: should gracefully return success for an invalid workspace ID', () => {
      cy.getUsersOfWsAPI(
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('21. GET /api/admin/workspace-groups/{id}/workspaces', () => {
    it('200 positive test: should retrieve all workspaces within a specified workspace group', () => {
      cy.getWsByGroupAPI(
        Cypress.expose(groupVera.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.length).to.equal(2);
      });
    });

    it('401 negative test: should deny listing workspaces if providing an unauthorized user token', () => {
      cy.getWsByGroupAPI(
        Cypress.expose(groupVera.id),
        Cypress.expose(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('401 negative test: should deny listing workspaces when no token is provided', () => {
      cy.getWsByGroupAPI(Cypress.expose(groupVera.id), noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('401 negative test: should deny listing workspaces when providing an invalid group ID', () => {
      cy.getWsByGroupAPI(
        noId,
        Cypress.expose(`id_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });
  });

  // The routes of the group-admin area whose path names no group -- the lists, and creating a
  // workspace, which carries its group in the body -- ask whether the user administers any group
  // at all. user3 administers none and is refused.
  //
  // This is the closed half of IsWorkspaceGroupAdminGuard, and nothing measured it: the fixture's
  // plain user carries a user list where a token belongs (see 18.), so every request with it dies
  // at JwtAuthGuard, several routes short of the guard. Measured against the guard before #1629
  // (f66c147f^), these three answer the same as they do now -- the unresolved branch already asked
  // "any group at all". What #1629 changed is that a route has to say so with
  // @AnyWorkspaceGroupAdmin(); an unmarked one is refused instead of falling back silently.
  //
  // The open half is not here: whoever administers ANY group still reaches every other group
  // through these routes, because the target group arrives in the body or the query where the
  // guard does not look. That is #1005.
  describe('the group-admin area without a group in the path', () => {
    before(() => {
      // `token_${user3.username}` holds the user list that 18. read a line earlier, not a token,
      // and a request with it never reaches the guard under test.
      cy.loginAPI(user3.username, user3.password).then(resp => {
        expect(resp.status).to.equal(201);
        Cypress.expose('tokenOfPlainUser', resp.body.accessToken);
      });
    });

    it('401 negative test: should deny a user who administers no group the creation of a workspace', () => {
      // The route a group admin uses to create a workspace in any group at all (#1005). It is at
      // least closed to someone who administers none.
      cy.createWsAPI(
        Cypress.expose(groupVera.id),
        ws3,
        Cypress.expose('tokenOfPlainUser')
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('401 negative test: should deny a user who administers no group the group-admin user list', () => {
      cy.getUsersFullAPI(false, Cypress.expose('tokenOfPlainUser')).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('401 negative test: should deny a user who administers no group the workspaces of another user', () => {
      cy.getWsByUserAPI(
        Cypress.expose(`id_${userGroupAdmin.username}`),
        Cypress.expose('tokenOfPlainUser')
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('200 positive test: should let an admin of any group read the same list', () => {
      // The counterpart: same route, a user who administers a group. It also shows the refusals
      // above are the guard's answer and not a broken token.
      cy.getUsersFullAPI(
        false,
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });
});
