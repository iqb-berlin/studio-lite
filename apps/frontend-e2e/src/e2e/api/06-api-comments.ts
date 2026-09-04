import {
  AccessLevel,
  CommentData
} from '../../support/testData';
import {
  noId,
  userGroupAdmin,
  user3,
  ws1,
  ws2,
  unit1
} from '../../support/util-api';

describe('Comments API tests', () => {
  let comment: CommentData;
  before(() => {
    comment = {
      body: '<p>Kommentare 1 zur Aufgabe 1</p>',
      userName: `${userGroupAdmin.username}`,
      userId: parseInt(
        `${Cypress.expose(`id_${userGroupAdmin.username}`)}`,
        10
      ),
      unitId: parseInt(`${Cypress.expose(unit1.shortname)}`, 10)
    };
  });

  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('56. POST /api/workspaces/{workspace_id}/units/{id}/comments', () => {
    describe('56. POST /api/workspaces/{workspace_id}/units/{id}/comments', () => {
      it('201 positive test: should allow adding a new comment to a specified unit', () => {
        cy.postCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          comment,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          Cypress.expose('comment1', resp.body);
          expect(resp.status).to.equal(201);
        });
      });

      it('401 negative test: should deny comment creation for a user without sufficient workspace permissions', () => {
        cy.postCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          comment,
          Cypress.expose(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('401 negative test: should deny comment creation when both workspace ID and credentials are invalid', () => {
        cy.postCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          comment,
          Cypress.expose(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it(
        '500/201 negative test: should unexpectedly allow adding a comment even ' +
          'if an incorrect workspace ID is provided',
        () => {
          // Passing the wrong workspace doesn't affect to insert comment if we pass a valid unit
          // Should be 500
          const comment2: CommentData = {
            body: '<p>Kommentare 2 zur Aufgabe 1</p>',
            userName: `${userGroupAdmin.username}`,
            userId: parseInt(
              `${Cypress.expose(`id_${userGroupAdmin.username}`)}`,
              10
            ),
            unitId: parseInt(`${Cypress.expose(unit1.shortname)}`, 10)
          };
          cy.postCommentAPI(
            Cypress.expose(ws1.id),
            Cypress.expose(unit1.shortname),
            comment2,
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            Cypress.expose('comment2', resp.body);
            expect(resp.status).to.equal(201);
            // expect(resp.status).to.equal(500); //should
          });
        }
      );

      it('500 negative test: should return a server error when trying to add a comment without a workspace ID', () => {
        // Passing the wrong workspace doesn't affect to insert comment if we pass a valid unit
        const comment3: CommentData = {
          body: '<p>Kommentare 3 zur Aufgabe 1</p>',
          userName: `${userGroupAdmin.username}`,
          userId: parseInt(
            `${Cypress.expose(`id_${userGroupAdmin.username}`)}`,
            10
          ),
          unitId: parseInt(`${Cypress.expose(unit1.shortname)}`, 10)
        };
        cy.postCommentAPI(
          noId,
          Cypress.expose(unit1.shortname),
          comment3,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      });

      it(
        '500 negative test: should return a server error when attempting to add a comment ' +
          'with an invalid data format',
        () => {
          cy.postCommentAPI(
            Cypress.expose(ws2.id),
            Cypress.expose(unit1.shortname),
            noId,
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(500);
          });
        }
      );
    });

    describe('57. GET /api/workspaces/{workspace_id}/units/{id}/comments', () => {
      it('200 positive test: should successfully retrieve all comments associated with a specific unit', () => {
        cy.getCommentsAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(200);
          expect(resp.body.length).to.be.equal(2);
        });
      });

      it('401 negative test: should deny access to unit comments when no valid credentials are provided', () => {
        cy.getCommentsAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          noId
        ).then(resp => {
          expect(resp.status).to.be.equal(401);
        });
      });

      it('200 negative test: should return an empty list when requesting comments for a non-existent unit ID', () => {
        cy.getCommentsAPI(
          Cypress.expose(ws2.id),
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(200);
          expect(resp.body.length).to.be.equal(0);
        });
      });

      it(
        '500 negative test: should return a server error when attempting to retrieve comments' +
          ' without a valid workspace ID',
        () => {
          cy.getCommentsAPI(
            noId,
            Cypress.expose(unit1.shortname),
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(500);
          });
        }
      );
    });

    describe('58. PATCH /api/workspaces/{workspace_id}/units/{id}/comments', () => {
      it('200 positive test: should allow an authorized user to update the comment visibility timestamp', () => {
        comment.lastSeenCommentChangedAt = new Date();
        cy.updateCommentTimeAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(unit1.shortname),
          comment,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(200);
        });
      });

      it('401 negative test: should deny timestamp updates when no valid credentials are provided', () => {
        comment.lastSeenCommentChangedAt = new Date();
        cy.updateCommentTimeAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(unit1.shortname),
          comment,
          noId
        ).then(resp => {
          expect(resp.status).to.be.equal(401);
        });
      });

      it(
        '500 negative test: should return a server error when attempting to update timestamp' +
          ' with invalid request data',
        () => {
          comment.lastSeenCommentChangedAt = new Date();
          cy.updateCommentTimeAPI(
            noId,
            Cypress.expose(unit1.shortname),
            comment,
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(500);
          });
        }
      );
    });

    describe('59. GET /api/workspaces/{workspace_id}/units/{id}/comments/last-seen', () => {
      it(
        '200 positive test: should successfully retrieve the last seen timestamp for comments' +
          ' on a specific unit',
        () => {
          cy.getCommentTimeAPI(
            Cypress.expose(ws1.id),
            Cypress.expose(unit1.shortname),
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(200);
          });
        }
      );

      it(
        '401 negative test: should deny access to the last seen timestamp when ' +
          'no valid credentials are provided',
        () => {
          cy.getCommentTimeAPI(
            Cypress.expose(ws1.id),
            Cypress.expose(unit1.shortname),
            noId
          ).then(resp => {
            expect(resp.status).to.be.equal(401);
          });
        }
      );

      it(
        '500 negative test: should return a server error when attempting to retrieve last seen timestamp' +
          ' without a valid workspace ID',
        () => {
          cy.getCommentTimeAPI(
            noId,
            Cypress.expose(unit1.shortname),
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(500);
          });
        }
      );
    });

    describe('60. PATCH /api/workspaces/{workspace_id}/units/{id}/comments/{id}', () => {
      it('401 negative test: should deny comment updates even for an administrator if they are not the author', () => {
        comment.body = '<p>Kommentare 4 zur Aufgabe 1</p>';
        cy.updateCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          Cypress.expose('comment1'),
          comment,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(401);
        });
      });

      it(
        '500 negative test: should return a server error when attempting to update a comment' +
          ' using an invalid workspace ID',
        () => {
          comment.body = '<p>Kommentare 4 zur Aufgabe 1</p>';
          cy.updateCommentAPI(
            noId,
            Cypress.expose(unit1.shortname),
            Cypress.expose('comment1'),
            comment,
            Cypress.expose(`token_${userGroupAdmin.username}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(500);
          });
        }
      );

      it(
        '500/200 negative test: should return success despite attempting to update a comment' +
          ' without specifying a unit ID',
        () => {
          // If we want to update a comment without unit id, return a 200, should 500
          comment.body = '<p>Kommentare 4 zur Aufgabe 1</p>';
          cy.updateCommentAPI(
            Cypress.expose(ws2.id),
            noId,
            Cypress.expose('comment1'),
            comment,
            Cypress.expose(`token_${userGroupAdmin.username}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(200);
            // expect(resp.status).to.be.equal(500); //should
          });
        }
      );

      it(
        '200 test: should no longer refuse an update because the body names no user (#1628)',
        () => {
          // The body is `noId` here, so it carries no userId at all. That used to be the refusal:
          // CommentWriteGuard compared the body's userId with the token's user. It asks the stored
          // comment now, and the author's token passes whatever the body claims -- which is the
          // point of the fix, and why this call answers 200 where it once answered 401.
          comment.body = '<p>Kommentare 4 zur Aufgabe 1</p>';
          cy.updateCommentAPI(
            Cypress.expose(ws2.id),
            Cypress.expose(unit1.shortname),
            Cypress.expose('comment1'),
            noId,
            Cypress.expose(`token_${userGroupAdmin.username}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(200);
          });
        }
      );

      it('200 positive test: should allow an authorized user to successfully update their own comment', () => {
        comment.body = '<p>Kommentare 48 zur Aufgabe 1</p>';
        cy.updateCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          Cypress.expose('comment1'),
          comment,
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(200);
        });
      });
    });

    describe('61. DELETE /api/workspaces/{workspace_id}/units/{id}/comments/{id}', () => {
      it('401 negative test: should deny comment deletion for a user without sufficient privileges', () => {
        cy.deleteCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          Cypress.expose('comment2'),
          Cypress.expose(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(401);
        });
      });

      it(
        '500 negative test: should return a server error when attempting to delete a comment' +
          ' using an invalid workspace ID',
        () => {
          cy.deleteCommentAPI(
            noId,
            Cypress.expose(unit1.shortname),
            Cypress.expose('comment2'),
            Cypress.expose(`token_${userGroupAdmin.username}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(500);
          });
        }
      );

      it('404 negative test: should refuse deletion of a comment id that does not exist', () => {
        // Was 200 and a silent no-op until #1628: with no guard on the route, nothing looked the
        // comment up. CommentDeleteGuard has to load it to ask who wrote it, so a made-up id is
        // now answered as what it is.
        cy.deleteCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          noId,
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(404);
        });
      });

      it(
        '404/200 negative test: should return success despite providing an invalid ' +
          'unit ID for comment deletion',
        () => {
          // This test get 200, but maybe should be 500, because we are using a no existent unit.
          // It does not need the unit.
          // to delete the comment. The check was only the right workspace and have the credentials
          cy.deleteCommentAPI(
            Cypress.expose(ws2.id),
            noId,
            Cypress.expose('comment2'),
            Cypress.expose(`token_${userGroupAdmin.username}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(200);
            //  expect(resp.status).to.be.equal(404);
          });
        }
      );

      it('200 positive test: should allow an administrator to successfully delete comments', () => {
        cy.deleteCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          Cypress.expose('comment1'),
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(200);
        });
      });
    });
  });

  // Deleting and hiding used to ask the request who it was: the delete route carried no guard at
  // all, and hiding wanted nothing but a valid token. Both are decided by the stored comment and
  // the workspace now (#1628), and the two rules are deliberately different -- deleting takes
  // authorship or the administration of the workspace, hiding takes comment access, because
  // hiding is part of moderating a discussion one is allowed to write in.
  describe('#1628 deleting and hiding a comment', () => {
    const authorComment: CommentData = {
      body: '<p>Kommentar von userzwei, den andere nicht löschen dürfen</p>',
      userName: `${userGroupAdmin.username}`,
      userId: 0,
      unitId: 0
    };

    before(() => {
      // A token of our own: `token_${user3.username}` holds the user id, not a token (03. stores
      // the response of createUser instead of the one of loginAPI), and a request with it is
      // refused by JwtAuthGuard before any of the guards under test is asked.
      cy.loginAPI(user3.username, user3.password).then(resp => {
        expect(resp.status).to.equal(201);
        Cypress.expose('tokenOfMember', resp.body.accessToken);
      });
      authorComment.userId = parseInt(`${Cypress.expose(`id_${userGroupAdmin.username}`)}`, 10);
      authorComment.unitId = parseInt(`${Cypress.expose(unit1.shortname)}`, 10);
      cy.postCommentAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit1.shortname),
        authorComment,
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(201);
        Cypress.expose('commentOfAuthor', resp.body);
      });
    });

    after(() => {
      // The workspace goes back to the two users the following specs count on (see 20.).
      cy.setUsersOfWsAPI(
        Cypress.expose(ws2.id),
        [
          { id: Cypress.expose(`id_${Cypress.expose('username')}`), access: AccessLevel.Admin },
          { id: Cypress.expose(`id_${userGroupAdmin.username}`), access: AccessLevel.Admin }
        ],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it('401 negative test: should deny hiding a comment to a user without access to the workspace', () => {
      // user3 is in no workspace here. Before #1628 the route asked for nothing but a valid token,
      // so this call hid a comment in a workspace the caller has never been part of. The refusal
      // comes from WorkspaceGuard, which runs ahead of CommentAccessGuard and answers 401; that
      // the token itself is good is what the 200 further down shows.
      cy.patchCommentVisibilityAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentOfAuthor'),
        true,
        Cypress.expose(`id_${user3.username}`),
        Cypress.expose('tokenOfMember')
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('401 negative test: should deny deleting another user\'s comment to a plain member of the workspace', () => {
      cy.setUsersOfWsAPI(
        Cypress.expose(ws2.id),
        [
          { id: Cypress.expose(`id_${Cypress.expose('username')}`), access: AccessLevel.Admin },
          { id: Cypress.expose(`id_${userGroupAdmin.username}`), access: AccessLevel.Admin },
          { id: Cypress.expose(`id_${user3.username}`), access: AccessLevel.Developer }
        ],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
      // Access to the workspace is not permission to remove what others wrote. Before #1628 the
      // delete route had no guard beyond the workspace, so this succeeded with 200.
      cy.deleteCommentAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentOfAuthor'),
        Cypress.expose('tokenOfMember')
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('200 positive test: should allow hiding a comment to a member with comment access', () => {
      cy.patchCommentVisibilityAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentOfAuthor'),
        true,
        Cypress.expose(`id_${user3.username}`),
        Cypress.expose('tokenOfMember')
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it('200 positive test: should allow the author to delete their own comment', () => {
      cy.deleteCommentAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentOfAuthor'),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });
});
