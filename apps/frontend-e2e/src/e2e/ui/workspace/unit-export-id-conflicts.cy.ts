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
  // two elements of one name: the export writes them under their internal ids, but the schemer
  // rejects the coding (#2135)
  const nameTwiceUnit = { shortname: 'EXP_NAME', name: 'Doppelter Name', group: '' };
  // a code, so that the schemer finds nothing missing in a coding
  const code = {
    id: 1,
    type: 'FULL_CREDIT',
    label: '',
    score: 1,
    ruleSetOperatorAnd: false,
    manualInstruction: '',
    ruleSets: [{ ruleOperatorAnd: false, rules: [{ method: 'IS_EMPTY' }] }]
  };
  const element = (id: string) => ({
    id, alias: 'text_1', type: 'no-value', format: '', multiple: false, nullable: false, values: []
  });

  before(() => {
    createTestBaseAPI({ units: [conflictUnit, nameTwiceUnit] }).then(base => {
      const [unitId, nameTwiceId] = base.unitIds;
      cy.updateUnitVariablesAPI(unitId, base.wsId, [{
        id: '05', alias: '_00a', type: 'string', format: '', multiple: true, nullable: false, values: []
      }], base.token).its('status').should('equal', 200);
      // a coding the schemer takes: the unit has the id twice in the export and nothing else
      cy.updateUnitSchemeAPI(unitId, base.wsId, base.token, JSON.stringify({
        version: '3.0',
        variableCodings: [
          {
            id: '05', alias: '_00a', sourceType: 'BASE', codes: [code]
          },
          {
            id: 'd_1790938214783', alias: '05', sourceType: 'COPY_VALUE', deriveSources: ['05'], codes: [code]
          }
        ]
      })).its('status').should('equal', 200);
      cy.updateUnitVariablesAPI(nameTwiceId, base.wsId, [element('text_a'), element('text_b')], base.token)
        .its('status').should('equal', 200);
      cy.updateUnitSchemeAPI(nameTwiceId, base.wsId, base.token, JSON.stringify({
        version: '3.0',
        variableCodings: [
          { id: 'text_a', alias: 'text_1', sourceType: 'BASE_NO_VALUE' },
          { id: 'text_b', alias: 'text_1', sourceType: 'BASE_NO_VALUE' }
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
    cy.get('[data-cy="export-problems-unit"]')
      .should('contain.text', conflictUnit.shortname)
      .within(() => {
        cy.get('[data-cy="variable-id-conflict"]').should('contain.text', '05');
        cy.get('[data-cy="variable-id-conflict-variable"]').should('have.length', 2);
        cy.get('[data-cy="variable-id-conflict-variable"]').eq(0).should('contain.text', '_00a');
        cy.get('[data-cy="variable-id-conflict-variable"]').eq(1).should('contain.text', '05');
      });
    cy.get('[data-cy="export-problems-cancel"]').click();
    cy.get('[data-cy="export-problems-unit"]').should('not.exist');
    cy.get('mat-radio-button[value="json"]').click();
    cy.get('[data-cy="workspace-export-unit-button"]').should('be.visible').click();
    cy.get('[data-cy="export-problems-unit"]').should('contain.text', conflictUnit.shortname);
    cy.get('[data-cy="export-problems-cancel"]').click();
    cy.get('mat-radio-button[value="xml"]').click();
    cy.intercept('GET', '/api/workspaces/*?download=true*').as('downloadConflictReq');
    cy.get('[data-cy="workspace-export-unit-button"]').should('be.visible').click();
    cy.get('[data-cy="export-problems-export-anyway"]').click();
    waitForSuccess('@downloadConflictReq');
    cy.get('[data-cy="workspace-export-unit-button"]').should('not.exist');
  });

  it('names a unit whose coding the schemer rejects, and exports anyway on request (#2135)', () => {
    cy.visitWs(primaryWorkspace);
    cy.contains('.unit-row, mat-row', nameTwiceUnit.shortname, { timeout: 15000 }).should('be.visible');
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    selectListUnits([nameTwiceUnit.shortname]);
    cy.get('mat-radio-button[value="xml"]').click();

    cy.intercept('GET', '/api/workspaces/*?download=true*').as('downloadNameTwiceReq');
    cy.get('[data-cy="workspace-export-unit-button"]').click();
    cy.get('[data-cy="export-problems-unit"]')
      .should('contain.text', nameTwiceUnit.shortname)
      .find('[data-cy="export-scheme-problem"]')
      .should('contain.text', 'text_1');
    cy.get('[data-cy="variable-id-conflict"]').should('not.exist');
    cy.get('[data-cy="export-problems-export-anyway"]').click();
    waitForSuccess('@downloadNameTwiceReq');
    cy.get('[data-cy="workspace-export-unit-button"]').should('not.exist');
  });
});
