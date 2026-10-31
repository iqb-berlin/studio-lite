import { primaryWorkspace, UnitData } from '../../../support/testData';
import { clickIndexTabWorkspace, selectUnit } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

/**
 * The studio as host of an editor written against the editor API 5.0. The editor is a test module
 * after the pattern of #1763, so what is tested is the studio as host, not a release of a real
 * editor. The form of the messages is checked in the unit tests of UnitEditorComponent; here only
 * that they arrive.
 */
describe('Editor API 5.0 in the editor tab', () => {
  const unit: UnitData = {
    shortname: 'EDITOR_API', name: 'Editor API', group: '', editor: 'verona-test-editor@1.0'
  };
  const editorFrame = 'studio-lite-unit-editor iframe';

  before(() => {
    createTestBaseAPI({ units: [unit] }).then(base => {
      cy.addModuleAPI('verona-test-editor-1.0.0.html', base.token).its('status').should('equal', 201);
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
});
