import { primaryWorkspace, baseGroup, groupTestNames } from '../../../support/testData';
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
  it('imports test units', () => {
    cy.visitWs(primaryWorkspace);
    importExercise('test_studio_units_download.zip');
  });

  it('creates a new unit group via the add-unit dialog', () => {
    cy.visitWs(primaryWorkspace);
    cy.get('[data-cy="workspace-add-units"]').click();
    cy.get('[data-cy="workspace-add-unit-new-empty-unit"]').click();
    cy.get('[data-cy="workspace-new-unit-unit-key"]').type('GRP_U1');
    cy.get('body').then($body => {
      if ($body.find('[data-cy="workspace-new-unit-new-group"]').length > 0) {
        cy.get('[data-cy="workspace-new-unit-new-group"]').clear().type(groupTestNames.newGroup);
      } else {
        cy.get('[data-cy="workspace-new-unit-group"]').click();
        cy.get('.cdk-overlay-transparent-backdrop').click({ force: true });
        cy.get('[data-cy="workspace-new-unit-add-new-group"]').click();
        cy.get('[data-cy="workspace-new-unit-new-group"]').clear().type(groupTestNames.newGroup);
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
    cy.visitWs(primaryWorkspace);
    addUnitPred({ shortname: 'GRP_U2', name: 'Group Test Unit 2', group: groupTestNames.newGroup });
  });

  it('groups are visible in the unit list sidebar', () => {
    cy.visitWs(primaryWorkspace);
    cy.get('studio-lite-unit-groups').should('exist');
    cy.get('studio-lite-unit-group').should('have.length.greaterThan', 0);
  });

  it('expands and collapses a unit group', () => {
    cy.visitWs(primaryWorkspace);
    cy.get('studio-lite-unit-group').first().find('.header').click({ force: true });
    cy.get('studio-lite-unit-group').first().find('.header').click({ force: true });
  });

  it('selects a unit from within a group', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit('GRP_U1');
    clickIndexTabWorkspace('properties');
    cy.get('input[formControlName="name"]').should('exist');
  });

  it('opens the group management dialog from the workspace menu', () => {
    cy.visitWs(primaryWorkspace);
    openGroupManagementDialog();
  });

  it('group management dialog lists existing groups', () => {
    cy.get('studio-lite-group-manage').within(() => {
      cy.get('.group-row').should('have.length.greaterThan', 0);
    });
  });

  it('adds a new unit group from the group management dialog', () => {
    addGroupFromManagement(groupTestNames.dialogGroup);
    cy.get('studio-lite-group-manage').within(() => {
      cy.get('.group-row').contains(groupTestNames.dialogGroup).should('exist');
    });
  });

  it('renames a unit group from the group management dialog', () => {
    renameGroupFromManagement(groupTestNames.dialogGroup, groupTestNames.dialogGroupRenamed);
    cy.get('studio-lite-group-manage').within(() => {
      cy.get('.group-row').contains(groupTestNames.dialogGroupRenamed).should('exist');
      cy.get('.group-row').contains('Dialog Testgruppe$').should('not.exist');
    });
  });

  it('deletes a unit group from the group management dialog', () => {
    deleteGroupFromManagement(groupTestNames.dialogGroupRenamed);
    cy.get('studio-lite-group-manage').within(() => {
      cy.get('.group-row').contains(groupTestNames.dialogGroupRenamed).should('not.exist');
    });
  });

  it('closes the group management dialog', () => {
    closeGroupManagementDialog();
  });

  it('opens the user list dialog from the workspace menu', () => {
    cy.visitWs(primaryWorkspace);
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

  it('adds custom unit states from workspace group settings', () => {
    cy.findAdminGroupSettings(baseGroup).click();
    clickIndexTabWsgAdmin('settings');
    addStatus(groupTestNames.customState, 0);
    cy.get('[data-cy="wsg-admin-settings-save-button"]').should('exist');
    clickSaveButtonRight();
  });
});
