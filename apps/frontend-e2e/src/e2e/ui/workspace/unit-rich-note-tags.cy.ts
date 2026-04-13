import { ws1, group1, lightUnit } from '../../../support/testData';
import {
  createBasicData,
  deleteBasicData
} from '../shared/basic.spec.cy';
import {
  clickIndexTabWorkspace,
  importExercise,
  selectUnit,
  openWorkspaceSettingsDialog,
  setRouteVisibility,
  saveWorkspaceSettings,
  clickIndexTabWsgAdmin,
  createRichNote,
  editRichNote
} from '../../../support/helpers';

describe('Unit Rich Notes', () => {
  before(() => {
    createBasicData();
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/workspaces/*/units/*/rich-notes').as('getRichNotes');
  });

  after(() => {
    deleteBasicData();
    cy.resetDb();
  });

  it('imports test units', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
  });

  it('activates Rückmeldung in ws1', () => {
    openWorkspaceSettingsDialog(group1, ws1);
    setRouteVisibility('notes', true);
    saveWorkspaceSettings();
  });

  it('creates multiple rich notes', () => {
    cy.visitWs(ws1);
    selectUnit(lightUnit.shortname);
    clickIndexTabWorkspace('notes');
    cy.wait('@getRichNotes');

    createRichNote('Erste Rich Note', -1);
    createRichNote('Zweite Rich Note', 0);

    cy.get('.note-content').should('have.length', '2');
  });

  it('edits a rich note', () => {
    editRichNote(' (bearbeitet)');
  });

  it('creates rich note linked to specific item', () => {
    cy.visitWs(ws1);
    selectUnit(lightUnit.shortname);
    clickIndexTabWorkspace('notes');
    cy.wait('@getRichNotes');

    createRichNote('Neue Rich Note zur Item 01', -1, '01');
  });

  it('exports unit with rich notes', () => {
    cy.visitWs(ws1);
    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();

    // Select the unit we just added notes to
    cy.get(`mat-cell:contains("${lightUnit.shortname}")`)
      .parent()
      .find('mat-checkbox')
      .click();

    // Check the "add rich notes" checkbox (it's the second checkbox in the files card)
    cy.get('mat-card.files mat-checkbox').eq(1).find('input').check({ force: true });

    cy.intercept('GET', '/api/workspaces/*?download=true*').as('exportDownload');
    cy.get('[data-cy="workspace-export-unit-button"]').click({ force: true });

    cy.wait('@exportDownload').then(interception => {
      expect(interception.response?.statusCode).to.eq(200);

      // Convert the binary ZIP response to string to check for the .vorn filename and content
      const bodyStr = Buffer.from(interception.response?.body, 'binary').toString('utf8');

      // The zip file should contain the rich notes file for this unit
      expect(bodyStr).to.include(`${lightUnit.shortname}.vorn`);
    });
  });

  it('changes a rich note tag id in wsg-admin', () => {
    cy.visit('/');
    cy.findAdminGroupSettings(group1).click();
    clickIndexTabWsgAdmin('settings');
    cy.get('button').contains('mat-icon', 'mediation').click({ force: true });
    cy.get('studio-lite-unit-rich-note-tags-config textarea').not('.global-textarea').invoke('val').then(val => {
      const jsonStr = (val as string) || '';
      const modifiedJson = jsonStr.replace(/"id"\s*:\s*"transcript"/g, '"id":"transcript_modified"');
      cy.get('studio-lite-unit-rich-note-tags-config textarea').not('.global-textarea')
        .clear({ force: true })
        .type(modifiedJson, { parseSpecialCharSequences: false, delay: 0 });
    });

    cy.get('[data-cy="wsg-admin-settings-save-button"]').click();
  });

  it('deletes a rich note', () => {
    cy.visitWs(ws1);
    selectUnit(lightUnit.shortname);
    clickIndexTabWorkspace('notes');
    cy.wait('@getRichNotes');

    // Note: there are 3 notes total now.
    cy.get('.note-item-actions').eq(0).contains('mat-icon', 'delete').click({ force: true });

    cy.clickButtonWithResponseCheck(
      'Löschen', [200], '/api/workspaces/*/units/*/rich-notes/*', 'DELETE', 'deleteNote');

    cy.get('.note-content').should('have.length', '2');
  });
});
