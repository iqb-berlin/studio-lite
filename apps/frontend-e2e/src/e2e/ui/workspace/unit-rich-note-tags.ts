import {
  primaryWorkspace, baseGroup, lightUnit, AccessLevel, richNotesTestNames
} from '../../../support/testData';
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
  deleteGroup
} from '../../../support/helpers';
import {
  createWs,
  grantRemovePrivilegeAtWs
} from '../../../support/helpers/group-admin';
import { deleteBasicSpecCy } from '../shared/basic.spec.cy';

describe('Unit Rich Notes', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/workspaces/*/units/*/rich-notes').as('getRichNotes');
  });

  after(() => {
    deleteBasicSpecCy();
  });

  it('activates Rückmeldung in ws1', () => {
    openWorkspaceSettingsDialog(baseGroup, primaryWorkspace);
    setRouteVisibility('notes', true);
    saveWorkspaceSettings();
  });

  it('creates multiple rich notes', () => {
    cy.visitWs(primaryWorkspace);
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
    cy.visitWs(primaryWorkspace);
    selectUnit(lightUnit.shortname);
    clickIndexTabWorkspace('notes');
    cy.wait('@getRichNotes');

    createRichNote('Neue Rich Note zur Item 01', -1, '01');
  });

  it('exports unit with rich notes', () => {
    cy.visitWs(primaryWorkspace);
    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();

    cy.get(`mat-cell:contains("${lightUnit.shortname}")`)
      .parent()
      .find('mat-checkbox')
      .click();

    cy.get('mat-card.files mat-checkbox').eq(1).find('input').check({ force: true });

    cy.intercept('GET', '/api/workspaces/*?download=true*').as('exportDownload');
    cy.get('[data-cy="workspace-export-unit-button"]').click({ force: true });

    cy.wait('@exportDownload').then(interception => {
      expect(interception.response?.statusCode).to.eq(200);

      const bodyStr = Buffer.from(interception.response?.body, 'binary').toString('utf8');
      expect(bodyStr).to.include(`${lightUnit.shortname}.vorn`);
    });
  });

  it('deletes a rich note', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(lightUnit.shortname);
    clickIndexTabWorkspace('notes');
    cy.wait('@getRichNotes');

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
    it('creates new group, workspace and grants rights', () => {
      createGroup(richNotesTestNames.customGroup);
      createWs(richNotesTestNames.customWs, richNotesTestNames.customGroup);
      grantRemovePrivilegeAtWs([Cypress.expose('username')], richNotesTestNames.customWs, [
        AccessLevel.Admin
      ]);
    });

    it('sets rich note config', () => {
      cy.visit('/');
      cy.findAdminGroupSettings(richNotesTestNames.customGroup).click();
      clickIndexTabWsgAdmin('settings');
      cy.get('studio-lite-unit-rich-note-tags-config .add-tag-button').click();

      cy.get('studio-lite-unit-rich-note-tags-config input')
        .last()
        .clear({ force: true })
        .type('https://w3id.org/iqb/v06/t1/index.json', { force: true });

      cy.get('[data-cy="wsg-admin-settings-save-button"]').click();
    });

    it('imports unit', () => {
      cy.visitWs(`${richNotesTestNames.customWs}`);
      importExercise('test2_studio_units_download.zip');
    });

    it('activates Rückmeldung in the new workspace', () => {
      openWorkspaceSettingsDialog(richNotesTestNames.customGroup, richNotesTestNames.customWs);
      setRouteVisibility('notes', true);
      saveWorkspaceSettings();
    });

    it('verifies the rich notes config is applied', () => {
      cy.visitWs(`${richNotesTestNames.customWs}`);

      cy.get('mat-cell.mat-column-key')
        .first()
        .invoke('text')
        .then(shortname => {
          selectUnit(shortname.trim());
          clickIndexTabWorkspace('notes');
          cy.wait('@getRichNotes');

          cy.get('[data-cy="rich-note-add"]')
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
      deleteGroup(richNotesTestNames.customGroup);
    });
  });
});
