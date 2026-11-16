import { baseGroup, primaryWorkspace, AccessLevel } from '../../../support/testData';

import {
  clickIndexTabWsgAdmin,
  openWorkspaceSettingsDialog,
  saveWorkspaceSettings,
  setRouteVisibility
} from '../../../support/helpers';
import { createGroupAdminBaseAPI } from '../../../support/helpers/test-base';

// ===========================================================================
describe('Workspace Settings – hiddenRoutes', () => {
  before(() => {
    createGroupAdminBaseAPI({ users: [], firstUserAccess: AccessLevel.Admin });
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
});
