import { primaryWorkspace, UnitData } from '../../../support/testData';
import { clickIndexTabWorkspace, selectUnit } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI, TestBase } from '../../../support/helpers/test-base';

/**
 * The studio as host of an editor written against the editor API 5.0. The editor is a test module
 * after the pattern of #1763, so what is tested is the studio as host, not a release of a real
 * editor. The form of the messages is checked in the unit tests of UnitEditorComponent; here only
 * that they arrive.
 */
describe('Editor API 5.0 in the editor tab', () => {
  const unit: UnitData = {
    shortname: 'EDITOR_API',
    name: 'Editor API',
    group: '',
    editor: 'verona-test-editor@1.0',
    player: 'verona-test-player@2.0'
  };
  const editorFrame = 'studio-lite-unit-editor iframe';
  let base: TestBase;

  before(() => {
    createTestBaseAPI({ units: [unit] }).then(created => {
      base = created;
      cy.addModuleAPI('verona-test-editor-1.0.0.html', base.token).its('status').should('equal', 201);
      cy.addModuleAPI('verona-test-player-2.0.0.html', base.token).its('status').should('equal', 201);
      cy.addModuleAPI('verona-test-widget-1.0.0.html', base.token, ['WIDGET']).its('status').should('equal', 201);
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  // The metadata come as a string, as the API demands; reading the version threw on it (#2007).
  it('hands the unit to an editor that sends its metadata as a string', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(unit.shortname);
    clickIndexTabWorkspace('editor');
    cy.getIFrameBody(editorFrame).within(() => {
      cy.get('#status', { timeout: 30000 }).should('have.text', 'started');
    });
  });

  // The role came in lower case, which the editor API 5.0 no longer knows (#2065).
  it('gives an editor of spec 5.0 the role in capitals', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(unit.shortname);
    clickIndexTabWorkspace('editor');
    cy.getIFrameBody(editorFrame).within(() => {
      cy.get('#status', { timeout: 30000 }).should('have.text', 'started');
      // the first user administers the workspace
      cy.get('#role').should('have.text', 'SUPER');
    });
  });

  // The studio dropped what the editor reports the unit needs (#1602). The test widget is installed,
  // the GeoGebra package is not, and a file other than a package the studio never has.
  it('keeps what the unit needs and warns in the preview about what the studio lacks', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(unit.shortname);
    clickIndexTabWorkspace('editor');
    cy.getIFrameBody(editorFrame).within(() => {
      cy.get('#status', { timeout: 30000 }).should('have.text', 'started');
      cy.get('#report-dependencies').click();
    });
    cy.intercept('PATCH', '**/units/*/definition').as('saveDefinition');
    cy.get('[data-cy="workspace-unit-save-button"]').should('not.be.disabled').click();
    cy.wait('@saveDefinition').its('response.statusCode').should('be.oneOf', [200, 204]);

    clickIndexTabWorkspace('preview');
    cy.get('[data-cy="unit-preview-dependency-warning"]', { timeout: 30000 })
      .should('be.visible')
      .and('contain.text', 'GeoGebra.itcr.zip')
      .and('contain.text', 'sheet.pdf')
      .and('not.contain.text', 'CALC');

    cy.getUnitDefinitionAPI(base.unitIds[0], base.wsId, base.token).then(stored => {
      expect(stored.body.dependenciesToPlay).to.deep.equal([
        { id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' },
        { id: 'CALC', type: 'WIDGET' },
        { id: 'sheet.pdf', type: 'FILE' }
      ]);
      expect(stored.body.dependenciesToEdit).to.deep.equal([{ id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' }]);
    });
  });
});
