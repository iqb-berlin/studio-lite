import {
  group1,
  ws1
} from '../../../support/testData';

import {
  clickIndexTabWsgAdmin,
  openWorkspaceSettingsDialog,
  saveWorkspaceSettings,
  setRouteVisibility
} from '../../../support/helpers';
import {
  createBasicData,
  deleteBasicData
} from '../shared/basic.spec.cy';

// ===========================================================================
describe('Workspace Settings – hiddenRoutes', () => {
  before(() => {
    createBasicData();
  });

  after(() => {
    deleteBasicData();
  });

  // -------------------------------------------------------------------------
  describe('Hiding the Editor tab', () => {
    it('hides the Editor tab when the route is added to hiddenRoutes', () => {
      openWorkspaceSettingsDialog(group1, ws1);
      setRouteVisibility('editor', false);
      saveWorkspaceSettings();
      cy.visitWs(ws1);
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
      cy.findAdminGroupSettings(group1).click();
      clickIndexTabWsgAdmin('workspaces');

      cy.contains('mat-row', ws1)
        .find('mat-icon:contains("directions_off")')
        .should('exist');
    });

    it('restores the Editor tab when the route is removed from hiddenRoutes', () => {
      openWorkspaceSettingsDialog(group1, ws1);
      setRouteVisibility('editor', true);
      saveWorkspaceSettings();

      cy.visitWs(ws1);
      cy.get('[data-cy="workspace-routes-editor"]').should('exist');
    });

    it('restores the directions icon once the route is made visible again', () => {
      cy.visit('/');
      cy.findAdminGroupSettings(group1).click();
      clickIndexTabWsgAdmin('workspaces');

      cy.contains('mat-row', ws1)
        .find('mat-icon:contains("directions_off")')
        .should('not.exist');
    });
  });

  // -------------------------------------------------------------------------
  describe('Hiding the Preview tab', () => {
    it('hides the Preview tab when the route is added to hiddenRoutes', () => {
      openWorkspaceSettingsDialog(group1, ws1);
      setRouteVisibility('preview', false);
      saveWorkspaceSettings();

      cy.visitWs(ws1);
      cy.get('[data-cy="workspace-routes-preview"]').should('not.exist');
    });

    it('shows all other tabs (properties, editor, schemer, comments)', () => {
      cy.get('[data-cy="workspace-routes-properties"]').should('exist');
      cy.get('[data-cy="workspace-routes-editor"]').should('exist');
      cy.get('[data-cy="workspace-routes-schemer"]').should('exist');
      cy.get('[data-cy="workspace-routes-comments"]').should('exist');
    });

    it('restores the Preview tab when the route is removed from hiddenRoutes', () => {
      openWorkspaceSettingsDialog(group1, ws1);
      setRouteVisibility('preview', true);
      saveWorkspaceSettings();

      cy.visitWs(ws1);
      cy.get('[data-cy="workspace-routes-preview"]').should('exist');
    });
  });

  // -------------------------------------------------------------------------
  describe('Hiding multiple tabs at once', () => {
    it('hides both Schemer and Comments tabs simultaneously', () => {
      openWorkspaceSettingsDialog(group1, ws1);
      setRouteVisibility('schemer', false);
      setRouteVisibility('comments', false);
      saveWorkspaceSettings();

      cy.visitWs(ws1);
      cy.get('[data-cy="workspace-routes-schemer"]').should('not.exist');
      cy.get('[data-cy="workspace-routes-comments"]').should('not.exist');
    });

    it('keeps Editor and Preview tabs visible while Schemer and Comments are hidden', () => {
      cy.get('[data-cy="workspace-routes-editor"]').should('exist');
      cy.get('[data-cy="workspace-routes-preview"]').should('exist');
    });

    it('restores Schemer and Comments tabs when routes are removed from hiddenRoutes', () => {
      openWorkspaceSettingsDialog(group1, ws1);
      setRouteVisibility('schemer', true);
      setRouteVisibility('comments', true);
      saveWorkspaceSettings();

      cy.visitWs(ws1);
      cy.get('[data-cy="workspace-routes-schemer"]').should('exist');
      cy.get('[data-cy="workspace-routes-comments"]').should('exist');
    });
  });
});
