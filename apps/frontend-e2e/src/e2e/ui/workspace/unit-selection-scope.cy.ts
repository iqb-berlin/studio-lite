import { primaryWorkspace, UnitData } from '../../../support/testData';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

// The header checkbox of a filtered unit list acts on the units shown or on all of them, and a
// selected unit the filter hides is named and can be deselected (#433)
describe('The scope of the header checkbox in the unit selection', () => {
  const units: UnitData[] = [
    { shortname: 'SCOPE_A1', name: 'Erste', group: 'Gruppe A' },
    { shortname: 'SCOPE_A2', name: 'Zweite', group: 'Gruppe A' },
    { shortname: 'SCOPE_B1', name: 'Dritte', group: 'Gruppe B' },
    { shortname: 'SCOPE_B2', name: 'Vierte', group: 'Gruppe B' }
  ];
  let token = '';
  let wsId = '';

  const unitCheckbox = (key: string) => cy.get(`[data-cy="workspace-select-unit-list-checkbox-${key}"]`);

  before(() => {
    createTestBaseAPI({ units }).then(base => {
      ({ token, wsId } = base);
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('deletes the units shown, once the hidden selected one is deselected', () => {
    cy.visitWs(primaryWorkspace);
    cy.intercept('DELETE', '**/workspaces/*/units*').as('deleteUnits');
    cy.get('[data-cy="workspace-delete-unit-button"]').click();
    // A unit of the other group is selected, as the open unit is preselected in the dialog
    unitCheckbox('SCOPE_B1').then($checkbox => {
      if (!$checkbox.find('input[type="checkbox"]').prop('checked')) cy.wrap($checkbox).click();
    });
    unitCheckbox('SCOPE_B1').find('input').should('be.checked');

    cy.get('[data-cy="selection-scope-shown-only"] button').click();
    cy.get('[data-cy="workspace-select-unit-list-filter-units"]').click().type('Gruppe A');
    unitCheckbox('SCOPE_B1').should('not.exist');
    cy.get('[data-cy="selection-scope-toggle-all"]').click();

    unitCheckbox('SCOPE_A1').find('input').should('be.checked');
    unitCheckbox('SCOPE_A2').find('input').should('be.checked');
    cy.get('[data-cy="selection-scope-hidden"]').should('be.visible').and('contain.text', '1');
    cy.get('[data-cy="selection-scope-deselect-hidden"]').click();
    cy.get('[data-cy="selection-scope-hidden"]').should('not.be.visible');

    cy.get('[data-cy="workspace-select-unit-button"]').click();
    cy.get('studio-lite-delete-dialog button[color="primary"]').should('be.visible').click();
    cy.wait('@deleteUnits');

    cy.getUnitsByWsAPI(wsId, token).then(response => {
      expect(response.status, 'status of the unit list').to.equal(200);
      const keys = (response.body as { key: string }[]).map(unit => unit.key).sort();
      expect(keys).to.deep.equal(['SCOPE_B1', 'SCOPE_B2']);
    });
  });
});
