import {
  ReviewData,
  CommentData,
  UserData
} from '../../support/testData';
import {
  noId,
  userGroupAdmin,
  ws1,
  ws2,
  unit1,
  unit4
} from '../../support/util-api';

describe('Review API tests', () => {
  const reviewName1: string = 'Teil1';
  const reviewName2: string = 'Teil2';

  describe('62. POST /api/workspaces/{workspace_id}/reviews', () => {
    it('201 positive test: should allow an authorized user to create a new review in a workspace', () => {
      cy.addReviewAPI(Cypress.expose(ws1.id),
        reviewName1,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.be.equal(201);
          Cypress.expose('id_review1', resp.body);
        });
      cy.addReviewAPI(Cypress.expose(ws1.id),
        reviewName2,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(res => {
          expect(res.status).to.be.equal(201);
          Cypress.expose('id_review2', res.body);
        });
    });

    it('403 negative test: should be refused when attempting to create ' +
      'a review without a valid workspace ID', () => {
      cy.addReviewAPI(noId,
        reviewName2,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.be.equal(403);
        });
    });

    it('401 negative test: should deny review creation when no authentication token is provided', () => {
      cy.addReviewAPI(Cypress.expose(ws1.id),
        reviewName2,
        noId)
        .then(resp => {
          expect(resp.status).to.be.equal(401);
        });
    });
  });

  describe('63. GET /api/workspaces/{workspace_id}/reviews/{ids}', () => {
    it('200 positive test: should successfully retrieve the details of reviews for a specified workspace', () => {
      cy.getReviewAPI(Cypress.expose(ws1.id),
        Cypress.expose('id_review1'),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.be.equal(200);
          Cypress.expose('link_review1', resp.body.link);
        });
      cy.getReviewAPI(Cypress.expose(ws1.id),
        Cypress.expose('id_review2'),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp2 => {
          expect(resp2.status).to.be.equal(200);
          Cypress.expose('link_review2', resp2.body.link);
        });
    });

    it('403 negative test: should be refused when requesting reviews without a valid workspace ID', () => {
      cy.getReviewAPI(noId,
        Cypress.expose('id_review1'),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.be.equal(403);
        });
    });

    it('401 negative test: should deny access to review details when no valid credentials are provided', () => {
      cy.getReviewAPI(Cypress.expose(ws1.id),
        Cypress.expose('id_review1'),
        noId)
        .then(resp => {
          expect(resp.status).to.be.equal(401);
        });
    });
  });

  describe('64. PATCH /api/workspaces/{workspace_id}/reviews/{id}', () => {
    let review1: ReviewData;
    before(() => {
      review1 = {
        link: Cypress.expose('link_review1'),
        id: parseInt(Cypress.expose('id_review1'), 10),
        name: 'Teil1',
        units: [Cypress.expose(unit4.shortname)]
      };
    });

    it('200 positive test: should allow an authorized user to update a specific review', () => {
      cy.updateReviewAPI(Cypress.expose(ws1.id),
        review1,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('403 negative test: should be refused when attempting to update ' +
      'a review without a workspace ID', () => {
      cy.updateReviewAPI(noId,
        review1,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('401 negative test: should deny review updates when no authentication token is provided', () => {
      cy.updateReviewAPI(Cypress.expose(ws1.id),
        review1,
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('65. GET /api/workspaces/{workspace_id}/reviews/', () => {
    it('200 positive test: should retrieve a list of all reviews in a workspace for an authorized user', () => {
      cy.getAllReviewAPI(Cypress.expose(ws1.id),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.length).to.equal(2);
        });
    });

    it('403 negative test: should be refused when attempting to list ' +
      'all reviews without a workspace ID', () => {
      cy.getAllReviewAPI(noId,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('401 negative test: should deny listing of all reviews when no valid credentials are provided', () => {
      cy.getAllReviewAPI(Cypress.expose(ws1.id),
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('66. GET /api/reviews/{review_id}', () => {
    it('200 positive test: should successfully retrieve details for a specific review window', () => {
      cy.getReviewWindowAPI(Cypress.expose('id_review1'), Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.units[0]).equal(parseInt(Cypress.expose(unit4.shortname), 10));
        });
    });

    it('403 negative test: should return error when requesting a review window using an invalid ID', () => {
      // A review that does not exist is refused like one the user may not open, so the answer does
      // not tell which review ids exist (#1818). It used to be a 404.
      cy.getReviewWindowAPI(noId, Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('401 negative test: should deny access to a review window when no valid credentials are provided', () => {
      cy.getReviewWindowAPI(Cypress.expose('id_review1'), noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('67. GET /api/reviews/{review_id}/units/{id}/properties', () => {
    it('200 positive test: should retrieve the properties of a unit within a specific review context', () => {
      cy.getReviewPropertiesAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.name).to.equal('Tier4');
        });
    });

    it('403 negative test: should deny unit properties under a review the unit is not part of', () => {
      // Was 500 before #1630: nothing compared the unit in the path with the review in it, and the
      // answer depended on whether the id happened to exist.
      cy.getReviewPropertiesAPI(noId,
        Cypress.expose(unit4.shortname),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('403 negative test: should deny review properties for a unit id the review does not contain', () => {
      cy.getReviewDefinitionAPI(Cypress.expose('id_review1'),
        noId,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('401 negative test: should deny access to unit review properties when no credentials are provided', () => {
      cy.getReviewDefinitionAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('68. GET /api/reviews/{review_id}/units/{id}/definition', () => {
    it('200 positive test: should successfully retrieve the full unit definition within a review session', () => {
      cy.getReviewDefinitionAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.variables[1].id).to.be.oneOf(['text_1', 'text-area_1']);
        });
    });

    it('403 negative test: should deny a unit definition under a review that does not contain it', () => {
      // Handed out the definition with 200 before #1630, for any review id at all.
      cy.getReviewDefinitionAPI(noId,
        Cypress.expose(unit4.shortname),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('403 negative test: should deny a unit definition for a unit id the review does not contain', () => {
      cy.getReviewDefinitionAPI(Cypress.expose('id_review1'),
        noId,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('401 negative test: should deny access to the review unit definition ' +
      'when no valid credentials are provided', () => {
      cy.getReviewDefinitionAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('69. GET /api/reviews/{review_id}/units/{id}/scheme', () => {
    it('200 positive test: should successfully retrieve the variable coding scheme for a unit in a review', () => {
      cy.getReviewSchemeAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.schemeType).to.equal('iqb@3.0');
          expect(resp.body.variables[1].id).to.be.oneOf(['text_1', 'text-area_1']);
        });
    });

    it('403 negative test: should deny a coding scheme under a review that does not contain the unit', () => {
      // The coding scheme of any unit, for any review id, with 200 -- until #1630.
      cy.getReviewSchemeAPI(noId,
        Cypress.expose(unit4.shortname),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('403 negative test: should deny a coding scheme for a unit id the review does not contain', () => {
      cy.getReviewSchemeAPI(Cypress.expose('id_review1'),
        noId,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('401 negative test: should deny access to the review scheme when no' +
      ' authentication token is provided', () => {
      cy.getReviewSchemeAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('70. POST /api/reviews/{review_id}/units/{unit_id}/comments}', () => {
    let cd: CommentData;
    before(() => {
      cd = {
        body: 'New comment from review',
        parentId: undefined,
        unitId: parseInt(Cypress.expose(unit4.shortname), 10),
        userId: parseInt(Cypress.expose(`id_${Cypress.expose('username')}`), 10),
        userName: Cypress.expose('username')
      };
    });

    it('403 negative test: should deny writing a comment into a review that does not contain the unit', () => {
      // This wrote a comment into the database before #1630 -- attached to a unit, under a review
      // id that had nothing to do with it.
      cd.body = 'New comment review created without review id in the path';
      cy.createCommentReviewAPI(noId,
        Cypress.expose(unit4.shortname),
        cd,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('403 negative test: should deny writing a comment for a unit id the review does not contain', () => {
      cd.body = 'New comment review created without unit id in the path';
      cy.createCommentReviewAPI(Cypress.expose('id_review1'),
        noId,
        cd,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('401 negative test: should deny adding a review comment when no valid credentials are provided', () => {
      cy.createCommentReviewAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        cd,
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('201 positive test: should allow an authorized user to add a new comment within a review session', () => {
      cd.body = 'New comment review';
      cy.createCommentReviewAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        cd,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(201);
          Cypress.expose('id_commentReview', resp.body);
        });
    });
  });

  describe('71. GET /api/reviews/{review_id}/units/{unit_id}/comments}', () => {
    it('403 negative test: should deny reading comments under a review that does not contain the unit', () => {
      // Handed out the unit's comments for any review id before #1630.
      cy.getCommentReviewAPI(noId,
        Cypress.expose(unit4.shortname),
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('403 negative test: should deny reading comments for a unit id the review does not contain', () => {
      cy.getCommentReviewAPI(Cypress.expose('id_review1'),
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('401 negative test: should deny access to review comments when no valid credentials are provided', () => {
      cy.getCommentReviewAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('200 positive test: should successfully retrieve all comments for a specific unit in a review session', () => {
      cy.getCommentReviewAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          // One, not three: the two comments the refused calls above used to write are no longer
          // created (#1630).
          expect(resp.body.length).to.equal(1);
        });
    });
  });

  describe('72. PATCH /api/reviews/{review_id}/units/{unit_id}/comments/{id}', () => {
    let mcd: CommentData;
    before(() => {
      mcd = {
        body: 'New comment from review',
        userId: parseInt(Cypress.expose(`id_${Cypress.expose('username')}`), 10)
      };
    });
    it('403 negative test: should deny updating a comment under a review that does not contain the unit', () => {
      // Reached the comment and wrote to it before #1630, review id notwithstanding.
      mcd.body = 'Update comment review created without review id in the path';
      cy.updateCommentReviewAPI(noId,
        Cypress.expose(unit4.shortname),
        Cypress.expose('id_commentReview'),
        mcd,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('403 negative test: should deny updating a comment for a unit id the review does not contain', () => {
      mcd.body = 'Update comment review created without unit id in the path';
      cy.updateCommentReviewAPI(Cypress.expose('id_review1'),
        noId,
        Cypress.expose('id_commentReview'),
        mcd,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('404 negative test: should return error when attempting to update a review comment using an invalid ID', () => {
      cy.updateCommentReviewAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        noId,
        mcd,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(404);
        });
    });

    it('500/200 negative test: should return success even when submitting empty comment data during an update', () => {
      // It does not update the database, but it should return an error 400
      cy.updateCommentReviewAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        Cypress.expose('id_commentReview'),
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          // expect(resp.status).to.equal(500); should
        });
    });

    it('401 negative test: should deny review comment updates when no valid credentials are provided', () => {
      cy.updateCommentReviewAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        Cypress.expose('id_commentReview'),
        mcd,
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('200 positive test: should successfully update an existing review comment for an authorized user', () => {
      mcd.body = 'Update comment from review';
      cy.updateCommentReviewAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        Cypress.expose('id_commentReview'),
        mcd,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
  });

  describe('73. DELETE /api/reviews/{review_id}/units/{unit_id}/comments/{id}', () => {
    it('403 negative test: should deny deleting a comment under a review that does not contain the unit', () => {
      // Deleted the row before #1630, whatever review the path named.
      cy.deleteCommentReviewAPI(noId,
        Cypress.expose(unit4.shortname),
        Cypress.expose('id_commentReview'),
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('403 negative test: should deny deleting a comment for a unit id the review does not contain', () => {
      cy.deleteCommentReviewAPI(Cypress.expose('id_review1'),
        noId,
        Cypress.expose('id_commentReview'),
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('404 negative test: should return error when attempting to delete' +
      ' a non-existent review comment ID', () => {
      // The delete route looks the comment up before deleting it, to ask who wrote it (#1784). It
      // used to delete nothing and answer 200.
      cy.deleteCommentReviewAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(404);
        });
    });

    it('401 negative test: should deny review comment deletion when no valid credentials are provided', () => {
      cy.deleteCommentReviewAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        Cypress.expose('id_commentReview'),
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('200 positive test: should successfully delete a review comment for an authorized administrator', () => {
      cy.deleteCommentReviewAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        Cypress.expose('id_commentReview'),
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });
  });

  // The routes under reviews/:review_id left two questions unasked until #1630: whether the review
  // in the path is the one the token was issued for, and whether the unit in the path belongs to
  // that review. The cases above cover the second one with ids that exist nowhere; these two use a
  // real review login and a real unit of another workspace, which is what the ticket described.
  describe('#1630 a review login reaches its own review, and only its units', () => {
    const reviewPassword: string = 'reviewpass';
    let review1: ReviewData;

    before(() => {
      review1 = {
        id: parseInt(Cypress.expose('id_review1'), 10),
        link: Cypress.expose('link_review1'),
        name: reviewName1
      };
      cy.setReviewPasswordAPI(
        Cypress.expose(ws1.id),
        review1,
        reviewPassword,
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
      // A review login: the link is the user name, and the token it returns carries the review
      // instead of a user (see LocalStrategy).
      cy.loginAPI(Cypress.expose('link_review1'), reviewPassword).then(resp => {
        expect(resp.status).to.equal(201);
        Cypress.expose('tokenOfReview1', resp.body.accessToken);
      });
    });

    it('200 positive test: should let a review login read a unit of its own review', () => {
      cy.getReviewPropertiesAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        Cypress.expose('tokenOfReview1'))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.name).to.equal('Tier4');
        });
    });

    it('403 negative test: should deny a review login the review it was not issued for', () => {
      // Same token, another review of the same workspace. This answered before #1630.
      cy.getReviewPropertiesAPI(Cypress.expose('id_review2'),
        Cypress.expose(unit4.shortname),
        Cypress.expose('tokenOfReview1'))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('403 negative test: should deny a unit of another workspace under a review that has it not', () => {
      // unit1 exists and is not in review1. Knowing its id was enough before #1630.
      cy.getReviewPropertiesAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit1.shortname),
        Cypress.expose('tokenOfReview1'))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('403 negative test: should deny the same foreign unit to a logged-in user as well', () => {
      // The unit half of the guard does not depend on how one is logged in.
      cy.getReviewPropertiesAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit1.shortname),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    // A vote belongs to a user account, and a review login has none: its token carries user 0.
    // The vote used to fail on the vote table's foreign key to `user` (#1730).
    it('403 negative test: should refuse a vote from a review login, and still take one from a user', () => {
      const adminToken = Cypress.expose(`token_${Cypress.expose('username')}`);
      const comment: CommentData = {
        body: 'Comment to vote on',
        parentId: undefined,
        unitId: parseInt(Cypress.expose(unit4.shortname), 10),
        userId: parseInt(Cypress.expose(`id_${Cypress.expose('username')}`), 10),
        userName: Cypress.expose('username')
      };
      cy.createCommentReviewAPI(Cypress.expose('id_review1'), Cypress.expose(unit4.shortname), comment, adminToken)
        .then(created => {
          expect(created.status).to.equal(201);
          const commentId = String(created.body);
          cy.voteCommentReviewAPI(
            Cypress.expose('id_review1'),
            Cypress.expose(unit4.shortname),
            commentId,
            'up',
            Cypress.expose('tokenOfReview1')
          ).its('status').should('equal', 403);
          cy.voteCommentReviewAPI(
            Cypress.expose('id_review1'),
            Cypress.expose(unit4.shortname),
            commentId,
            'up',
            adminToken
          ).its('status').should('be.within', 200, 299);
          cy.deleteCommentReviewAPI(
            Cypress.expose('id_review1'),
            Cypress.expose(unit4.shortname),
            commentId,
            adminToken
          ).its('status').should('equal', 200);
        });
    });

    // The body names the admin as the author and unit1 as the unit. Both used to be saved as sent:
    // a review login could write in a user's name, on a unit outside its review (#1776).
    const forgedReviewComment = (): CommentData => ({
      body: 'Kommentar mit fremden Angaben',
      parentId: undefined,
      unitId: parseInt(Cypress.expose(unit1.shortname), 10),
      userId: parseInt(Cypress.expose(`id_${Cypress.expose('username')}`), 10),
      userName: 'Besucherin'
    });
    const storedReviewComment = (commentId: string, token: string) => cy
      .getCommentReviewAPI(Cypress.expose('id_review1'), Cypress.expose(unit4.shortname), token)
      .then(resp => (resp.body as { id: number; unitId: number; userId: number; userName: string }[])
        .find(unitComment => `${unitComment.id}` === commentId));

    it('201 positive test: should take a review login\'s comment as no user\'s, on the unit of the path', () => {
      cy.createCommentReviewAPI(
        Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        forgedReviewComment(),
        Cypress.expose('tokenOfReview1')
      ).then(created => {
        expect(created.status).to.equal(201);
        const commentId = String(created.body);
        storedReviewComment(commentId, Cypress.expose('tokenOfReview1')).then(stored => {
          expect(stored?.unitId).to.equal(parseInt(Cypress.expose(unit4.shortname), 10));
          expect(stored?.userId).to.equal(0);
          // A review login has no name of its own: its visitor signs with the one typed.
          expect(stored?.userName).to.equal('Besucherin');
        });
        cy.deleteCommentReviewAPI(
          Cypress.expose('id_review1'),
          Cypress.expose(unit4.shortname),
          commentId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).its('status').should('equal', 200);
      });
    });

    it('201 positive test: should sign a logged-in user\'s review comment with their own name', () => {
      const groupAdminToken = Cypress.expose(`token_${userGroupAdmin.username}`);
      cy.createCommentReviewAPI(
        Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        forgedReviewComment(),
        groupAdminToken
      ).then(created => {
        expect(created.status).to.equal(201);
        const commentId = String(created.body);
        storedReviewComment(commentId, groupAdminToken).then(stored => {
          expect(stored?.userId).to.equal(parseInt(Cypress.expose(`id_${userGroupAdmin.username}`), 10));
          expect(stored?.userName).to.be.a('string').and.not.be.empty.and.not.equal('Besucherin');
        });
        cy.deleteCommentReviewAPI(
          Cypress.expose('id_review1'),
          Cypress.expose(unit4.shortname),
          commentId,
          groupAdminToken
        ).its('status').should('equal', 200);
      });
    });
  });

  // Under reviews/:review_id only a review login carried a review that was compared with the path;
  // any logged-in user reached any review by its id. Someone without access to the review's
  // workspace uses its link and password instead (#1818). review1 lives in ws1.
  describe('#1818 a logged-in user reaches only reviews of their workspaces', () => {
    const outsider: UserData = { username: 'ohnebereich', password: 'paso', isAdmin: false };
    const adminToken = () => Cypress.expose(`token_${Cypress.expose('username')}`);
    const outsiderToken = () => Cypress.expose(`token_${outsider.username}`);

    before(() => {
      cy.createUserAPI(outsider, adminToken()).then(resp => {
        expect(resp.status).to.equal(201);
        Cypress.expose(`id_${outsider.username}`, resp.body);
      });
      cy.loginAPI(outsider.username, outsider.password).then(resp => {
        expect(resp.status).to.equal(201);
        Cypress.expose(`token_${outsider.username}`, resp.body.accessToken);
      });
    });

    after(() => {
      cy.deleteUsersAPI([Cypress.expose(`id_${outsider.username}`)], adminToken());
    });

    it('403 negative test: should not let a user without access to the workspace read the review', () => {
      cy.getReviewWindowAPI(Cypress.expose('id_review1'), outsiderToken())
        .its('status').should('equal', 403);
    });

    it('403 negative test: should not let them read a unit of the review', () => {
      cy.getReviewPropertiesAPI(Cypress.expose('id_review1'), Cypress.expose(unit4.shortname), outsiderToken())
        .its('status').should('equal', 403);
    });

    it('403 negative test: should not let them read the comments on a unit of the review', () => {
      cy.getCommentReviewAPI(Cypress.expose('id_review1'), Cypress.expose(unit4.shortname), outsiderToken())
        .its('status').should('equal', 403);
    });

    it('403 negative test: should not let them write a comment', () => {
      const comment: CommentData = {
        body: 'Kommentar ohne Zugriff auf den Arbeitsbereich',
        unitId: parseInt(Cypress.expose(unit4.shortname), 10)
      };
      cy.createCommentReviewAPI(
        Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        comment,
        outsiderToken()
      ).its('status').should('equal', 403);
    });

    it('403 negative test: should answer a review that does not exist the same way', () => {
      cy.getReviewWindowAPI(noId, outsiderToken())
        .its('status').should('equal', 403);
    });

    it('200 positive test: should still let a user of the workspace read the review and its unit', () => {
      cy.getReviewWindowAPI(Cypress.expose('id_review1'), adminToken())
        .its('status').should('equal', 200);
      cy.getReviewPropertiesAPI(Cypress.expose('id_review1'), Cypress.expose(unit4.shortname), adminToken())
        .its('status').should('equal', 200);
    });
  });

  // Under reviews/:review_id the review's settings were what the studio showed, not what the API
  // answered; and any comment could be changed and deleted, by a review login as well (#1784).
  describe('#1784 the review\'s settings, and what may be done to a comment', () => {
    const adminToken = () => Cypress.expose(`token_${Cypress.expose('username')}`);
    const groupAdminToken = () => Cypress.expose(`token_${userGroupAdmin.username}`);
    const visitorToken = () => Cypress.expose('tokenOfReview1');
    const commentUrl = (commentId: string, rest = '') => `/api/reviews/${Cypress.expose('id_review1')}/units/` +
      `${Cypress.expose(unit4.shortname)}/comments/${commentId}${rest}`;
    const patchAs = (token: string, url: string, body: object) => cy.request({
      method: 'PATCH',
      url,
      headers: { 'app-version': Cypress.expose('version'), authorization: `bearer ${token}` },
      body,
      failOnStatusCode: false
    });
    const comment = (body: string): CommentData => ({ body, userName: 'Besucherin' });
    const ids = { visitorComment: '', userComment: '' };

    before(() => {
      cy.createCommentReviewAPI(
        Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        comment('Kommentar über den Link (#1784)'),
        visitorToken()
      ).then(resp => {
        expect(resp.status).to.equal(201);
        ids.visitorComment = `${resp.body}`;
      });
      cy.createCommentReviewAPI(
        Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        comment('Kommentar eines Kontos (#1784)'),
        adminToken()
      ).then(resp => {
        expect(resp.status).to.equal(201);
        ids.userComment = `${resp.body}`;
      });
    });

    const updateAs = (token: string, commentId: string) => cy
      .updateCommentReviewAPI(Cypress.expose('id_review1'), Cypress.expose(unit4.shortname), commentId, comment('neu'), token);
    const deleteAs = (token: string, commentId: string) => cy
      .deleteCommentReviewAPI(Cypress.expose('id_review1'), Cypress.expose(unit4.shortname), commentId, token);

    after(() => {
      deleteAs(adminToken(), ids.userComment);
    });

    it('403 negative test: should not let a review login change, hide or delete a comment', () => {
      updateAs(visitorToken(), ids.visitorComment).its('status').should('equal', 403);
      patchAs(visitorToken(), commentUrl(ids.visitorComment, '/hidden'), { hidden: true })
        .its('status').should('equal', 403);
      deleteAs(visitorToken(), ids.visitorComment).its('status').should('equal', 403);
    });

    it('200 positive test: should let a review login tie its own new comment to items, and no one else\'s', () => {
      patchAs(visitorToken(), commentUrl(ids.visitorComment, '/items'), { unitItemUuids: [] })
        .its('status').should('equal', 200);
      patchAs(visitorToken(), commentUrl(ids.userComment, '/items'), { unitItemUuids: [] })
        .its('status').should('equal', 403);
    });

    it('403 negative test: should leave changing a comment to its author', () => {
      updateAs(groupAdminToken(), ids.userComment).its('status').should('equal', 403);
    });

    it('200 positive test: should let the group admin delete the comment of a review login', () => {
      deleteAs(groupAdminToken(), ids.visitorComment).its('status').should('equal', 200);
    });

    it('200 positive test: should not hand the password to a review login', () => {
      cy.getReviewAsReviewerAPI(Cypress.expose('id_review1'), visitorToken()).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body).not.to.have.property('password');
      });
    });

    describe('a review that shows and allows nothing', () => {
      const reviewPassword = 'reviewpass';
      const review = { id: '', link: '', token: '' };

      before(() => {
        cy.addReviewAPI(Cypress.expose(ws1.id), 'Teil1784', adminToken()).then(created => {
          expect(created.status).to.equal(201);
          review.id = `${created.body}`;
          cy.request({
            method: 'PATCH',
            url: `/api/workspaces/${Cypress.expose(ws1.id)}/reviews/${review.id}`,
            headers: { 'app-version': Cypress.expose('version'), authorization: `bearer ${adminToken()}` },
            body: {
              id: parseInt(review.id, 10),
              name: 'Teil1784',
              password: reviewPassword,
              settings: {
                reviewConfig: {
                  canComment: false, showCoding: false, showMetadata: false, showOthersComments: false
                }
              },
              units: [parseInt(Cypress.expose(unit4.shortname), 10)]
            }
          }).its('status').should('equal', 200);
          cy.getReviewAPI(Cypress.expose(ws1.id), review.id, adminToken()).then(resp => {
            review.link = resp.body.link;
            cy.loginAPI(review.link, reviewPassword).then(login => {
              expect(login.status).to.equal(201);
              review.token = login.body.accessToken;
            });
          });
        });
      });

      after(() => {
        cy.deleteReviewAPI(Cypress.expose(ws1.id), review.id, adminToken());
      });

      it('403 negative test: should not take a comment', () => {
        cy.createCommentReviewAPI(review.id, Cypress.expose(unit4.shortname), comment('nicht erlaubt'), review.token)
          .its('status').should('equal', 403);
      });

      it('403 negative test: should not show the comments of others', () => {
        cy.getCommentReviewAPI(review.id, Cypress.expose(unit4.shortname), review.token)
          .its('status').should('equal', 403);
      });

      it('403 negative test: should not show the coding, to a review login or a user of the workspace', () => {
        cy.getReviewSchemeAPI(review.id, Cypress.expose(unit4.shortname), review.token)
          .its('status').should('equal', 403);
        cy.getReviewSchemeAPI(review.id, Cypress.expose(unit4.shortname), adminToken())
          .its('status').should('equal', 403);
      });

      it('200 positive test: should serve the unit\'s properties without its metadata', () => {
        cy.getReviewPropertiesAPI(review.id, Cypress.expose(unit4.shortname), review.token).then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.key).to.be.a('string').with.length.above(0);
          expect(resp.body).not.to.have.property('description');
          expect(resp.body.metadata).not.to.have.property('profiles');
        });
      });
    });
  });

  // The guards check the level in the workspace of the path. The review was taken from its id
  // alone and a new one put into the workspace of the body, so managing one workspace reached
  // the reviews of every other one. review1 lives in ws1; userGroupAdmin may manage ws2 as well.
  describe('a review and the workspace of the path (#1717)', () => {
    it('404 negative test: should not read a review through another workspace', () => {
      cy.getReviewAPI(Cypress.expose(ws2.id),
        Cypress.expose('id_review1'),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(404);
        });
    });

    it('404 negative test: should not change a review through another workspace', () => {
      cy.updateReviewAPI(Cypress.expose(ws2.id),
        {
          id: parseInt(Cypress.expose('id_review1'), 10),
          link: '',
          name: 'Changed through ws2',
          units: [Cypress.expose(unit4.shortname)]
        },
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(404);
        });
    });

    // A reviewer reads a unit by its id once it is in the review; one of another workspace would
    // be served to everyone with the review's link. It is left out rather than refused, so that a
    // review keeps being savable when one of its units has been moved away. unit1 was moved to
    // ws2 in 38. (updateReviewAPI sends the first unit only.)
    it('200 positive test: should leave a unit of another workspace out of the review', () => {
      cy.updateReviewAPI(Cypress.expose(ws1.id),
        {
          id: parseInt(Cypress.expose('id_review1'), 10),
          link: '',
          name: 'Teil1',
          units: [Cypress.expose(unit1.shortname)]
        },
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
      cy.getReviewAPI(Cypress.expose(ws1.id),
        Cypress.expose('id_review1'),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.units).not.to.include(parseInt(Cypress.expose(unit1.shortname), 10));
        });
    });

    it('201 positive test: should create a review in the workspace of the path, whatever the body says', () => {
      cy.request({
        method: 'POST',
        url: `/api/workspaces/${Cypress.expose(ws1.id)}/reviews/`,
        headers: {
          'app-version': Cypress.expose('version'),
          authorization: `bearer ${Cypress.expose(`token_${userGroupAdmin.username}`)}`
        },
        body: { name: 'Body names ws2', workspaceId: parseInt(Cypress.expose(ws2.id), 10) },
        failOnStatusCode: false
      }).then(resp => {
        expect(resp.status).to.equal(201);
        const reviewId = `${resp.body}`;
        cy.getReviewAPI(Cypress.expose(ws1.id), reviewId, Cypress.expose(`token_${userGroupAdmin.username}`))
          .then(inWs1 => {
            expect(inWs1.status).to.equal(200);
          });
        cy.getReviewAPI(Cypress.expose(ws2.id), reviewId, Cypress.expose(`token_${userGroupAdmin.username}`))
          .then(inWs2 => {
            expect(inWs2.status).to.equal(404);
          });
        cy.deleteReviewAPI(Cypress.expose(ws1.id), reviewId, Cypress.expose(`token_${userGroupAdmin.username}`))
          .then(deleted => {
            expect(deleted.status).to.equal(200);
          });
      });
    });

    // A unit moved away after it was put into the review is no longer served through it. It must
    // then also leave the review's navigation: listed there, it failed as soon as a reviewer opened
    // it. Its entry stays, so it is back in the review once it returns.
    describe('a unit moved away and back', () => {
      // unit4 goes back to ws1 even if the test fails halfway. If it is back already, the move out
      // of ws2 is refused with a 404 (#1775) and changes nothing.
      after(() => {
        cy.moveToAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(ws1.id),
          Cypress.expose(unit4.shortname),
          Cypress.expose(`token_${userGroupAdmin.username}`)
        );
      });

      it('200 positive test: should list a unit that left the workspace no longer, and again once it is back', () => {
        const groupAdminToken = Cypress.expose(`token_${userGroupAdmin.username}`);
        const unitId = parseInt(Cypress.expose(unit4.shortname), 10);
        const unitsSeenByReviewer = () => cy.getReviewAsReviewerAPI(
          Cypress.expose('id_review1'),
          Cypress.expose('tokenOfReview1')
        ).then(resp => {
          expect(resp.status).to.equal(200);
          return resp.body.units;
        });
        cy.updateReviewAPI(Cypress.expose(ws1.id),
          {
            id: parseInt(Cypress.expose('id_review1'), 10),
            link: '',
            name: 'Teil1',
            units: [Cypress.expose(unit4.shortname)]
          },
          groupAdminToken)
          .its('status').should('equal', 200);
        unitsSeenByReviewer().should('deep.equal', [unitId]);

        cy.moveToAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(ws2.id),
          Cypress.expose(unit4.shortname),
          groupAdminToken
        ).its('status').should('equal', 200);
        unitsSeenByReviewer().should('deep.equal', []);
        cy.getReviewAPI(Cypress.expose(ws1.id), Cypress.expose('id_review1'), groupAdminToken)
          .its('body.units').should('deep.equal', []);
        cy.getReviewPropertiesAPI(
          Cypress.expose('id_review1'),
          Cypress.expose(unit4.shortname),
          Cypress.expose('tokenOfReview1')
        ).its('status').should('equal', 403);

        cy.moveToAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(ws1.id),
          Cypress.expose(unit4.shortname),
          groupAdminToken
        ).its('status').should('equal', 200);
        unitsSeenByReviewer().should('deep.equal', [unitId]);
      });
    });
  });

  describe('74. DELETE /api/workspaces/{workspace_id}/reviews/{ids}', () => {
    // review1 lives in ws1. The level is checked in the workspace of the path, and this used to
    // delete it through ws2, where userGroupAdmin may manage as well (#1717).
    it('404 negative test: should not delete a review through another workspace', () => {
      cy.deleteReviewAPI(Cypress.expose(ws2.id),
        Cypress.expose('id_review1'),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(404);
        });
    });

    it('200 positive test: should successfully delete an existing review for an authorized user', () => {
      cy.deleteReviewAPI(Cypress.expose(ws1.id),
        Cypress.expose('id_review1'),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('403 negative test: should be refused when attempting to delete an already deleted review', () => {
      cy.deleteReviewAPI(noId,
        Cypress.expose('id_review2'),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('403 negative test: should be refused when attempting to delete' +
      ' a review without a workspace ID', () => {
      cy.deleteReviewAPI(noId,
        Cypress.expose('id_review2'),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(403);
        });
    });

    it('401 negative test: should deny review deletion when no valid authentication token is provided', () => {
      cy.deleteReviewAPI(Cypress.expose(ws2.id),
        Cypress.expose('id_review2'),
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });
});
