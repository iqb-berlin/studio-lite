import { primaryWorkspace } from '../../../support/testData';
import { clickIndexTabWorkspace, selectUnit } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI, TestBase } from '../../../support/helpers/test-base';

/**
 * The card „Aufgabenprüfung“ under „Eigenschaften“ tells, tab by tab, whether the unit is in order
 * (#2135). Its questions are answered in unit-check.utils.spec.ts; what only the running studio
 * shows is that the card asks them of the unit the server delivers -- here an id the export would
 * write twice (#2119), and the same unit once the derived variable has been renamed.
 */
describe('Workspace Unit Check', () => {
  const unit = { shortname: 'CHECK_ID05', name: 'Doppelte ID', group: '' };
  let base: TestBase;
  let unitId = '';

  const schemeWithDerivedAlias = (alias: string): string => JSON.stringify({
    version: '3.0',
    variableCodings: [
      { id: '05', alias: '_00a', sourceType: 'BASE_NO_VALUE' },
      {
        id: 'd_1790938214783', alias, sourceType: 'MANUAL', deriveSources: []
      }
    ]
  });

  const openProperties = (): void => {
    cy.visitWs(primaryWorkspace);
    selectUnit(unit.shortname);
    clickIndexTabWorkspace('properties');
  };

  before(() => {
    createTestBaseAPI().then(created => {
      base = created;
      cy.createUnitAPI(base.wsId, unit, base.token).then(response => {
        expect(response.status, unit.shortname).to.equal(201);
        unitId = String(response.body);
        cy.updateUnitVariablesAPI(unitId, base.wsId, [{
          id: '05', alias: '_00a', type: 'string', format: '', multiple: true, nullable: false, values: []
        }], base.token).its('status').should('equal', 200);
      });
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('names an id the export would write twice, by the names the authors see', () => {
    cy.then(() => cy.updateUnitSchemeAPI(unitId, base.wsId, base.token, schemeWithDerivedAlias('05'))
      .its('status').should('equal', 200));
    openProperties();

    cy.get('[data-cy="unit-check-schemer"]').within(() => {
      cy.get('[data-cy="unit-check-ok"]').should('not.exist');
      cy.get('[data-cy="variable-id-conflict"] .name').then($names => {
        expect([...$names].map(name => name.textContent?.trim())).to.deep.equal(['05', '_00a', '05']);
      });
      cy.get('[data-cy="variable-id-conflicts-manual-fix"]').should('exist');
    });
  });

  it('reports the coding in order once the derived variable is renamed', () => {
    cy.then(() => cy.updateUnitSchemeAPI(unitId, base.wsId, base.token, schemeWithDerivedAlias('summe'))
      .its('status').should('equal', 200));
    openProperties();

    cy.get('[data-cy="unit-check-schemer"]').within(() => {
      cy.get('[data-cy="unit-check-ok"]').should('be.visible');
      cy.get('[data-cy="variable-id-conflict"]').should('not.exist');
    });
  });
});
