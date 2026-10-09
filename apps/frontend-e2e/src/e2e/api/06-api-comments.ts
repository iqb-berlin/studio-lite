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
  unit1,
  unit2
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
        // Written by userGroupAdmin, whom 60. lets change it as its author. The author is the token's
        // user since #1776; it used to be whoever the body named.
        cy.postCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          comment,
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          Cypress.expose('comment1', resp.body);
          expect(resp.status).to.equal(201);
        });
      });

      it('403 negative test: should deny comment creation for a user without sufficient workspace permissions', () => {
        cy.postCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          comment,
          Cypress.expose(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      });

      it('403 negative test: should deny comment creation when both workspace ID and credentials are invalid', () => {
        cy.postCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          comment,
          Cypress.expose(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      });

      it('404 negative test: should refuse adding a comment under a workspace the unit is not in', () => {
        // Was 201 until #1697: the guards asked about ws1 alone, and the comment went into the
        // discussion of unit1, which is in ws2.
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
          expect(resp.status).to.equal(404);
        });
      });

      it('201 positive test: should allow adding a second comment to the unit in its own workspace', () => {
        // The comment the 404 above refused; 57. and 61. count on it.
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
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          comment2,
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          Cypress.expose('comment2', resp.body);
          expect(resp.status).to.equal(201);
        });
      });

      it('403 negative test: should be refused when trying to add a comment without a workspace ID', () => {
        // A workspace that does not exist is refused before the unit is looked at (#1571)
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
          expect(resp.status).to.equal(403);
        });
      });

      it(
        '201 test: should no longer fail on a body that names no user (#1776)',
        () => {
          // The body is `noId` here, so its userId came out as "undefined" -- that was the 500.
          // Author and unit are the token's and the path's now, and the body names neither. The
          // comment goes again at once: 57. counts two.
          cy.postCommentAPI(
            Cypress.expose(ws2.id),
            Cypress.expose(unit1.shortname),
            noId,
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(201);
            cy.deleteCommentAPI(
              Cypress.expose(ws2.id),
              Cypress.expose(unit1.shortname),
              `${resp.body}`,
              Cypress.expose(`token_${Cypress.expose('username')}`)
            ).its('status').should('equal', 200);
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

      it('404 negative test: should refuse the comments of a unit that does not exist', () => {
        // Was 200 with an empty list until #1697.
        cy.getCommentsAPI(
          Cypress.expose(ws2.id),
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(404);
        });
      });

      it('404 negative test: should refuse the comments of a unit under a workspace it is not in', () => {
        // Was 200 with the whole discussion of unit1 until #1697, to anyone with access to ws1.
        cy.getCommentsAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(unit1.shortname),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(404);
        });
      });

      it(
        '403 negative test: should be refused when attempting to retrieve comments' +
          ' without a valid workspace ID',
        () => {
          cy.getCommentsAPI(
            noId,
            Cypress.expose(unit1.shortname),
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(403);
          });
        }
      );
    });

    describe('58. PATCH /api/workspaces/{workspace_id}/units/{id}/comments', () => {
      it('200 positive test: should allow an authorized user to update the comment visibility timestamp', () => {
        comment.lastSeenCommentChangedAt = new Date();
        cy.updateCommentTimeAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          comment,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(200);
        });
      });

      it('404 negative test: should refuse a timestamp update under a workspace the unit is not in', () => {
        comment.lastSeenCommentChangedAt = new Date();
        cy.updateCommentTimeAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(unit1.shortname),
          comment,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(404);
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
        '403 negative test: should be refused when attempting to update timestamp' +
          ' with invalid request data',
        () => {
          comment.lastSeenCommentChangedAt = new Date();
          cy.updateCommentTimeAPI(
            noId,
            Cypress.expose(unit1.shortname),
            comment,
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(403);
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
            Cypress.expose(ws2.id),
            Cypress.expose(unit1.shortname),
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(200);
          });
        }
      );

      it('404 negative test: should refuse the last seen timestamp under a workspace the unit is not in', () => {
        cy.getCommentTimeAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(unit1.shortname),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(404);
        });
      });

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
        '403 negative test: should be refused when attempting to retrieve last seen timestamp' +
          ' without a valid workspace ID',
        () => {
          cy.getCommentTimeAPI(
            noId,
            Cypress.expose(unit1.shortname),
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(403);
          });
        }
      );
    });

    describe('60. PATCH /api/workspaces/{workspace_id}/units/{id}/comments/{id}', () => {
      it('403 negative test: should deny comment updates even for an administrator if they are not the author', () => {
        comment.body = '<p>Kommentare 4 zur Aufgabe 1</p>';
        cy.updateCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          Cypress.expose('comment1'),
          comment,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(403);
        });
      });

      it(
        '403 negative test: should be refused when attempting to update a comment' +
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
            expect(resp.status).to.be.equal(403);
          });
        }
      );

      it('404 negative test: should refuse an update of a comment under a unit it does not belong to', () => {
        // Was 200 until #1697: only the delete route held the comment to the unit in its path.
        comment.body = '<p>Kommentare 4 zur Aufgabe 1</p>';
        cy.updateCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit2.shortname),
          Cypress.expose('comment1'),
          comment,
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(404);
        });
      });

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
      it('403 negative test: should deny comment deletion for a user without sufficient privileges', () => {
        cy.deleteCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          Cypress.expose('comment2'),
          Cypress.expose(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(403);
        });
      });

      it(
        '403 negative test: should be refused when attempting to delete a comment' +
          ' using an invalid workspace ID',
        () => {
          cy.deleteCommentAPI(
            noId,
            Cypress.expose(unit1.shortname),
            Cypress.expose('comment2'),
            Cypress.expose(`token_${userGroupAdmin.username}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(403);
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

      it('404 negative test: should refuse deletion of a comment when providing an invalid unit ID', () => {
        cy.deleteCommentAPI(
          Cypress.expose(ws2.id),
          noId,
          Cypress.expose('comment2'),
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(404);
        });
      });

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

    it('403 negative test: should deny hiding a comment to a user without access to the workspace', () => {
      // user3 is in no workspace here. Before #1628 the route asked for nothing but a valid token,
      // so this call hid a comment in a workspace the caller has never been part of. The refusal
      // comes from WorkspaceGuard, which runs ahead of CommentAccessGuard and answers 403 (401
      // until #1706); that the token itself is good is what the 200 further down shows.
      cy.patchCommentVisibilityAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentOfAuthor'),
        true,
        Cypress.expose(`id_${user3.username}`),
        Cypress.expose('tokenOfMember')
      ).then(resp => {
        expect(resp.status).to.equal(403);
      });
    });

    it('403 negative test: should deny deleting another user\'s comment to a plain member of the workspace', () => {
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
        expect(resp.status).to.equal(403);
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

  describe('#1696 #1697 a comment asked for under another unit or workspace', () => {
    // The author asks, so every guard about permissions would let the call through. What answers
    // 404 is the path: CommentInUnitGuard for unit2, which is in ws2 as well but not the comment's
    // unit, and UnitInWorkspaceGuard for ws1, which unit1 is not in. unit1 lives in ws2 (moved there
    // in 05.); the author is an admin of ws1 as well (03.), so ws1 passes every guard that asks
    // about the workspace alone.
    const unitComment: CommentData = {
      body: '<p>Kommentar, der nur unter seiner eigenen Aufgabe zu finden ist</p>',
      userName: `${userGroupAdmin.username}`,
      userId: 0,
      unitId: 0
    };

    before(() => {
      unitComment.userId = parseInt(`${Cypress.expose(`id_${userGroupAdmin.username}`)}`, 10);
      unitComment.unitId = parseInt(`${Cypress.expose(unit1.shortname)}`, 10);
      cy.postCommentAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit1.shortname),
        unitComment,
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(201);
        Cypress.expose('commentInUnit', resp.body);
      });
    });

    it('404 negative test: should refuse hiding the comment under another unit', () => {
      cy.patchCommentVisibilityAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit2.shortname),
        Cypress.expose('commentInUnit'),
        true,
        Cypress.expose(`id_${userGroupAdmin.username}`),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('404 negative test: should refuse voting on the comment under another unit', () => {
      cy.voteCommentAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit2.shortname),
        Cypress.expose('commentInUnit'),
        'up',
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('404 negative test: should refuse listing the voters of the comment under another unit', () => {
      cy.getCommentVotersAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit2.shortname),
        Cypress.expose('commentInUnit'),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('404 negative test: should refuse changing the items of the comment under another unit', () => {
      cy.patchCommentItemsAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit2.shortname),
        Cypress.expose('commentInUnit'),
        [],
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('404 negative test: should refuse deleting the comment under a unit id that is not a number', () => {
      // Before #1696 `Number('abc') || 0` read as "no unit given", and the check was skipped.
      cy.deleteCommentAPI(
        Cypress.expose(ws2.id),
        'abc',
        Cypress.expose('commentInUnit'),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('404 negative test: should refuse changing the comment under a unit of another workspace', () => {
      cy.updateCommentAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentInUnit'),
        unitComment,
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('404 negative test: should refuse changing the items of the comment under another workspace', () => {
      cy.patchCommentItemsAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentInUnit'),
        [],
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('404 negative test: should refuse hiding the comment under another workspace', () => {
      cy.patchCommentVisibilityAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentInUnit'),
        true,
        Cypress.expose(`id_${userGroupAdmin.username}`),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('404 negative test: should refuse voting on the comment under another workspace', () => {
      cy.voteCommentAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentInUnit'),
        'up',
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('404 negative test: should refuse listing the voters of the comment under another workspace', () => {
      cy.getCommentVotersAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentInUnit'),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('404 negative test: should refuse deleting the comment under another workspace', () => {
      cy.deleteCommentAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentInUnit'),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('201 positive test: should create a comment on the unit of the path, not the one the body names', () => {
      // The body names unit1, the path unit2. Until #1697 the body's unit was saved as sent, so
      // the path's guards checked one unit and the comment went to another -- of any workspace.
      // Deleting it under unit2 only works if it was written there.
      cy.postCommentAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit2.shortname),
        unitComment,
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(created => {
        expect(created.status).to.equal(201);
        cy.deleteCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit2.shortname),
          String(created.body),
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).its('status').should('equal', 200);
      });
    });

    it('201/200 positive test: should still let voting and listing the voters through under the own path', () => {
      cy.voteCommentAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentInUnit'),
        'up',
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(201);
      });
      cy.getCommentVotersAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentInUnit'),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        // Only the vote above: none of the refused calls reached the handler.
        expect(resp.body).to.have.length(1);
      });
    });

    it('200 positive test: should still let changing the items through under the own path', () => {
      cy.patchCommentItemsAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentInUnit'),
        [],
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it('200 positive test: should still find the comment under its own unit and workspace', () => {
      // The 404s above are about the path, not a comment that is gone: under its own unit and
      // workspace the same comment is there, and is deleted.
      cy.deleteCommentAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose('commentInUnit'),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('#1776 the author of a comment is the token\'s user', () => {
    // The admin writes; the body names userGroupAdmin. Until #1776 the comment was saved as theirs,
    // and counted as theirs for changing and deleting it.
    const adminToken = () => Cypress.expose(`token_${Cypress.expose('username')}`);
    const groupAdminToken = () => Cypress.expose(`token_${userGroupAdmin.username}`);
    const commentsOf = (unit: string) => `${Cypress.expose(ws2.id)}/units/${Cypress.expose(unit)}/comments`;
    const forgedName = 'Jemand anderes';
    const forged = () => ({
      body: '<p>Kommentar unter fremdem Namen</p>',
      userName: forgedName,
      userId: Number(Cypress.expose(`id_${userGroupAdmin.username}`)),
      hidden: false
    });
    let forgedCommentId = '';

    before(() => {
      cy.requestWorkspaceAPI('POST', commentsOf(unit1.shortname), adminToken(), forged()).then(resp => {
        expect(resp.status).to.equal(201);
        forgedCommentId = `${resp.body}`;
      });
    });

    after(() => {
      cy.deleteCommentAPI(Cypress.expose(ws2.id), Cypress.expose(unit1.shortname), forgedCommentId, adminToken());
    });

    it('201 positive test: should sign a new comment with the caller, whatever user the body names', () => {
      cy.requestWorkspaceAPI('GET', commentsOf(unit1.shortname), adminToken()).then(resp => {
        const stored = (resp.body as { id: number; userId: number; userName: string }[])
          .find(unitComment => `${unitComment.id}` === forgedCommentId);
        expect(stored?.userId).to.equal(Number(Cypress.expose(`id_${Cypress.expose('username')}`)));
        expect(stored?.userName).to.be.a('string').and.not.be.empty.and.not.equal(forgedName);
      });
    });

    it('403 negative test: should not let the user the body named change the comment', () => {
      cy.requestWorkspaceAPI(
        'PATCH',
        `${commentsOf(unit1.shortname)}/${forgedCommentId}`,
        groupAdminToken(),
        { body: '<p>übernommen</p>' }
      ).its('status').should('equal', 403);
    });

    it('404 negative test: should refuse a reply to a comment of another unit', () => {
      cy.requestWorkspaceAPI(
        'POST',
        commentsOf(unit2.shortname),
        adminToken(),
        { ...forged(), parentId: Number(forgedCommentId) }
      ).its('status').should('equal', 404);
    });

    it('201 positive test: should take a reply to a comment of the same unit, but no reply to the reply', () => {
      // Replies are made to the root comment, as the frontend does; a reply to a reply would outlive
      // its root, whose deletion takes only the direct replies along.
      cy.requestWorkspaceAPI(
        'POST',
        commentsOf(unit1.shortname),
        adminToken(),
        { ...forged(), parentId: Number(forgedCommentId) }
      ).then(resp => {
        expect(resp.status).to.equal(201);
        cy.requestWorkspaceAPI(
          'POST',
          commentsOf(unit1.shortname),
          adminToken(),
          { ...forged(), parentId: Number(resp.body) }
        ).its('status').should('equal', 404);
        cy.deleteCommentAPI(Cypress.expose(ws2.id), Cypress.expose(unit1.shortname), `${resp.body}`, adminToken());
      });
    });

    it('201 positive test: should write a new comment, not overwrite the one whose id the body sends', () => {
      // An id in the body made TypeORM's save() an update of that comment -- of any unit, which it
      // then moved to the unit of the path and signed with the caller's name.
      cy.requestWorkspaceAPI(
        'POST',
        commentsOf(unit2.shortname),
        adminToken(),
        { ...forged(), id: Number(forgedCommentId), body: '<p>übernommen</p>' }
      ).then(resp => {
        expect(resp.status).to.equal(201);
        expect(`${resp.body}`).not.to.equal(forgedCommentId);
        cy.requestWorkspaceAPI('GET', commentsOf(unit1.shortname), adminToken()).then(comments => {
          const original = (comments.body as { id: number; body: string }[])
            .find(unitComment => `${unitComment.id}` === forgedCommentId);
          expect(original?.body).to.equal(forged().body);
        });
        cy.deleteCommentAPI(Cypress.expose(ws2.id), Cypress.expose(unit2.shortname), `${resp.body}`, adminToken())
          .its('status').should('equal', 200);
      });
    });

    it('200 positive test: should set the caller\'s last seen timestamp, not the one the body names', () => {
      const ownTime = '2026-01-01T10:00:00.000Z';
      const forgedTime = '2026-02-02T10:00:00.000Z';
      cy.requestWorkspaceAPI(
        'PATCH',
        commentsOf(unit1.shortname),
        groupAdminToken(),
        { userId: Number(Cypress.expose(`id_${userGroupAdmin.username}`)), lastSeenCommentChangedAt: ownTime }
      ).its('status').should('equal', 200);
      cy.requestWorkspaceAPI('GET', `${commentsOf(unit1.shortname)}/last-seen`, groupAdminToken())
        .its('body').should('equal', ownTime);
      cy.requestWorkspaceAPI(
        'PATCH',
        commentsOf(unit1.shortname),
        adminToken(),
        { userId: Number(Cypress.expose(`id_${userGroupAdmin.username}`)), lastSeenCommentChangedAt: forgedTime }
      ).its('status').should('equal', 200);
      cy.requestWorkspaceAPI('GET', `${commentsOf(unit1.shortname)}/last-seen`, groupAdminToken())
        .its('body').should('equal', ownTime);
      cy.requestWorkspaceAPI('GET', `${commentsOf(unit1.shortname)}/last-seen`, adminToken())
        .its('body').should('equal', forgedTime);
    });
  });

  // A comment is about the items of its own unit. Its item links took any item uuid, also one of
  // another unit, possibly in another workspace (#1815). unit1 and unit2 both live in ws2.
  describe('#1815 the items a comment is tied to', () => {
    const token = () => Cypress.expose(`token_${userGroupAdmin.username}`);
    const unitPath = (unit: string) => `${Cypress.expose(ws2.id)}/units/${Cypress.expose(unit)}`;
    const ids = { comment: '', ownItem: '', otherItem: '' };

    before(() => {
      const itemComment: CommentData = {
        body: '<p>Kommentar zu Items (#1815)</p>',
        userName: `${userGroupAdmin.username}`,
        userId: parseInt(`${Cypress.expose(`id_${userGroupAdmin.username}`)}`, 10),
        unitId: parseInt(`${Cypress.expose(unit1.shortname)}`, 10)
      };
      cy.postCommentAPI(Cypress.expose(ws2.id), Cypress.expose(unit1.shortname), itemComment, token()).then(resp => {
        expect(resp.status).to.equal(201);
        ids.comment = `${resp.body}`;
      });
      cy.requestWorkspaceAPI('POST', `${unitPath(unit1.shortname)}/items`, token(), { id: 'item_1815' })
        .then(resp => {
          ids.ownItem = resp.body;
        });
      cy.requestWorkspaceAPI('POST', `${unitPath(unit2.shortname)}/items`, token(), { id: 'item_1815' })
        .then(resp => {
          ids.otherItem = resp.body;
        });
    });

    after(() => {
      cy.requestWorkspaceAPI('DELETE', `${unitPath(unit1.shortname)}/comments/${ids.comment}`, token());
      cy.requestWorkspaceAPI('DELETE', `${unitPath(unit1.shortname)}/items/${ids.ownItem}`, token());
      cy.requestWorkspaceAPI('DELETE', `${unitPath(unit2.shortname)}/items/${ids.otherItem}`, token());
    });

    it('200 positive test: should tie a comment to the items of its unit, and not to one of another unit', () => {
      cy.requestWorkspaceAPI(
        'PATCH',
        `${unitPath(unit1.shortname)}/comments/${ids.comment}/items`,
        token(),
        { userId: 0, unitItemUuids: [ids.ownItem, ids.otherItem] }
      ).its('status').should('equal', 200);
      cy.requestWorkspaceAPI('GET', `${unitPath(unit1.shortname)}/comments`, token()).then(resp => {
        const tied = (resp.body as { id: number; itemUuids: string[] }[])
          .find(unitComment => `${unitComment.id}` === ids.comment);
        expect(tied?.itemUuids).to.deep.equal([ids.ownItem]);
      });
    });
  });
});
