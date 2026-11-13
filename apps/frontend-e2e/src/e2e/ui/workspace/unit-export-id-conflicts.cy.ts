import { primaryWorkspace } from '../../../support/testData';
import { goToWsMenu, selectListUnits, waitForSuccess } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

/**
 * The element's internal id 05 and the derived variable's alias 05 are each unique in their own
 * list, but both export formats write both as an id; the Testcenter from version 19 rejects the
 * XML (#2119). A spec of its own: the unit with the conflict must not reach the units of the other
 * export tests, also when this one fails before its end.
 */
describe('Workspace Unit Export: ids written twice', () => {
  const conflictUnit = { shortname: 'EXP_ID05', name: 'Doppelte ID', group: '' };

  before(() => {
    createTestBaseAPI({ units: [conflictUnit] }).then(base => {
      const unitId = base.unitIds[0];
      cy.updateUnitVariablesAPI(unitId, base.wsId, [{
        id: '05', alias: '_00a', type: 'string', format: '', multiple: true, nullable: false, values: []
      }], base.token).its('status').should('equal', 200);
      cy.updateUnitSchemeAPI(unitId, base.wsId, base.token, JSON.stringify({
        version: '3.0',
        variableCodings: [
          { id: '05', alias: '_00a', sourceType: 'BASE_NO_VALUE' },
          {
            id: 'd_1790938214783', alias: '05', sourceType: 'MANUAL', deriveSources: []
          }
        ]
      })).its('status').should('equal', 200);
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('names an id the export would carry twice, in XML and in JSON, and exports anyway on request', () => {
    cy.visitWs(primaryWorkspace);
    cy.contains('.unit-row, mat-row', conflictUnit.shortname, { timeout: 15000 }).should('be.visible');
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    selectListUnits([conflictUnit.shortname]);
    cy.get('mat-radio-button[value="xml"]').click();

    cy.get('[data-cy="workspace-export-unit-button"]').click();
    cy.get('[data-cy="variable-id-conflicts-unit"]')
      .should('contain.text', conflictUnit.shortname)
      .find('[data-cy="variable-id-conflict"] .name')
      .then($names => {
        expect([...$names].map(name => name.textContent?.trim())).to.deep.equal(['05', '_00a', '05']);
      });
    cy.get('[data-cy="variable-id-conflicts-cancel"]').click();
    cy.get('[data-cy="variable-id-conflicts-unit"]').should('not.exist');
    cy.get('mat-radio-button[value="json"]').click();
    cy.get('[data-cy="workspace-export-unit-button"]').should('be.visible').click();
    cy.get('[data-cy="variable-id-conflicts-unit"]').should('contain.text', conflictUnit.shortname);
    cy.get('[data-cy="variable-id-conflicts-cancel"]').click();
    cy.get('mat-radio-button[value="xml"]').click();
    cy.intercept('GET', '/api/workspaces/*?download=true*').as('downloadConflictReq');
    cy.get('[data-cy="workspace-export-unit-button"]').should('be.visible').click();
    cy.get('[data-cy="variable-id-conflicts-export-anyway"]').click();
    waitForSuccess('@downloadConflictReq');
    cy.get('[data-cy="workspace-export-unit-button"]').should('not.exist');
  });
});
