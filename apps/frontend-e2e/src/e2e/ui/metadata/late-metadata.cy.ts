import type { UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { FIRST_WORKSPACE_REQUEST_TIMEOUT, selectUnit } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

// Units are clicked through quickly, and the properties and metadata of the unit left can arrive after
// the next one is selected. Shown with the next unit, they would be saved into it (#2200).
describe('The properties and metadata of a unit left, arriving late', () => {
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
    // the properties and the metadata of A, each held back until B is shown
    const requested = new Set<string>();
    const answered = new Set<string>();
    ['properties', 'metadata'].forEach(route => {
      cy.intercept('GET', `/api/workspaces/${wsId}/units/${idA}/${route}`, req => {
        requested.add(route);
        req.on('response', res => { res.setDelay(4000); });
        req.on('after:response', () => { answered.add(route); });
      });
    });
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${idB}/properties`).as('loadPropertiesB');
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${idB}/metadata`).as('loadMetadataB');
    cy.intercept('PATCH', `/api/workspaces/${wsId}/units/*/properties`).as('saveProperties');
    cy.intercept('PATCH', `/api/workspaces/${wsId}/units/*/metadata`).as('saveMetadata');
    const keyField = () => cy.get('input[formcontrolname="key"]');

    // the properties with the metadata pinned beside them
    cy.visit(`/#/a/${wsId}/${idA}/(properties//secondary:metadata)`);
    cy.wrap(null, { timeout: FIRST_WORKSPACE_REQUEST_TIMEOUT })
      .should(() => { expect([...requested].sort(), 'requested for A').to.deep.equal(['metadata', 'properties']); });
    selectUnit(unitB.shortname);
    cy.wait(['@loadPropertiesB', '@loadMetadataB']).then(() => {
      expect([...answered], 'arrived for A when B is shown').to.deep.equal([]);
    });
    keyField().should('have.value', unitB.shortname);
    cy.contains('studio-lite-item mat-expansion-panel-header', 'ITEM_B');
    cy.wrap(null).should(() => { expect(answered.size, 'arrived for A').to.equal(2); });

    keyField().should('have.value', unitB.shortname);
    cy.get('studio-lite-item mat-expansion-panel-header')
      .should('have.length', 1)
      .and('contain', 'ITEM_B');
    cy.get('[data-cy="workspace-unit-save-button"]').should('be.disabled');
    cy.get('textarea[formcontrolname="description"]').type('Nur B');
    cy.contains('studio-lite-item mat-expansion-panel-header', 'ITEM_B').click();
    cy.contains('studio-lite-item mat-form-field', 'Item ID').find('input').clear().type('ITEM_B2');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
    cy.wait('@saveProperties').its('request.url').should('include', `/units/${idB}/properties`);
    cy.wait('@saveMetadata').then(save => {
      expect(save.request.url).to.include(`/units/${idB}/metadata`);
      expect((save.request.body as UnitMetadataValues).items?.map(item => item.id)).to.deep.equal(['ITEM_B2']);
    });

    itemIds(idA).should('deep.equal', ['ITEM_A']);
    itemIds(idB).should('deep.equal', ['ITEM_B2']);
    cy.getUnitPropertiesAPI(wsId, idA, token).then(resp => {
      expect(resp.body.description, 'description of A').not.to.equal('Nur B');
    });
    cy.getUnitPropertiesAPI(wsId, idB, token).its('body.description').should('equal', 'Nur B');
  });
});
