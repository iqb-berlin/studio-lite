import { primaryWorkspace, groupTestNames } from '../../../support/testData';
import {
  addUnitPred,
  openGroupManagementDialog,
  addGroupFromManagement,
  renameGroupFromManagement,
  deleteGroupFromManagement,
  closeGroupManagementDialog,
  openWorkspaceUserListDialog,
  closeWorkspaceUserListDialog,
  workspaceOfPage
} from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

describe('Unit Groups and Group Management', () => {
  before(() => {
    createTestBaseAPI();
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('creates a new unit group via the add-unit dialog', () => {
    cy.visitWs(primaryWorkspace);
    // The group is new: the workspace knows it after the unit is created, not before. Asked of the API,
    // not read from the page; the dialog is filled by addUnitPred, which picks or creates the group (#1863)
    workspaceOfPage().then(({ wsId, token }) => {
      cy.getGroupsOfWsAPI(wsId, token).then(groups => {
        expect(groups.status, 'status of the groups before').to.equal(200);
        expect(groups.body).not.to.include(groupTestNames.newGroup);
      });
      addUnitPred({ shortname: 'GRP_U1', name: 'Group Test Unit 1', group: groupTestNames.newGroup });
      cy.getGroupsOfWsAPI(wsId, token).then(groups => {
        expect(groups.status, 'status of the groups after').to.equal(200);
        expect(groups.body).to.include(groupTestNames.newGroup);
      });
      cy.getUnitsByWsAPI(wsId, token).then(response => {
        expect(response.status, 'status of the unit list').to.equal(200);
        const units: { key: string; groupName?: string }[] = response.body;
        expect(units.find(unit => unit.key === 'GRP_U1')?.groupName).to.equal(groupTestNames.newGroup);
      });
    });
  });

  it('groups are visible in the unit list sidebar', () => {
    cy.visitWs(primaryWorkspace);
    cy.get('studio-lite-unit-groups').should('exist');
    cy.get('studio-lite-unit-group').should('have.length.greaterThan', 0);
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
    // compared whole, as the new name contains the old one
    cy.get('studio-lite-group-manage .group-row .group-name > :first-child').should($names => {
      const names = [...$names].map(name => name.innerText.trim());
      expect(names).to.include(groupTestNames.dialogGroupRenamed);
      expect(names).not.to.include(groupTestNames.dialogGroup);
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

  it('closes the user list dialog', () => {
    closeWorkspaceUserListDialog();
  });
});
