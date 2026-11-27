import { primaryWorkspace } from '../../../support/testData';
import { clickIndexTabWorkspace, selectUnit } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI, TestBase } from '../../../support/helpers/test-base';

/**
 * The card „Technische Validierung“ under „Eigenschaften“ tells, tab by tab, whether the unit is in order
 * (#2135). Its questions are answered in unit-check.utils.spec.ts; what only the running studio
 * shows is that the card asks them of the unit the server delivers -- here an id the export would
 * write twice (#2119), and the same unit once the derived variable has been renamed, the size of
 * the content (#2197), what it needs besides the modules (#2198) and the update to a newer player it
 * recommends (#2199).
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
    // the settings outlast the reset before each spec: the next one starts with the default size levels (#2229)
    cy.patchSettingUnitValidationAPI(
      { sizeLevels: { mediumFromKb: 200, largeFromKb: 1024, veryLargeFromKb: 5120 } },
      base.token
    ).its('status').should('equal', 200);
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

  // the size the server counts for the stored content, with its level, where the content's findings stand (#2197)
  it('shows the size of the unit and its level under the editor', () => {
    const sizedUnit = { shortname: 'CHECK_SIZE', name: 'Größe der Aufgabe', group: '' };
    let size = 0;
    cy.then(() => cy.createUnitAPI(base.wsId, sizedUnit, base.token).then(response => {
      expect(response.status, sizedUnit.shortname).to.equal(201);
      const sizedId = String(response.body);
      cy.updateUnitDefinitionAPI(sizedId, base.wsId, base.token).its('status').should('equal', 200);
      cy.getUnitDefinitionSummaryAPI(sizedId, base.wsId, base.token).then(summary => {
        size = summary.body.size;
        expect(size).to.be.within(1024, 200 * 1024);
      });
    }));
    cy.visitWs(primaryWorkspace);
    selectUnit(sizedUnit.shortname);
    clickIndexTabWorkspace('properties');

    cy.then(() => cy.get('[data-cy="unit-check-editor"] [data-cy="unit-check-definition-size"]')
      .should('have.text', `Größe der Aufgabe: ${(size / 1024).toFixed(1)} KB (klein)`));
  });

  // where the levels begin, an administrator sets in the settings (#2229)
  it('names the level of the size by the levels set in the settings', () => {
    const leveledUnit = { shortname: 'CHECK_LEVEL', name: 'Stufe der Größe', group: '' };
    cy.then(() => cy.patchSettingUnitValidationAPI(
      { sizeLevels: { mediumFromKb: 1, largeFromKb: 1024, veryLargeFromKb: 5120 } },
      base.token
    ).its('status').should('equal', 200));
    cy.then(() => cy.createUnitAPI(base.wsId, leveledUnit, base.token).then(response => {
      expect(response.status, leveledUnit.shortname).to.equal(201);
      cy.updateUnitDefinitionAPI(String(response.body), base.wsId, base.token).its('status').should('equal', 200);
    }));
    cy.visitWs(primaryWorkspace);
    selectUnit(leveledUnit.shortname);
    clickIndexTabWorkspace('properties');

    // the definition the command stores takes more than 1 KB, as the test above shows
    cy.get('[data-cy="unit-check-editor"] [data-cy="unit-check-definition-size"]').should('contain.text', '(mittel)');
  });

  // what the editor reported the unit needs, as the server stores it, and what of it the studio lacks (#2198)
  it('lists what the unit needs under the editor, and names what the studio lacks', () => {
    const neededUnit = { shortname: 'CHECK_DEPS', name: 'Abhängigkeiten', group: '' };
    // a name no installation serves
    const missingPackage = { id: 'E2E-Fehlt.itcr.zip', type: 'FILE_TO_UNPACK' };
    cy.then(() => cy.createUnitAPI(base.wsId, neededUnit, base.token).then(response => {
      expect(response.status, neededUnit.shortname).to.equal(201);
      cy.updateUnitDefinitionAPI(String(response.body), base.wsId, base.token, {
        dependenciesToPlay: [
          missingPackage, { id: 'sheet.pdf', type: 'FILE' }, { id: 'formel-dienst', type: 'SERVICE' }
        ],
        dependenciesToEdit: [missingPackage]
      }).its('status').should('equal', 200);
    }));
    cy.visitWs(primaryWorkspace);
    selectUnit(neededUnit.shortname);
    clickIndexTabWorkspace('properties');

    cy.get('[data-cy="unit-check-editor"]').within(() => {
      cy.get('[data-cy="unit-check-dependencies-play"] [data-cy="unit-check-dependency"]')
        .should(entries => expect(Cypress._.map(entries, 'innerText')).to.deep.equal([
          'E2E-Fehlt.itcr.zip – Paket, nicht installiert',
          'sheet.pdf – Datei, kann das Studio nicht bereitstellen',
          'formel-dienst – Dienst'
        ]));
      cy.get('[data-cy="unit-check-dependencies-edit"] [data-cy="unit-check-dependency"]')
        .should('have.text', 'E2E-Fehlt.itcr.zip – Paket, nicht installiert');
      cy.contains(
        '[data-cy="unit-check-finding"]',
        'Zum Abspielen braucht diese Aufgabe Pakete, die im Studio nicht installiert sind: E2E-Fehlt.itcr.zip.'
      ).should('be.visible');
    });
  });

  // a newer player that declares that it reads the unit is recommended once the unit is saved with the older one
  // after it was installed (#2199); the install date comes from the API as text
  it('recommends a newer player once the unit is saved after it was installed', () => {
    const playedUnit = {
      shortname: 'CHECK_NEWER', name: 'Neuere Version', group: '', player: 'verona-test-player@2.0'
    };
    const format = 'verona-test-definition@1.0.0';
    const hint = 'Diese Aufgabe verwendet Verona-Testplayer 2.0.0. Ein Update auf Verona-Testplayer 2.1.0 ' +
      'wird empfohlen.';
    let playedId = '';
    cy.then(() => cy.addModuleAPI('verona-test-player-2.0.0.html', base.token).its('status').should('equal', 201));
    cy.then(() => cy.createUnitAPI(base.wsId, playedUnit, base.token).then(response => {
      expect(response.status, playedUnit.shortname).to.equal(201);
      playedId = String(response.body);
      cy.updateUnitDefinitionAPI(playedId, base.wsId, base.token, undefined, format)
        .its('status').should('equal', 200);
    }));
    cy.then(() => cy.addModuleAPI('verona-test-player-2.1.0.html', base.token).its('status').should('equal', 201));
    cy.visitWs(primaryWorkspace);
    selectUnit(playedUnit.shortname);
    clickIndexTabWorkspace('properties');

    // last saved before the newer version was installed: made with the version it names
    cy.get('[data-cy="unit-check-editor"] [data-cy="unit-check-last-change"]').should('be.visible');
    cy.get('[data-cy="unit-check-properties"]').should('not.contain.text', hint);

    cy.then(() => cy.updateUnitDefinitionAPI(playedId, base.wsId, base.token, undefined, format)
      .its('status').should('equal', 200));
    cy.reload();
    cy.get('[data-cy="unit-check-properties"]')
      .contains('[data-cy="unit-check-finding"]', hint)
      .should('be.visible');
  });
});
