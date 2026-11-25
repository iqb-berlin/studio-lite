import { AccessLevel } from '../../../support/testData';
import { addFirstUser, FIRST_WORKSPACE_REQUEST_TIMEOUT } from '../../../support/helpers';

// The metadata form shows a profile and its vocabularies in the language of the interface where they
// bring it, and saves a chosen term in every language its vocabulary has. Until #2204 the studio
// handed the form German, whatever language the interface was in.
describe('The metadata form in the English interface', () => {
  const group = { id: '', name: 'InterfaceLanguageGroup' };
  const ws = { id: '', name: 'InterfaceLanguageWorkspace' };
  const unit = { shortname: 'FDB1', name: 'Studie', group: '' };
  // brings its field names in German only, the terms of its vocabularies in German and English
  const profile = 'https://w3id.org/iqb/p80/unit/';
  let token = '';
  let wsId = '';
  let unitId = '';

  before(() => {
    addFirstUser();
    cy.window().then(win => {
      token = win.localStorage.getItem('id_token') || '';
      cy.getUserIdAPI(token).then(authData => {
        cy.createGroupAPI(group, token).then(createdGroup => {
          cy.createWsAPI(String(createdGroup.body), ws, token).then(createdWs => {
            wsId = String(createdWs.body);
            cy.updateUsersOfWsAPI(wsId, AccessLevel.Admin, String(authData.body.userId), token)
              .its('status').should('equal', 200);
            cy.updateWsSettingsAPI(wsId, {
              defaultEditor: '',
              defaultPlayer: '',
              defaultSchemer: '',
              unitGroups: [],
              stableModulesOnly: true,
              unitMDProfile: profile,
              itemMDProfile: ''
            }, token).its('status').should('equal', 200);
            cy.createUnitAPI(wsId, unit, token).then(createdUnit => {
              expect(createdUnit.status).to.equal(201);
              unitId = String(createdUnit.body);
            });
          });
        });
      });
    });
  });

  it('offers the terms in English and saves them in German and English', () => {
    cy.intercept('PATCH', `/api/workspaces/${wsId}/units/${unitId}/metadata`).as('saveMetadata');
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${unitId}/metadata`).as('loadMetadata');
    // another path than the start page, so that the page loads anew rather than only its hash changing
    cy.visit(`/index.html#/en/a/${wsId}/${unitId}/metadata`);
    cy.wait('@loadMetadata', { requestTimeout: FIRST_WORKSPACE_REQUEST_TIMEOUT });

    // the field name stays German: the profile brings no other
    cy.contains('mat-form-field', 'Art der Daten').find('input').click();
    cy.get('mat-tree-node>div>span').contains('Survey Data').prev().click();
    cy.get('mat-tree-node').should('not.contain', 'Umfrage- und Aggregatedaten');
    cy.get('[data-cy="metadata-nested-tree-confirm-button"]').click();
    cy.contains('mat-chip-row', 'Survey Data');

    cy.get('[data-cy="workspace-unit-save-button"]').click();
    cy.wait('@saveMetadata').then(save => {
      const entries: { id: string; value: { label: { lang: string; value: string }[] }[] }[] = save.request.body
        .profiles.flatMap((saved: { entries: unknown[] }) => saved.entries);
      expect(entries.find(entry => entry.id === 'e2')?.value[0].label).to.deep.equal([
        { lang: 'de', value: 'Umfrage- und Aggregatedaten' },
        { lang: 'en', value: 'Survey Data' }
      ]);
    });
  });
});
