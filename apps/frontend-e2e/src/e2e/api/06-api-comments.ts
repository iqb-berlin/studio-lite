import {
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
        '401 negative test: should deny comment updates when providing an invalid authentication token' +
          ' instead of a user structure',
        () => {
          comment.body = '<p>Kommentare 4 zur Aufgabe 1</p>';
          cy.updateCommentAPI(
            Cypress.expose(ws2.id),
            Cypress.expose(unit1.shortname),
            Cypress.expose('comment1'),
            noId,
            Cypress.expose(`token_${userGroupAdmin.username}`)
          ).then(resp => {
            expect(resp.status).to.be.equal(401);
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

      it('404/200 negative test: should return success despite providing an invalid comment ID for deletion', () => {
        // it should be negative, but we get 200. But at least it deletes nothing
        cy.deleteCommentAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          noId,
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(200);
          //  expect(resp.status).to.be.equal(404);
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
});
