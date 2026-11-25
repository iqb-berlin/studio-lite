import { primaryWorkspace } from '../../../support/testData';
import { clickIndexTabWorkspace, selectUnit } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI, TestBase } from '../../../support/helpers/test-base';

/**
 * The card „Technische Validierung“ under „Eigenschaften“ tells, tab by tab, whether the unit is in order
 * (#2135). Its questions are answered in unit-check.utils.spec.ts; what only the running studio
 * shows is that the card asks them of the unit the server delivers -- here an id the export would
 * write twice (#2119), and the same unit once the derived variable has been renamed.
 */
describe('Workspace Unit Check', () => {
  const unit = { shortname: 'CHECK_ID05', name: 'Doppelte ID', group: '' };
  let base: TestBase;
  let unitId = '';

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

  const schemeWithDerivedAlias = (alias: string): string => JSON.stringify({
    version: '3.0',
    variableCodings: [
      {
        id: '05', alias: '_00a', sourceType: 'BASE', codes: [code]
      },
      {
        id: 'd_1790938214783', alias, sourceType: 'COPY_VALUE', deriveSources: ['05'], codes: [code]
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
      cy.get('[data-cy="variable-id-conflict"]').should('contain.text', '05');
      cy.get('[data-cy="variable-id-conflict-variable"]').should('have.length', 2);
      cy.get('[data-cy="variable-id-conflict-variable"]').eq(0).should('contain.text', '_00a');
      cy.get('[data-cy="variable-id-conflict-variable"]').eq(1).should('contain.text', '05');
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

  // the API takes a key the form would not, as an import brings it (#2135)
  it('names a key that does not start with a letter under the properties', () => {
    const invalidKeyUnit = { shortname: '00_CHECK', name: 'Kurzname mit Ziffer', group: '' };
    cy.then(() => cy.createUnitAPI(base.wsId, invalidKeyUnit, base.token)
      .its('status').should('equal', 201));
    cy.visitWs(primaryWorkspace);
    selectUnit(invalidKeyUnit.shortname);
    clickIndexTabWorkspace('properties');

    cy.get('[data-cy="unit-check-properties"]')
      .contains('[data-cy="unit-check-finding"]', invalidKeyUnit.shortname)
      .should('be.visible');
  });

  // elements copied with their names: the schemer rejects the coding, and they are renamed in the editor (#2135)
  it('names two elements of the same name under the editor, with how to fix it', () => {
    const nameTwiceUnit = { shortname: 'CHECK_NAME', name: 'Doppelter Name', group: '' };
    const element = (id: string) => ({
      id, alias: 'text_1', type: 'no-value', format: '', multiple: false, nullable: false, values: []
    });
    cy.then(() => cy.createUnitAPI(base.wsId, nameTwiceUnit, base.token).then(response => {
      expect(response.status, nameTwiceUnit.shortname).to.equal(201);
      const nameTwiceId = String(response.body);
      cy.updateUnitVariablesAPI(nameTwiceId, base.wsId, [element('text_a'), element('text_b')], base.token)
        .its('status').should('equal', 200);
      cy.updateUnitSchemeAPI(nameTwiceId, base.wsId, base.token, JSON.stringify({
        version: '3.0',
        variableCodings: [
          { id: 'text_a', alias: 'text_1', sourceType: 'BASE_NO_VALUE' },
          { id: 'text_b', alias: 'text_1', sourceType: 'BASE_NO_VALUE' }
        ]
      })).its('status').should('equal', 200);
    }));
    cy.visitWs(primaryWorkspace);
    selectUnit(nameTwiceUnit.shortname);
    clickIndexTabWorkspace('properties');

    cy.get('[data-cy="unit-check-editor"]')
      .contains('[data-cy="unit-check-finding"]', 'Zwei Elemente heißen „text_1“')
      .should('be.visible');
    cy.get('[data-cy="unit-check-schemer"] [data-cy="unit-check-ok"]').should('be.visible');
  });
});
