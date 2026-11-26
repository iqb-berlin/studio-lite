import { baseGroup, primaryWorkspace, AccessLevel } from '../../../support/testData';

import {
  clickIndexTabWsgAdmin,
  FIRST_WORKSPACE_REQUEST_TIMEOUT,
  openWorkspaceSettingsDialog,
  saveWorkspaceSettings,
  setRouteVisibility
} from '../../../support/helpers';
import { createGroupAdminBaseAPI, GroupAdminBase } from '../../../support/helpers/test-base';

// ===========================================================================
describe('Workspace Settings – hiddenRoutes', () => {
  let base: GroupAdminBase;

  before(() => {
    createGroupAdminBaseAPI({ users: [], firstUserAccess: AccessLevel.Admin }).then(created => {
      base = created;
    });
  });

  // -------------------------------------------------------------------------
  describe('Hiding the Editor tab', () => {
    it('hides the Editor tab when the route is added to hiddenRoutes', () => {
      openWorkspaceSettingsDialog(baseGroup, primaryWorkspace);
      setRouteVisibility('editor', false);
      saveWorkspaceSettings();
      cy.visitWs(primaryWorkspace);
      cy.get('[data-cy="workspace-routes-editor"]').should('not.exist');
    });

    it('shows the remaining workspace tabs (properties, preview, schemer, comments)', () => {
      cy.get('[data-cy="workspace-routes-properties"]').should('exist');
      cy.get('[data-cy="workspace-routes-preview"]').should('exist');
      cy.get('[data-cy="workspace-routes-schemer"]').should('exist');
      cy.get('[data-cy="workspace-routes-comments"]').should('exist');
    });

    it('shows a directions_off icon for the Editor column when the route is hidden', () => {
      cy.visit('/');
      cy.findAdminGroupSettings(baseGroup).click();
      clickIndexTabWsgAdmin('workspaces');

      cy.contains('mat-row', primaryWorkspace)
        .find('mat-icon:contains("directions_off")')
        .should('exist');
    });

    it('restores the Editor tab when the route is removed from hiddenRoutes', () => {
      openWorkspaceSettingsDialog(baseGroup, primaryWorkspace);
      setRouteVisibility('editor', true);
      saveWorkspaceSettings();

      cy.visitWs(primaryWorkspace);
      cy.get('[data-cy="workspace-routes-editor"]').should('exist');
    });

    it('restores the directions icon once the route is made visible again', () => {
      cy.visit('/');
      cy.findAdminGroupSettings(baseGroup).click();
      clickIndexTabWsgAdmin('workspaces');

      cy.contains('mat-row', primaryWorkspace)
        .find('.mat-column-editor mat-icon')
        .should('contain', 'directions')
        .and('not.contain', 'directions_off');
    });
  });

  // -------------------------------------------------------------------------
  describe('Hiding the Preview tab', () => {
    it('hides the Preview tab when the route is added to hiddenRoutes', () => {
      openWorkspaceSettingsDialog(baseGroup, primaryWorkspace);
      setRouteVisibility('preview', false);
      saveWorkspaceSettings();

      cy.visitWs(primaryWorkspace);
      cy.get('[data-cy="workspace-routes-preview"]').should('not.exist');
    });

    it('shows all other tabs (properties, editor, schemer, comments)', () => {
      cy.get('[data-cy="workspace-routes-properties"]').should('exist');
      cy.get('[data-cy="workspace-routes-editor"]').should('exist');
      cy.get('[data-cy="workspace-routes-schemer"]').should('exist');
      cy.get('[data-cy="workspace-routes-comments"]').should('exist');
    });

    it('restores the Preview tab when the route is removed from hiddenRoutes', () => {
      openWorkspaceSettingsDialog(baseGroup, primaryWorkspace);
      setRouteVisibility('preview', true);
      saveWorkspaceSettings();

      cy.visitWs(primaryWorkspace);
      cy.get('[data-cy="workspace-routes-preview"]').should('exist');
    });
  });

  // -------------------------------------------------------------------------
  // a tab of its own since #2200
  describe('Hiding the Metadata tab', () => {
    it('hides the Metadata tab and shows it hidden in the overview of the workspaces', () => {
      openWorkspaceSettingsDialog(baseGroup, primaryWorkspace);
      setRouteVisibility('metadata', false);
      saveWorkspaceSettings();

      cy.visitWs(primaryWorkspace);
      cy.get('[data-cy="workspace-routes-metadata"]').should('not.exist');
      cy.get('[data-cy="workspace-routes-properties"]').should('exist');

      cy.visit('/');
      cy.findAdminGroupSettings(baseGroup).click();
      clickIndexTabWsgAdmin('workspaces');
      cy.contains('mat-row', primaryWorkspace)
        .find('.mat-column-metadata mat-icon')
        .should('contain', 'directions_off');
    });

    it('restores the Metadata tab when the route is removed from hiddenRoutes', () => {
      openWorkspaceSettingsDialog(baseGroup, primaryWorkspace);
      setRouteVisibility('metadata', true);
      saveWorkspaceSettings();

      cy.visitWs(primaryWorkspace);
      cy.get('[data-cy="workspace-routes-metadata"]').should('exist');
    });
  });

  // -------------------------------------------------------------------------
  describe('Hiding multiple tabs at once', () => {
    it('hides both Schemer and Comments tabs simultaneously', () => {
      openWorkspaceSettingsDialog(baseGroup, primaryWorkspace);
      setRouteVisibility('schemer', false);
      setRouteVisibility('comments', false);
      saveWorkspaceSettings();

      cy.visitWs(primaryWorkspace);
      cy.get('[data-cy="workspace-routes-schemer"]').should('not.exist');
      cy.get('[data-cy="workspace-routes-comments"]').should('not.exist');
    });

    it('keeps Editor and Preview tabs visible while Schemer and Comments are hidden', () => {
      cy.get('[data-cy="workspace-routes-editor"]').should('exist');
      cy.get('[data-cy="workspace-routes-preview"]').should('exist');
    });

    it('restores Schemer and Comments tabs when routes are removed from hiddenRoutes', () => {
      openWorkspaceSettingsDialog(baseGroup, primaryWorkspace);
      setRouteVisibility('schemer', true);
      setRouteVisibility('comments', true);
      saveWorkspaceSettings();

      cy.visitWs(primaryWorkspace);
      cy.get('[data-cy="workspace-routes-schemer"]').should('exist');
      cy.get('[data-cy="workspace-routes-comments"]').should('exist');
    });
  });

  // -------------------------------------------------------------------------
  // Opened with its address, by a reload or a bookmark, a hidden tab showed: the workspace had not
  // loaded its settings when the router let the view through (#2223).
  describe('Opening a hidden tab by its address', () => {
    let unitId = '';

    /** Loads the page anew at this address, as a bookmark does, not by the router of the page open. */
    const openAnew = (address: string) => {
      cy.window().then(win => win.history.replaceState(null, '', `#/a/${base.wsId}/${unitId}/${address}`));
      cy.reload();
    };

    before(() => {
      cy.createUnitAPI(base.wsId, { shortname: 'HIDDEN1', name: 'Ausgeblendet', group: '' }, base.token)
        .then(created => {
          expect(created.status, 'unit').to.equal(201);
          unitId = String(created.body);
        });
      cy.updateWsSettingsAPI(base.wsId, { hiddenRoutes: ['notes', 'editor'] }, base.token)
        .its('status').should('equal', 200);
    });

    it('leads to the properties instead of a hidden tab', () => {
      openAnew('notes');

      cy.url({ timeout: FIRST_WORKSPACE_REQUEST_TIMEOUT })
        .should('match', new RegExp(`/a/${base.wsId}/${unitId}/properties$`));
      cy.get('[data-cy="workspace-routes-properties"]').should('exist');
      cy.get('studio-lite-unit-rich-notes').should('not.exist');
    });

    it('unpins a hidden tab pinned beside another', () => {
      openAnew('(properties//secondary:editor)');

      cy.url({ timeout: FIRST_WORKSPACE_REQUEST_TIMEOUT })
        .should('match', new RegExp(`/a/${base.wsId}/${unitId}/properties$`));
      cy.get('[data-cy="workspace-routes-properties"]').should('exist');
      cy.get('studio-lite-unit-editor').should('not.exist');
    });
  });
});
