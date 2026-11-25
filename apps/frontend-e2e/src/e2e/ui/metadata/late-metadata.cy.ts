import type { UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { FIRST_WORKSPACE_REQUEST_TIMEOUT, selectUnit } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

// Units are clicked through quickly, and the metadata of the unit left can arrive after the next one
// is selected. Shown with the next unit, they were saved into it (#2200).
describe('The metadata of a unit left, arriving late', () => {
  const unitA = { shortname: 'LATE_A', name: 'Erste', group: '' };
  const unitB = { shortname: 'LATE_B', name: 'Zweite', group: '' };
  let token = '';
  let wsId = '';
  let idA = '';
  let idB = '';

  const itemIds = (unitId: string): Cypress.Chainable<(string | undefined)[]> => cy
    .getUnitMetadataAPI(wsId, unitId, token)
    .then(resp => {
      expect(resp.status, 'unit metadata').to.equal(200);
      return ((resp.body as UnitMetadataValues).items || []).map(item => item.id);
    });

  before(() => {
    createTestBaseAPI({ units: [unitA, unitB] }).then(base => {
      ({ token, wsId } = base);
      [idA, idB] = base.unitIds;
      // an item of its own in each unit tells their metadata apart
      [[idA, 'ITEM_A'], [idB, 'ITEM_B']].forEach(([unitId, itemId]) => {
        cy.requestWorkspaceAPI('PATCH', `${wsId}/units/${unitId}/metadata`, token, { items: [{ id: itemId }] })
          .its('status').should('equal', 200);
      });
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('are neither shown with the next unit nor saved into it', () => {
    let requestedA = false;
    let answeredA = false;
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${idA}/metadata`, req => {
      requestedA = true;
      req.on('response', res => { res.setDelay(4000); });
      req.on('after:response', () => { answeredA = true; });
    }).as('loadA');
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${idB}/metadata`).as('loadB');
    cy.intercept('PATCH', `/api/workspaces/${wsId}/units/*/metadata`).as('saveMetadata');

    cy.visit(`/#/a/${wsId}/${idA}/metadata`);
    cy.wrap(null, { timeout: FIRST_WORKSPACE_REQUEST_TIMEOUT })
      .should(() => { expect(requestedA, 'metadata of A requested').to.equal(true); });
    selectUnit(unitB.shortname);
    cy.wait('@loadB').then(() => {
      expect(answeredA, 'metadata of A still on their way when B is shown').to.equal(false);
    });
    cy.contains('studio-lite-item mat-expansion-panel-header', 'ITEM_B');
    cy.wait('@loadA');
    cy.wrap(null).should(() => { expect(answeredA, 'metadata of A arrived').to.equal(true); });

    cy.get('studio-lite-item mat-expansion-panel-header')
      .should('have.length', 1)
      .and('contain', 'ITEM_B');
    cy.contains('studio-lite-item mat-expansion-panel-header', 'ITEM_B').click();
    cy.contains('studio-lite-item mat-form-field', 'Item ID').find('input').clear().type('ITEM_B2');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
    cy.wait('@saveMetadata').then(save => {
      expect(save.request.url).to.include(`/units/${idB}/metadata`);
      expect((save.request.body as UnitMetadataValues).items?.map(item => item.id)).to.deep.equal(['ITEM_B2']);
    });

    itemIds(idA).should('deep.equal', ['ITEM_A']);
    itemIds(idB).should('deep.equal', ['ITEM_B2']);
  });
});
