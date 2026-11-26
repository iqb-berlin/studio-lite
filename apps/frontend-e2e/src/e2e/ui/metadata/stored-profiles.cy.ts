import { FIRST_WORKSPACE_REQUEST_TIMEOUT } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

interface Profiles {
  unit: string;
  item: string;
}

// The values of a profile the workspace assigned before stay stored when it assigns another, but are used
// nowhere. The metadata tab and the unit check name them, beside the profiles the workspace assigns (#2235).
describe('Metadata of a profile the workspace no longer assigns', () => {
  const unit = { shortname: 'PROFILES_1', name: 'Profilwechsel', group: '' };
  // the names come from the profiles themselves, as w3id delivers them
  const math: Profiles = { unit: 'https://w3id.org/iqb/p11/unit/', item: 'https://w3id.org/iqb/p11/item/' };
  const german: Profiles = { unit: 'https://w3id.org/iqb/p12/unit/', item: 'https://w3id.org/iqb/p12/item/' };
  let token = '';
  let wsId = '';
  let unitId = '';

  const settings = (profiles: Profiles) => ({
    defaultEditor: '',
    defaultPlayer: '',
    defaultSchemer: '',
    unitGroups: [],
    stableModulesOnly: true,
    unitMDProfile: profiles.unit,
    itemMDProfile: profiles.item
  });
  // a value as the form stores it, with the text the read-only views show
  const withValue = (profileId: string, entryId: string) => {
    const text = [{ lang: 'de', value: 'Elsa Mignon' }];
    return {
      profileId,
      entries: [{
        id: entryId, label: [], value: text, valueAsText: text
      }]
    };
  };

  before(() => {
    createTestBaseAPI({ units: [unit] }).then(base => {
      ({ token, wsId } = base);
      [unitId] = base.unitIds;
      cy.updateWsSettingsAPI(wsId, settings(math), token).its('status').should('equal', 200);
      cy.requestWorkspaceAPI('PATCH', `${wsId}/units/${unitId}/metadata`, token, {
        profiles: [withValue(math.unit, 'iqb_author')],
        items: [{ id: 'ITEM_1', profiles: [withValue(math.item, 'iqb_note')] }]
      }).its('status').should('equal', 200);
      cy.updateWsSettingsAPI(wsId, settings(german), token).its('status').should('equal', 200);
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('are named in the metadata tab, beside the profiles the workspace assigns', () => {
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${unitId}/metadata`).as('loadMetadata');
    cy.visit(`/#/a/${wsId}/${unitId}/metadata`);
    cy.wait('@loadMetadata', { requestTimeout: FIRST_WORKSPACE_REQUEST_TIMEOUT });

    cy.get('[data-cy="unit-metadata-unit-profiles"]').within(() => {
      cy.contains('[data-cy="metadata-profiles-assigned"]', 'IQB Deutsch Primar - Aufgabe');
      cy.get('[data-cy="metadata-profiles-unused"]')
        .should('have.length', 1)
        .and('contain', 'IQB Mathematik Primar - Aufgabe');
    });
    cy.get('[data-cy="unit-metadata-item-profiles"]').within(() => {
      cy.contains('[data-cy="metadata-profiles-assigned"]', 'IQB Deutsch Primar - Item');
      cy.get('[data-cy="metadata-profiles-unused"]')
        .should('have.length', 1)
        .and('contain', 'IQB Mathematik Primar - Item')
        .and('contain', '1 Item');
    });
  });

  it('are named in the unit check, as something to know', () => {
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${unitId}/metadata`).as('loadMetadataForCheck');
    cy.visit(`/#/a/${wsId}/${unitId}/properties`);
    // a new page: the visit only changes the hash, and the metadata the tab loaded before would still be held,
    // where the check is to ask for them itself
    cy.reload();
    cy.wait('@loadMetadataForCheck', { requestTimeout: FIRST_WORKSPACE_REQUEST_TIMEOUT });

    cy.get('[data-cy="unit-check-metadata"]').within(() => {
      cy.contains('[data-cy="metadata-profiles-assigned"]', 'IQB Deutsch Primar - Aufgabe');
      cy.contains('[data-cy="metadata-profiles-assigned"]', 'IQB Deutsch Primar - Item');
      cy.contains('[data-cy="metadata-profiles-unused"]', 'IQB Mathematik Primar - Aufgabe');
      cy.contains('[data-cy="metadata-profiles-unused"]', 'IQB Mathematik Primar - Item');
      // information, not "in order"
      cy.get('[data-cy="unit-check-ok"]').should('not.exist');
    });
  });
});
