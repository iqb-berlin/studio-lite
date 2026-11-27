import { primaryWorkspace, ReviewData, UnitData } from '../../../support/testData';
import {
  FIRST_WORKSPACE_REQUEST_TIMEOUT, goToWsMenu, loginToReviewLink, logout, selectListUnits
} from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

// Print, review and the metadata report show the names and terms of the stored profile and
// vocabulary in the language of the interface (#2207), also for metadata saved with German texts
// only: imported metadata, and what the form saved until #2204. The field name stays German: the
// profile brings no other.
describe('Metadata outside the form in the English interface', () => {
  const unit: UnitData = { shortname: 'MDEN1', name: 'Studie', group: '' };
  const profile = 'https://w3id.org/iqb/p80/unit/';
  const vocabulary = 'https://w3id.org/iqb/v85/dt/';
  const fieldName = 'Art der Daten';
  // one term as the form stored it (under label), one as an import stores it (under text)
  const formTerm = { id: `${vocabulary}1`, de: 'Kompetenz- und Leistungsdaten', en: 'Skills Measurement' };
  const importedTerm = { id: `${vocabulary}3`, de: 'Umfrage- und Aggregatedaten', en: 'Survey Data' };
  const reviewPassword = 'reviewpass';
  let token = '';
  let wsId = '';
  let unitId = '';
  let review: ReviewData;

  const german = (value: string) => [{ lang: 'de', value }];
  const storedMetadata = {
    profiles: [{
      profileId: profile,
      order: 0,
      entries: [{
        id: 'e2',
        label: german(fieldName),
        value: [
          { id: formTerm.id, label: german(formTerm.de) },
          { id: importedTerm.id, text: german(importedTerm.de) }
        ],
        valueAsText: [...german(formTerm.de), ...german(importedTerm.de)]
      }]
    }]
  };

  // the field with its terms in English, and the German terms nowhere
  const shownInEnglish = (selector: string) => {
    cy.get(selector)
      .should('contain.text', fieldName)
      .and('contain.text', formTerm.en)
      .and('contain.text', importedTerm.en)
      .and('not.contain.text', formTerm.de)
      .and('not.contain.text', importedTerm.de);
  };

  before(() => {
    createTestBaseAPI({ units: [unit] }).then(base => {
      ({ token, wsId } = base);
      [unitId] = base.unitIds;
    });
    cy.then(() => {
      cy.updateWsSettingsAPI(wsId, {
        defaultEditor: '',
        defaultPlayer: '',
        defaultSchemer: '',
        unitGroups: [],
        stableModulesOnly: true,
        unitMDProfile: profile,
        itemMDProfile: ''
      }, token).its('status').should('equal', 200);
      // the views read profile and vocabulary from the database only; this stores both
      cy.getVocabularyMetadataAPI(profile, token).then(resp => {
        expect(resp.status, 'vocabularies of the profile').to.equal(200);
        // a vocabulary that could not be loaded comes as null
        expect(resp.body.map((stored: { id: string } | null) => stored?.id), 'vocabularies of the profile')
          .to.include(vocabulary);
      });
      cy.requestWorkspaceAPI('PATCH', `${wsId}/units/${unitId}/metadata`, token, storedMetadata)
        .its('status').should('equal', 200);
      cy.addReviewAPI(wsId, 'Durchsicht englisch', token).then(resp => {
        expect(resp.status, 'review').to.equal(201);
        const reviewId = String(resp.body);
        cy.getReviewAPI(wsId, reviewId, token).then(read => {
          expect(read.status, 'link of the review').to.equal(200);
          review = {
            id: Number(reviewId), link: read.body.link, name: 'Durchsicht englisch', units: [Number(unitId)]
          };
          // shows the metadata, as every flag updateReviewAPI sets
          cy.updateReviewAPI(wsId, review, token).its('status').should('equal', 200);
          cy.setReviewPasswordAPI(wsId, review, reviewPassword, token).its('status').should('equal', 200);
        });
      });
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('prints the terms in English', () => {
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${unitId}/metadata`).as('loadMetadata');
    cy.visit(`/index.html#/en/print?printOptions=printMetadata&unitIds=${unitId}&workspaceId=${wsId}`);
    cy.wait('@loadMetadata', { requestTimeout: FIRST_WORKSPACE_REQUEST_TIMEOUT });
    shownInEnglish('studio-lite-print-metadata');
  });

  it('lists the terms in English in the metadata report', () => {
    cy.intercept('GET', `/api/workspaces/${wsId}/units/properties`).as('loadReport');
    cy.intercept('GET', '**/workspaces/*/units*').as('loadUnits');
    cy.visit(`/index.html#/en/a/${wsId}`);
    // the menu opens the report only once the workspace has its units, and shows its entries by the
    // access level that comes with the workspace's own data (see cy.visitWs)
    cy.wait('@loadUnits', { requestTimeout: FIRST_WORKSPACE_REQUEST_TIMEOUT });
    cy.get('[data-cy="workspace-unit-selection-filter-units"]').should('be.visible');
    cy.title().should('contain', primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-metadata"]').click();
    selectListUnits([unit.shortname]);
    cy.get('[data-cy="workspace-show-metadata-display"]').click();
    cy.wait('@loadReport');
    shownInEnglish('mat-dialog-container .mat-mdc-tab-body-active table');
    cy.get('[data-cy="metadata-table-view-close"]').click();
  });

  it('shows the terms in English in a review', () => {
    // the review link logs in only from the home page of a browser without a user
    cy.visit('/');
    logout();
    loginToReviewLink(`/#/${review.link}`, reviewPassword);
    cy.intercept('GET', `/api/reviews/${review.id}/units/${unitId}/properties`).as('loadUnit');
    // the language comes from the address the page is loaded with
    cy.visit(`/index.html#/en/review/${review.id}`);
    cy.get('.continue-button a').click();
    cy.wait('@loadUnit');
    shownInEnglish('studio-lite-unit-info studio-lite-print-metadata');
  });
});
