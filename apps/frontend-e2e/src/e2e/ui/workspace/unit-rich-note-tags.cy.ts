import { Interception } from 'cypress/types/net-stubbing';
import type { WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import {
  primaryWorkspace, baseGroup, lightUnit, AccessLevel, richNotesTestNames
} from '../../../support/testData';
import {
  clickIndexTabWorkspace,
  selectUnit,
  openWorkspaceSettingsDialog,
  setRouteVisibility,
  saveWorkspaceSettings,
  clickIndexTabWsgAdmin,
  createRichNote,
  editRichNote,
  waitForSuccess
} from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

describe('Unit Rich Notes', () => {
  before(() => {
    createTestBaseAPI({ zip: 'test_studio_units_download.zip' });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/workspaces/*/units/*/rich-notes').as('getRichNotes');
  });

  it('activates Rückmeldung in primaryWorkspace', () => {
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
    cy.intercept('PATCH', '/api/workspaces/*/units/*/rich-notes/*').as('editNote');
    editRichNote(' (bearbeitet)');
    waitForSuccess('@editNote');
    cy.contains('.note-content', '(bearbeitet)').should('exist');
  });

  it('creates rich note linked to specific item', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(lightUnit.shortname);
    clickIndexTabWorkspace('notes');
    cy.wait('@getRichNotes');

    createRichNote('Neue Rich Note zur Item 01', -1, '01');
    cy.get('.note-content').should('have.length', '3');
  });

  it('exports unit with rich notes', () => {
    cy.visitWs(primaryWorkspace);
    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();

    cy.get(`mat-cell:contains("${lightUnit.shortname}")`)
      .parent()
      .find('mat-checkbox')
      .click();

    // the unit has a rich note, so the box is offered and already checked (#1729)
    cy.get('[data-cy="export-file-addRichNotes"] input').should('be.enabled').and('be.checked');

    cy.intercept('GET', '/api/workspaces/*?download=true*').as('exportDownload');
    cy.get('[data-cy="workspace-export-unit-button"]').click({ force: true });

    waitForSuccess('@exportDownload');
    cy.get<Interception>('@exportDownload').then(interception => {
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
    const { username, password } = { username: Cypress.expose('username'), password: Cypress.expose('password') };

    // A group of its own, as the tag config belongs to the group, with a workspace and units in it
    before(() => {
      cy.loginAPI(username, password).then(session => {
        expect(session.status, 'login').to.equal(201);
        const token: string = session.body.accessToken;
        cy.getUserIdAPI(token).then(authData => {
          expect(authData.status, 'id of the first user').to.equal(200);
          cy.createGroupAPI({ id: '', name: richNotesTestNames.customGroup }, token).then(group => {
            expect(group.status, richNotesTestNames.customGroup).to.equal(201);
            cy.createWsAPI(String(group.body), { id: '', name: richNotesTestNames.customWs }, token).then(ws => {
              expect(ws.status, richNotesTestNames.customWs).to.equal(201);
              cy.setUsersOfWsAPI(String(ws.body), [
                { id: String(authData.body.userId), access: AccessLevel.Admin }
              ], token)
                .its('status').should('equal', 200);
              cy.uploadUnitsAPI(String(ws.body), 'test2_studio_units_download.zip', token)
                .its('status').should('equal', 201);
            });
          });
        });
      });
    });

    // by name, also after a test that failed partway; the base's teardown removes only its own group
    after(() => {
      cy.loginAPI(username, password).then(session => {
        expect(session.status, 'login for the cleanup').to.equal(201);
        const token: string = session.body.accessToken;
        cy.getWsGroupsAPI(token).then(groups => {
          expect(groups.status, 'groups').to.equal(200);
          const ids = (groups.body as WorkspaceGroupInListDto[])
            .filter(group => group.name === richNotesTestNames.customGroup)
            .map(group => String(group.id));
          if (ids.length) cy.deleteGroupsAPI(ids, token).its('status').should('equal', 200);
        });
      });
    });

    it('activates Rückmeldung in the new workspace', () => {
      openWorkspaceSettingsDialog(richNotesTestNames.customGroup, richNotesTestNames.customWs);
      setRouteVisibility('notes', true);
      saveWorkspaceSettings();
    });

    it('offers the rich note tags configured for the group', () => {
      cy.visit('/');
      cy.findAdminGroupSettings(richNotesTestNames.customGroup).click();
      clickIndexTabWsgAdmin('settings');
      cy.get('studio-lite-unit-rich-note-tags-config .add-tag-button').click();
      cy.get('studio-lite-unit-rich-note-tags-config input')
        .last()
        .clear({ force: true })
        .type('https://w3id.org/iqb/v06/t1/index.json', { force: true });
      cy.intercept('PATCH', '/api/workspace-groups/*').as('saveTagConfig');
      cy.get('[data-cy="wsg-admin-settings-save-button"]').click();
      waitForSuccess('@saveTagConfig');

      cy.visitWs(`${richNotesTestNames.customWs}`);

      cy.get('mat-cell.mat-column-key')
        .first()
        .invoke('text')
        .then(shortname => {
          selectUnit(shortname.trim());
          cy.get('.unit-row.selected').should('contain.text', shortname.trim());
          clickIndexTabWorkspace('notes');
          cy.wait('@getRichNotes');
          cy.get('.loading-spinner', { timeout: 15000 }).should('not.exist');

          cy.get('[data-cy="rich-note-add"]', { timeout: 20000 })
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
  });
});
