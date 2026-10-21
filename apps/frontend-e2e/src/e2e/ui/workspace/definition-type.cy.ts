import { primaryWorkspace } from '../../../support/testData';
import { clickIndexTabWorkspace, selectUnit } from '../../../support/helpers';
import { createBasicSpecCy, deleteBasicSpecCy } from '../shared/basic.spec.cy';

/**
 * A unit records the format its definition is written in (`unitDefinitionType`), and the preview
 * compares it with the `model` the player declares -- aspect 3.0.1 says
 * `aspect-unit-definition@>=4.0 <=4.12` (#1368). A mismatch is only a warning: the player still
 * runs. A unit without a recorded format is shown exactly as before.
 *
 * The units come in through the import, which reads the format from DefinitionRef/@type: an editor
 * that reports a format the player does not cover is not installed here, and the import is how a
 * unit edited elsewhere arrives anyway.
 */
describe('Workspace Definition Type', () => {
  const player = 'iqb-player-aspect@3.0';
  const aspectPlayerTitle = 'Verona Player Aspect';
  const units = {
    future: { key: 'DT_FUTURE', type: 'aspect-unit-definition@5.0.0' },
    current: { key: 'DT_CURRENT', type: 'aspect-unit-definition@4.12.0' },
    untyped: { key: 'DT_UNTYPED', type: '' }
  };

  // See module-switch.cy.ts: the base needs an empty database and is torn down again afterwards.
  before(() => {
    createBasicSpecCy();
  });

  after(() => {
    deleteBasicSpecCy();
  });

  function unitXml(key: string, type: string): string {
    const typeAttribute = type ? ` type="${type}"` : '';
    return `<?xml version="1.0"?>
<Unit>
  <Metadata>
    <Id>${key}</Id>
    <Label>${key}</Label>
  </Metadata>
  <DefinitionRef player="${player}"${typeAttribute}>${key}.voud</DefinitionRef>
</Unit>`;
  }

  // One page with one empty section, its settings taken from a unit of the import fixtures: the page
  // is what the player renders once the start command has arrived.
  function unitDefinition(): string {
    return JSON.stringify({
      type: 'aspect-unit-definition',
      version: '4.12.0',
      stateVariables: [],
      enableSectionNumbering: false,
      sectionNumberingPosition: 'left',
      showUnitNavNext: false,
      pages: [{
        hasMaxWidth: true,
        maxWidth: 750,
        margin: 30,
        backgroundColor: '#ffffff',
        alwaysVisible: false,
        alwaysVisiblePagePosition: 'left',
        alwaysVisibleAspectRatio: 50,
        sections: [{
          elements: [],
          height: 400,
          backgroundColor: '#ffffff',
          dynamicPositioning: true,
          autoColumnSize: true,
          autoRowSize: true,
          gridColumnSizes: [{ value: 1, unit: 'fr' }],
          gridRowSizes: [{ value: 1, unit: 'fr' }],
          visibilityDelay: 0,
          animatedVisibility: false,
          enableReHide: false,
          logicalConnectiveOfRules: 'disjunction',
          visibilityRules: [],
          ignoreNumbering: false
        }]
      }]
    });
  }

  // The formats are compared in the same step that sends the player its start command, so a page
  // in the frame means the comparison has been made -- only then does the absence of a warning mean
  // anything. The spinner is no such sign: it is not shown at all when the preview opens.
  function expectUnitStarted(): void {
    cy.get('[data-cy="unit-preview-iframe"]', { timeout: 60000 })
      .should('be.visible')
      .its('0.contentDocument.title')
      .should('equal', aspectPlayerTitle);
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-page', { timeout: 30000 }).should('exist');
    });
  }

  it('imports units with and without a definition type', () => {
    cy.visitWs(primaryWorkspace);
    cy.intercept('POST', '**/api/workspaces/*').as('upload');
    cy.get('[data-cy="workspace-add-units"]').click();
    // The import tells a unit file by its MIME type, which a file built from contents does not get
    // unless it is named.
    cy.get('input[type=file]').selectFile(
      Object.values(units).flatMap(unit => [
        {
          contents: Cypress.Buffer.from(unitXml(unit.key, unit.type)),
          fileName: `${unit.key}.xml`,
          mimeType: 'text/xml'
        },
        {
          contents: Cypress.Buffer.from(unitDefinition()),
          fileName: `${unit.key}.voud`,
          mimeType: 'application/octet-stream'
        }
      ]),
      { action: 'select', force: true }
    );
    cy.wait('@upload').its('response.statusCode').should('eq', 201);
    // asked of the unit list, not of the import report, which names the keys as well
    cy.visitWs(primaryWorkspace);
    Object.values(units).forEach(unit => {
      cy.contains('.unit-row', unit.key).should('exist');
    });
  });

  it('warns when the player does not read the format of the unit', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(units.future.key);
    clickIndexTabWorkspace('preview');
    expectUnitStarted();
    cy.get('[data-cy="unit-preview-definition-type-warning"]')
      .should('be.visible')
      .and('contain.text', units.future.type);
  });

  it('does not warn when the player reads the format of the unit', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(units.current.key);
    clickIndexTabWorkspace('preview');
    expectUnitStarted();
    cy.get('[data-cy="unit-preview-definition-type-warning"]').should('not.exist');
  });

  it('does not warn for a unit without a definition type', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(units.untyped.key);
    clickIndexTabWorkspace('preview');
    expectUnitStarted();
    cy.get('[data-cy="unit-preview-definition-type-warning"]').should('not.exist');
  });

  // The other direction is no test: with the same player the frame keeps the page of the unit before,
  // so nothing would show that the next unit has been started. That the warning goes when the unit
  // is left is asserted in unit-preview.component.spec.ts.
  it('warns after switching from a unit whose format the player reads', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(units.current.key);
    clickIndexTabWorkspace('preview');
    expectUnitStarted();
    cy.get('[data-cy="unit-preview-definition-type-warning"]').should('not.exist');

    selectUnit(units.future.key);
    cy.get('[data-cy="unit-preview-definition-type-warning"]')
      .should('be.visible')
      .and('contain.text', units.future.type);
  });
});
