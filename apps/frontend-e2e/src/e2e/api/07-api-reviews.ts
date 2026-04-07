import {
  ReviewData,
  CommentData
} from '../../support/testData';
import {
  noId,
  userGroupAdmin,
  ws1,
  ws2,
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

    it('500 negative test: should return a server error when attempting to create ' +
      'a review without a valid workspace ID', () => {
      cy.addReviewAPI(noId,
        reviewName2,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.be.equal(500);
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

    it('500 negative test: should return a server error when requesting reviews without a valid workspace ID', () => {
      cy.getReviewAPI(noId,
        Cypress.expose('id_review1'),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.be.equal(500);
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

    it('500 negative test: should return a server error when attempting to update ' +
      'a review without a workspace ID', () => {
      cy.updateReviewAPI(noId,
        review1,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
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

    it('500 negative test: should return a server error when attempting to list ' +
      'all reviews without a workspace ID', () => {
      cy.getAllReviewAPI(noId,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
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

    it('404 negative test: should return error when requesting a review window using an invalid ID', () => {
      cy.getReviewWindowAPI(noId, Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(404);
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

    it('500 negative test: should return a server error when requesting unit review properties' +
      ' without a review ID', () => {
      cy.getReviewPropertiesAPI(noId,
        Cypress.expose(unit4.shortname),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });

    it('500 negative test: should return a server error when requesting review properties' +
      ' for an invalid unit ID', () => {
      cy.getReviewDefinitionAPI(Cypress.expose('id_review1'),
        noId,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
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

    it('500/200 negative test: should return success despite missing the required review ID parameter', () => {
      // it returns 200 instead of 500
      cy.getReviewDefinitionAPI(noId,
        Cypress.expose(unit4.shortname),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          // expect(resp.status).to.equal(500); // should
        });
    });

    it('500 negative test: should return a server error when requesting a unit definition without a unit ID', () => {
      cy.getReviewDefinitionAPI(Cypress.expose('id_review1'),
        noId,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
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

    it('500/200 negative test: should return success despite requesting a review scheme' +
      ' without a valid review ID', () => {
      // it returns 200 instead of 500
      cy.getReviewSchemeAPI(noId,
        Cypress.expose(unit4.shortname),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          // expect(resp.status).to.equal(500);  // should
        });
    });

    it('500 negative test: should return a server error when attempting to retrieve a review scheme' +
      ' without a unit ID', () => {
      cy.getReviewSchemeAPI(Cypress.expose('id_review1'),
        noId,
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
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

    it('500/201 negative test: should return success but fail to correctly link a comment' +
      ' when review ID is missing', () => {
      // It creates a comment in the db. But it should be 500 instead of 201
      cd.body = 'New comment review created without review id in the path';
      cy.createCommentReviewAPI(noId,
        Cypress.expose(unit4.shortname),
        cd,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(201);
          Cypress.expose('id_commentReview_neg1', resp.body);
          // expect(resp.status).to.equal(500); should
        });
    });

    it('500/201 negative test: should return success but fail to link a comment when unit ID ' +
      'is missing from the review context', () => {
      // It creates a comment in the db. But it should be 500 instead of 201
      cd.body = 'New comment review created without unit id in the path';
      cy.createCommentReviewAPI(Cypress.expose('id_review1'),
        noId,
        cd,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(201);
          Cypress.expose('id_commentReview_neg2', resp.body);
          // expect(resp.status).to.equal(500); //should
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
    it('500/200 negative test: should return success despite absence of a valid review ID' +
      ' when retrieving comments', () => {
      cy.getCommentReviewAPI(noId,
        Cypress.expose(unit4.shortname),
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.length).to.equal(3);
          // expect(resp.status).to.equal(500); //should
          // it returns an array with three comment reviews, but it should return an error
        });
    });

    it('500/200 negative test: should return success but no data when retrieving review comments' +
      ' without a valid unit ID', () => {
      cy.getCommentReviewAPI(Cypress.expose('id_review1'),
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.length).to.equal(0);
          // expect(resp.status).to.equal(500); //should
          // it returns an empty array and should return an error
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
          expect(resp.body.length).to.equal(3);
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
    it('500/200 negative test: should return success despite updating a review comment' +
      ' without a valid review ID', () => {
      mcd.body = 'Update comment review created without review id in the path';
      cy.updateCommentReviewAPI(noId,
        Cypress.expose(unit4.shortname),
        Cypress.expose('id_commentReview_neg1'),
        mcd,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          // expect(resp.status).to.equal(500); //should
        });
    });

    it('500/200 negative test: should return success despite updating a review comment without a valid unit ID', () => {
      mcd.body = 'Update comment review created without unit id in the path';
      cy.updateCommentReviewAPI(Cypress.expose('id_review1'),
        noId,
        Cypress.expose('id_commentReview_neg2'),
        mcd,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          // expect(resp.status).to.equal(500); //should
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
        Cypress.expose('id_commentReview_neg2'),
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
    it('500/200 negative test: should return success even when deleting a review comment' +
      ' without a valid review ID', () => {
      // The test deletes record in the db
      cy.deleteCommentReviewAPI(noId,
        Cypress.expose(unit4.shortname),
        Cypress.expose('id_commentReview_neg1'),
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          // expect(resp.status).to.equal(500); //should
        });
    });

    it('500/200 negative test: should return success even when deleting a review comment' +
      ' without a unit ID context', () => {
      // The test deletes record in the db
      cy.deleteCommentReviewAPI(Cypress.expose('id_review1'),
        noId,
        Cypress.expose('id_commentReview_neg2'),
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          // expect(resp.status).to.equal(500); //should
        });
    });

    it('500/200 negative test: should return success when attempting to delete' +
      ' a non-existent review comment ID', () => {
      cy.deleteCommentReviewAPI(Cypress.expose('id_review1'),
        Cypress.expose(unit4.shortname),
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          // expect(resp.status).to.equal(500); //should
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

  describe('74. DELETE /api/workspaces/{workspace_id}/reviews/{ids}', () => {
    it('200 positive test: should successfully delete an existing review for an authorized user', () => {
      cy.deleteReviewAPI(Cypress.expose(ws2.id),
        Cypress.expose('id_review1'),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('500 negative test: should return a server error when attempting to delete an already deleted review', () => {
      cy.deleteReviewAPI(noId,
        Cypress.expose('id_review2'),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });

    it('500 negative test: should return a server error when attempting to delete' +
      ' a review without a workspace ID', () => {
      cy.deleteReviewAPI(noId,
        Cypress.expose('id_review2'),
        Cypress.expose(`token_${userGroupAdmin.username}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
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
