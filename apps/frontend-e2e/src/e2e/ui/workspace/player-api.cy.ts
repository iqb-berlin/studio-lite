import { primaryWorkspace, UnitData } from '../../../support/testData';
import { clickIndexTabWorkspace, selectUnit } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

/**
 * The studio as host of a player written against the player API 7.0, and of one written against the
 * API 3.0 that is still in use. The players are test modules after the pattern of #1763, so what is
 * tested is the studio as host, not a release of a real player. The form of the messages is checked
 * in the unit tests of PreviewDirective and of the components that start a player; here only that
 * they arrive.
 */
describe('Player API 7.0 and older', () => {
  const units: UnitData[] = [
    {
      shortname: 'PLAYER_API_1', name: 'Player API 1', group: '', player: 'verona-test-player@2.0'
    },
    {
      shortname: 'PLAYER_API_2', name: 'Player API 2', group: '', player: 'verona-test-player@2.0'
    },
    {
      shortname: 'PLAYER_API_3', name: 'Player API 3', group: '', player: 'verona-test-player-legacy@1.0'
    }
  ];
  const previewFrame = '[data-cy="unit-preview-iframe"]';
  const reviewName = 'Player API';
  let token = '';
  let wsId = '';
  let unitIds: string[] = [];

  before(() => {
    createTestBaseAPI({ units }).then(base => {
      token = base.token;
      wsId = base.wsId;
      unitIds = base.unitIds;
      cy.addModuleAPI('verona-test-player-2.0.0.html', base.token).its('status').should('equal', 201);
      // its metadata take the old JSON-LD branch of VeronaModuleMetadataDto.getFromJsonLd
      cy.addModuleAPI('verona-test-player-legacy-1.0.0.html', base.token).its('status').should('equal', 201);
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  // The progress comes in capitals, and the preview read only lower case (#2064).
  it('shows the progress a player of spec 7.0 reports', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(units[0].shortname);
    clickIndexTabWorkspace('preview');
    cy.getIFrameBody(previewFrame).within(() => {
      cy.get('#status', { timeout: 30000 }).should('have.text', 'started');
      cy.get('#report-progress').click();
    });
    cy.get('[data-cy="status-presentation-progress"]').should('have.class', 'some');
    cy.get('[data-cy="status-response-progress"]').should('have.class', 'complete');
  });

  // The units have no definition, and the start command carried an empty one (#719).
  it('starts a player on a unit without definition without one', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(units[1].shortname);
    clickIndexTabWorkspace('preview');
    cy.getIFrameBody(previewFrame).within(() => {
      cy.get('#status', { timeout: 30000 }).should('have.text', 'started');
      cy.get('#definition').should('have.text', 'no definition');
    });
  });

  // A player of the API 3.0 reports its state only when asked to; the version check decides that it
  // is (#1607).
  it('asks a player of the API 3.0 for its state', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(units[2].shortname);
    clickIndexTabWorkspace('preview');
    cy.getIFrameBody(previewFrame).within(() => {
      cy.get('#status', { timeout: 30000 }).should('have.text', 'started');
    });
    cy.get('[data-cy="status-response-progress"]').should('have.class', 'some');
  });

  // The target comes in capitals, and the review only showed a message (#2064).
  it('follows the request of a player of spec 7.0 for the next unit of a review', () => {
    cy.addReviewAPI(wsId, reviewName, token).then(created => {
      expect(created.status, reviewName).to.equal(201);
      const reviewId = String(created.body);
      cy.getReviewAPI(wsId, reviewId, token).then(stored => {
        expect(stored.status, 'link of the review').to.equal(200);
        cy.updateReviewAPI(wsId, {
          id: created.body, link: stored.body.link, name: reviewName, units: unitIds.map(Number)
        }, token).its('status').should('equal', 200);
      });
      cy.visit(`/#/review/${reviewId}/u/0`);
      cy.getIFrameBody('studio-lite-unit-player iframe').within(() => {
        cy.get('#status', { timeout: 30000 }).should('have.text', 'started');
        cy.get('#request-next').click();
      });
      cy.url().should('include', `/review/${reviewId}/u/1`);
    });
  });
});
