import { AccessLevel, ReviewData, UnitData } from '../../support/testData';
import { createGroupAdminBaseAPI } from '../../support/helpers/test-base';

// What a review shows of a unit besides the unit itself: its items, with their metadata only if the
// review shows metadata, and who voted on a comment, only if the review shows the comments of others
// (#1784). Read with a review login, as the people a review is sent to read it.
describe('Items and comment votes in a review', () => {
  const unitA: UnitData = { shortname: 'R2239A', name: 'Mit Item', group: '' };
  const unitB: UnitData = { shortname: 'R2239B', name: 'Andere', group: '' };
  const reviewPassword = 'reviewpass';
  const ids = {
    wsId: '', unitA: '', unitB: '', item: '', commentA: '', commentB: ''
  };
  let review: ReviewData;
  let adminToken = '';
  let reviewToken = '';

  const configure = (reviewConfig: Record<string, boolean>) => cy
    .setReviewConfigAPI(ids.wsId, review, reviewConfig, adminToken)
    .its('status').should('equal', 200);
  const itemsOfA = (withoutMetadata?: boolean) => cy
    .getReviewUnitItemsAPI(String(review.id), ids.unitA, reviewToken, withoutMetadata);
  const comment = (body: string) => ({ body, userName: 'Admin' });

  before(() => {
    createGroupAdminBaseAPI({ users: [], firstUserAccess: AccessLevel.Admin }).then(base => {
      adminToken = base.token;
      ids.wsId = base.wsId;
    });
    cy.then(() => {
      [[unitA, 'unitA'], [unitB, 'unitB']].forEach(([unit, key]) => {
        cy.createUnitAPI(ids.wsId, unit as UnitData, adminToken).then(resp => {
          expect(resp.status, (unit as UnitData).shortname).to.equal(201);
          ids[key as 'unitA' | 'unitB'] = String(resp.body);
        });
      });
    });
    cy.then(() => {
      cy.requestWorkspaceAPI('POST', `${ids.wsId}/units/${ids.unitA}/items`, adminToken, { id: 'item_1' })
        .then(resp => {
          expect(resp.status, 'item').to.equal(201);
          ids.item = String(resp.body);
          cy.requestWorkspaceAPI(
            'POST',
            `${ids.wsId}/units/${ids.unitA}/items/${ids.item}/metadata`,
            adminToken,
            { profileId: 'profile-2239', entries: [] }
          ).its('status').should('equal', 201);
        });
      cy.postCommentAPI(ids.wsId, ids.unitA, comment('Zu A'), adminToken).then(resp => {
        expect(resp.status, 'comment on A').to.equal(201);
        ids.commentA = String(resp.body);
        cy.voteCommentAPI(ids.wsId, ids.unitA, ids.commentA, 'up', adminToken).its('status').should('equal', 201);
      });
      cy.postCommentAPI(ids.wsId, ids.unitB, comment('Zu B'), adminToken).then(resp => {
        expect(resp.status, 'comment on B').to.equal(201);
        ids.commentB = String(resp.body);
      });
      cy.addReviewAPI(ids.wsId, 'Durchsicht 2239', adminToken).then(resp => {
        expect(resp.status, 'review').to.equal(201);
        const reviewId = String(resp.body);
        cy.getReviewAPI(ids.wsId, reviewId, adminToken).then(read => {
          expect(read.status, 'link of the review').to.equal(200);
          review = {
            id: Number(reviewId),
            link: read.body.link,
            name: 'Durchsicht 2239',
            units: [Number(ids.unitA), Number(ids.unitB)]
          };
          cy.updateReviewAPI(ids.wsId, review, adminToken).its('status').should('equal', 200);
          cy.setReviewPasswordAPI(ids.wsId, review, reviewPassword, adminToken).its('status').should('equal', 200);
          // A review login: the link is the user name, and the token carries the review
          cy.loginAPI(review.link, reviewPassword).then(login => {
            expect(login.status, 'review login').to.equal(201);
            reviewToken = login.body.accessToken;
          });
        });
      });
    });
  });

  describe('GET /api/reviews/{review_id}/units/{unit_id}/items', () => {
    it('200 positive test: should hand out the items with their metadata if the review shows metadata', () => {
      configure({ showMetadata: true });
      itemsOfA().then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.map((item: { uuid: string }) => item.uuid)).to.deep.equal([ids.item]);
        expect(resp.body[0].profiles.map((row: { profileId: string }) => row.profileId))
          .to.deep.equal(['profile-2239']);
      });
    });

    it('200 positive test: should leave the metadata out if the review does not show it', () => {
      configure({ showMetadata: false });
      itemsOfA().then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.map((item: { uuid: string }) => item.uuid)).to.deep.equal([ids.item]);
        expect(resp.body[0]).not.to.have.property('profiles');
      });
    });

    it('200 positive test: should leave the metadata out when asked to, though the review shows it', () => {
      configure({ showMetadata: true });
      itemsOfA(true).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body[0]).not.to.have.property('profiles');
      });
    });
  });

  describe('GET /api/reviews/{review_id}/units/{unit_id}/comments/{comment_id}/votes', () => {
    it('200 positive test: should name the voters if the review shows the comments of others', () => {
      configure({ showOthersComments: true });
      cy.getCommentVotersAPI(ids.wsId, ids.unitA, ids.commentA, adminToken).then(inWorkspace => {
        expect(inWorkspace.status).to.equal(200);
        expect(inWorkspace.body.map((voter: { vote: string }) => voter.vote)).to.deep.equal(['up']);
        cy.getReviewCommentVotersAPI(String(review.id), ids.unitA, ids.commentA, reviewToken).then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body).to.deep.equal(inWorkspace.body);
        });
      });
    });

    it('403 negative test: should not name them if the review hides the comments of others', () => {
      configure({ showOthersComments: false });
      cy.getReviewCommentVotersAPI(String(review.id), ids.unitA, ids.commentA, reviewToken)
        .its('status').should('equal', 403);
    });

    it('404 negative test: should not find a comment under a unit it was not written on', () => {
      configure({ showOthersComments: true });
      cy.getReviewCommentVotersAPI(String(review.id), ids.unitA, ids.commentB, reviewToken)
        .its('status').should('equal', 404);
    });
  });
});
