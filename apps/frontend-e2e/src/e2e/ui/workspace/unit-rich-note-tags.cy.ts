import {
  ws1, group1, lightUnit, AccessLevel
} from '../../../support/testData';
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
  editRichNote,
  createGroup,
  createWs,
  deleteGroup,
  grantRemovePrivilegeAtWs
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

  it('deletes a rich note', () => {
    cy.visitWs(ws1);
    selectUnit(lightUnit.shortname);
    clickIndexTabWorkspace('notes');
    cy.wait('@getRichNotes');

    // Note: there are 3 notes total now.
    cy.get('.note-item-actions')
      .eq(0)
      .contains('mat-icon', 'delete')
      .click({ force: true });

    cy.clickButtonWithResponseCheck(
      'Löschen',
      [200],
      '/api/workspaces/*/units/*/rich-notes/*',
      'DELETE',
      'deleteNote'
    );

    cy.get('.note-content').should('have.length', '2');
  });

  describe('Block configures personalised rich note tags', () => {
    const testGroup = 'richNoteGroup2';
    const testWs = 'Ws2';

    it('creates new group, workspace and grants rights', () => {
      createGroup(testGroup);
      createWs(testWs, testGroup);
      grantRemovePrivilegeAtWs([Cypress.expose('username')], testWs, [
        AccessLevel.Admin
      ]);
    });

    it('sets rich note config', () => {
      cy.visit('/');
      cy.findAdminGroupSettings(testGroup).click();
      clickIndexTabWsgAdmin('settings');
      // cy.intercept('PATCH', '/api/group-admin/*/settings').as('saveWsgSettings');
      cy.get('studio-lite-unit-rich-note-tags-config .add-tag-button').click();

      cy.get('studio-lite-unit-rich-note-tags-config input')
        .last()
        .clear({ force: true })
        .type('https://w3id.org/iqb/v06/t1/index.json', { force: true });

      cy.get('[data-cy="wsg-admin-settings-save-button"]').click();
      // cy.wait('@saveWsgSettings');
    });

    it('imports unit', () => {
      cy.visitWs(`${testWs}`);

      importExercise('test2_studio_units_download.zip');
    });

    it('activates Rückmeldung in the new workspace', () => {
      openWorkspaceSettingsDialog(testGroup, testWs);
      setRouteVisibility('notes', true);
      saveWorkspaceSettings();
    });

    it('verifies the rich notes config is applied', () => {
      cy.visitWs(`${testWs}`);

      cy.get('mat-cell.mat-column-key')
        .first()
        .invoke('text')
        .then(shortname => {
          selectUnit(shortname.trim());
          clickIndexTabWorkspace('notes');
          cy.wait('@getRichNotes');

          cy.get('.node-header')
            .contains('mat-icon', 'add')
            .first()
            .click({ force: true });
          cy.get('mat-select[formControlName="tagId"]').click();

          cy.get('mat-option').should('have.length.greaterThan', 0);
          cy.get('mat-option').contains('Transkript 2 der Originalquelle').should('exist');
          cy.translate(Cypress.expose('locale')).then(json => {
            cy.get('mat-dialog-actions button')
              .contains(json.cancel, { matchCase: false })
              .click({ force: true });
          });
        });
    });

    it('cleans up the custom group', () => {
      deleteGroup(testGroup);
    });
  });
});
