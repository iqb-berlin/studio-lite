import { createBasicSpecCy, deleteBasicSpecCy } from '../shared/basic.spec.cy';
import { ws1, group1 } from '../../../support/testData';
import {
  addUnitPred,
  clickIndexTabWsgAdmin,
  clickSaveButtonRight,
  importExercise,
  selectUnit,
  clickIndexTabWorkspace,
  addStatus,
  openGroupManagementDialog,
  addGroupFromManagement,
  renameGroupFromManagement,
  deleteGroupFromManagement,
  closeGroupManagementDialog,
  openWorkspaceUserListDialog,
  closeWorkspaceUserListDialog
} from '../../../support/helpers';

describe('Unit Groups and Group Management', () => {
  before(() => {
    createBasicSpecCy();
  });

  after(() => {
    deleteBasicSpecCy();
  });

  it('imports test units', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
  });

  // ─── new-group-button ────────────────────────────────────────────────────────

  it('creates a new unit group via the add-unit dialog', () => {
    cy.visitWs(ws1);
    cy.get('[data-cy="workspace-add-units"]').click();
    cy.get('[data-cy="workspace-add-unit-new-empty-unit"]').click();
    // Type a key
    cy.get('[data-cy="workspace-new-unit-unit-key"]').type('GRP_TEST_01');
    // Create a brand-new group by clicking "add new group"
    cy.get('body').then($body => {
      if ($body.find('[data-cy="workspace-new-unit-new-group"]').length > 0) {
        cy.get('[data-cy="workspace-new-unit-new-group"]').clear().type('Neue Testgruppe');
      } else {
        cy.get('[data-cy="workspace-new-unit-group"]').click();
        cy.get('.cdk-overlay-transparent-backdrop').click({ force: true });
        cy.get('[data-cy="workspace-new-unit-add-new-group"]').click();
        cy.get('[data-cy="workspace-new-unit-new-group"]').clear().type('Neue Testgruppe');
      }
    });
    cy.clickDataCyWithResponseCheck(
      '[data-cy="workspace-new-unit-submit-button"]',
      [201],
      '/api/workspaces/*/units',
      'POST',
      'createGroupUnit'
    );
  });

  it('creates a second unit in the same new group', () => {
    cy.visitWs(ws1);
    addUnitPred({ shortname: 'GRP_TEST_02', name: 'Second in group', group: 'Neue Testgruppe' });
  });

  // ─── unit-group / unit-groups ────────────────────────────────────────────────

  it('groups are visible in the unit list sidebar', () => {
    cy.visitWs(ws1);
    cy.get('studio-lite-unit-groups').should('exist');
    cy.get('studio-lite-unit-group').should('have.length.greaterThan', 0);
  });

  it('expands and collapses a unit group', () => {
    cy.visitWs(ws1);
    // Click the group header to collapse it
    cy.get('studio-lite-unit-group').first().find('.header').click({ force: true });
    // Click again to expand
    cy.get('studio-lite-unit-group').first().find('.header').click({ force: true });
  });

  it('selects a unit from within a group', () => {
    cy.visitWs(ws1);
    selectUnit('GRP_TEST_01');
    clickIndexTabWorkspace('properties');
    cy.get('input[formControlName="name"]').should('exist');
  });

  // ─── group-menu and group-manage dialog ──────────────────────────────────────

  it('opens the group management dialog from the workspace menu', () => {
    cy.visitWs(ws1);
    openGroupManagementDialog();
  });

  it('group management dialog lists existing groups', () => {
    cy.get('studio-lite-group-manage').within(() => {
      // It is a mat-table with class groups and rows with class group-row
      cy.get('.group-row').should('have.length.greaterThan', 0);
    });
  });

  it('adds a new unit group from the group management dialog', () => {
    addGroupFromManagement('Dialog Testgruppe');
    // Check if the group was added to the list
    cy.get('studio-lite-group-manage').within(() => {
      cy.get('.group-row').contains('Dialog Testgruppe').should('exist');
    });
  });

  it('renames a unit group from the group management dialog', () => {
    renameGroupFromManagement('Dialog Testgruppe', 'Dialog Testgruppe Umbenannt');
    // Check if renamed
    cy.get('studio-lite-group-manage').within(() => {
      cy.get('.group-row').contains('Dialog Testgruppe Umbenannt').should('exist');
      cy.get('.group-row').contains('Dialog Testgruppe$').should('not.exist');
    });
  });

  it('deletes a unit group from the group management dialog', () => {
    deleteGroupFromManagement('Dialog Testgruppe Umbenannt');
    // Check if deleted
    cy.get('studio-lite-group-manage').within(() => {
      cy.get('.group-row').contains('Dialog Testgruppe Umbenannt').should('not.exist');
    });
  });

  it('closes the group management dialog', () => {
    closeGroupManagementDialog();
  });

  // ─── workspace-user-list ─────────────────────────────────────────────────────

  it('opens the user list dialog from the workspace menu', () => {
    cy.visitWs(ws1);
    openWorkspaceUserListDialog();
  });

  it('user list shows the current user with their access level', () => {
    cy.get('studio-lite-workspace-user-list').within(() => {
      cy.contains(Cypress.expose('username')).should('exist');
    });
  });

  it('user list shows access level chips or badges', () => {
    cy.get('studio-lite-workspace-user-list').within(() => {
      cy.get('mat-chip, .access-chip, mat-cell').should('have.length.greaterThan', 0);
    });
  });

  it('closes the user list dialog', () => {
    closeWorkspaceUserListDialog();
  });

  // ─── Custom states (wsg-admin settings — addStatus) ─────────────────────────

  it('adds custom unit states from workspace group settings', () => {
    cy.findAdminGroupSettings(group1).click();
    clickIndexTabWsgAdmin('settings');
    addStatus('In Bearbeitung', 0);
    // Verify existing states are visible if already added
    cy.get('[data-cy="wsg-admin-settings-save-button"]').should('exist');
    clickSaveButtonRight();
  });
});
