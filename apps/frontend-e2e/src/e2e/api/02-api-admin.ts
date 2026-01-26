import {
  noId,
  fakeUser,
  user2,
  group1,
  group2,
  vera2024
} from '../../support/util-api';

describe('Admin API tests', () => {
  describe('6. POST api/admin/users: should create a new user', () => {
    it('201 positive test: should allow an administrator to create a new user', () => {
      cy.createUserAPI(user2, Cypress.env(`token_${Cypress.env('username')}`))
        .then(res => {
          Cypress.env(`id_${user2.username}`, res.body);
          expect(res.status).to.equal(201);
          cy.getUsersFullAPI(false, Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              expect(resp.body.length).to.equal(2);
            });
          cy.loginAPI(user2.username, user2.password)
            .then(resp => {
              Cypress.env(`token_${user2.username}`, resp.body);
              expect(resp.status).to.equal(201);
            });
        });
    });

    it('401 negative test: should deny user creation when no valid credentials are provided', () => {
      cy.createUserAPI(fakeUser, noId)
        .then(res => {
          expect(res.status).to.equal(401);
        });
    });
  });

  describe('7. GET /api/group-admin/users', () => {
    it('200 positive test: should allow an administrator to retrieve all users', () => {
      cy.getUsersAPI(Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.length).to.equal(2);
        });
    });

    it('401 negative test: should deny a regular user from listed all users', () => {
      cy.getUsersAPI(Cypress.env(`token_${user2.username}`))
        .then(resp2 => {
          expect(resp2.status).to.equal(401);
        });
    });
  });

  describe('8. GET /api/group-admin/users full=true', () => {
    it('200 positive test: should allow an administrator to retrieve full user data', () => {
      cy.getUsersFullAPI(false, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.length).to.equal(2);
        });
      cy.getUsersFullAPI(true, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.length).to.equal(2);
        });
    });

    it('401 negative test: should deny a regular user from retrieving the full user list', () => {
      cy.getUsersFullAPI(false, Cypress.env(`token_${user2.username}`))
        .then(resp2 => {
          expect(resp2.status).to.equal(401);
        });
    });
  });

  describe('9. PATCH /api/admin/users/{id}', () => {
    it('401 negative test: should prevent a non-administrator user from granting ' +
      'themselves administrator rights', () => {
      cy.updateUserAPI(Cypress.env(`id_${user2.username}`), user2, true, Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('200 positive test: should allow an administrator to promote another user to administrator', () => {
      cy.updateUserAPI(Cypress.env(`id_${user2.username}`),
        user2,
        true,
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should deny user updates when provided with an invalid token', () => {
      cy.updateUserAPI(Cypress.env(`id_${user2.username}`), user2, false, 'falseToken')
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('404 negative test: should return error when attempting to update a non-existent user', () => {
      cy.updateUserAPI(noId, fakeUser, true, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(404);
        });
    });
  });

  describe('10. POST /api/admin/workspace-groups', () => {
    it('201 positive test: should allow an administrator to create a new workspace group', () => {
      cy.createGroupAPI(group1, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          Cypress.env(group1.id, resp.body);
          expect(resp.status).to.equal(201);
        });
    });

    it('401 negative test: should deny a regular user from creating a workspace group', () => {
      cy.updateUserAPI(Cypress.env(`id_${user2.username}`),
        user2,
        false,
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          cy.createGroupAPI(group2, Cypress.env(`token_${user2.username}`))
            .then(resp2 => {
              expect(resp2.status).to.equal(401);
            });
        });
    });
  });

  describe('11. GET /api/admin/workspace-groups/{workspace_group_id}', () => {
    it('200 positive test: should retrieve workspace group details by ID for an administrator', () => {
      cy.getGroupByIdAPI(Cypress.env(group1.id), Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.name).to.equal(group1.name);
        });
    });

    it('404 negative test: should return error for a non-existent workspace group ID', () => {
      cy.getGroupByIdAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(404);
        });
    });

    it('401 negative test: should deny access to workspace group details for a non-administrator user', () => {
      cy.getGroupByIdAPI(Cypress.env(group1.id), Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should deny access when no token is provided', () => {
      cy.getGroupByIdAPI(Cypress.env(group1.id), noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('12. GET /api/admin/workspace-groups', () => {
    it('200 positive test: should allow an administrator to list all workspace groups', () => {
      cy.createGroupAPI(group2, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          Cypress.env(group2.id, resp.body);
          expect(resp.status).to.equal(201);
        });
      cy.getWsGroupsAPI(Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.length).to.equal(2);
        });
    });

    it('401 negative test: should deny a regular user from listing workspace groups', () => {
      cy.getWsGroupsAPI(Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should deny access when provided with a non-existent user token', () => {
      cy.getWsGroupsAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('13. PATCH /api/admin/workspace-groups', () => {
    it('200 positive test: should allow modifying workspace group details', () => {
      cy.updateGroupAPI(Cypress.env(group1.id),
        vera2024,
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('500 negative test: should return a server error when attempting to update ' +
      'a non-existent workspace group', () => {
      cy.updateGroupAPI(noId,
        'vera2025',
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });

    it('401 negative test: should deny updates when provided with an invalid token', () => {
      cy.updateGroupAPI(Cypress.env(group1.id),
        'vera2026',
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should deny updates by a user who is not an administrator', () => {
      cy.updateGroupAPI(Cypress.env(group1.id),
        'vera2027',
        Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('14. PATCH /api/admin/workspace-groups/{workspace_group_id}/admins', () => {
    it('200 positive test: should allow setting the administrator list for a workspace group', () => {
      cy.setAdminsOfGroupAPI([Cypress.env(`id_${Cypress.env('username')}`), Cypress.env(`id_${user2.username}`)],
        Cypress.env(group1.id),
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should deny a regular user from modifying group administrators', () => {
      cy.setAdminsOfGroupAPI([Cypress.env(`id_${Cypress.env('username')}`)],
        Cypress.env(group2.id),
        Cypress.env(user2.username))
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('500 negative test: should return a server error when attempting to set administrators ' +
      'for a non-existent group', () => {
      cy.setAdminsOfGroupAPI([Cypress.env(`id_${Cypress.env('username')}`)],
        noId,
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });
  });

  describe('15. GET /api/admin/workspace-groups/{workspace_group_id}/admins', () => {
    it('200 positive test: should retrieve the list of administrators for a workspace group', () => {
      cy.getAdminOfGroupAPI(Cypress.env(group1.id),
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.body.length).to.equal(2);
          expect(resp.status).to.equal(200);
        });
    });

    it('200 positive test: should retrieve an empty list if the group has no administrators assigned', () => {
      cy.getAdminOfGroupAPI(Cypress.env(group2.id),
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.body.length).to.equal(0);
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should deny a user without admin credentials from viewing the admin list', () => {
      cy.getAdminOfGroupAPI(Cypress.env(group1.id),
        Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });
});
