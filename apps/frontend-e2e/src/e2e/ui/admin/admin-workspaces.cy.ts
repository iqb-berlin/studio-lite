import { addFirstUser, deleteFirstUser, clickIndexTabAdmin } from '../../../support/helpers';

describe('Admin Workspaces Management', () => {
  const mockWorkspaces = [
    {
      id: 1,
      name: 'Workspace Alpha',
      groupId: 101,
      groupName: 'Group A',
      settings: {
        hiddenRoutes: ['editor', 'schemer']
      }
    },
    {
      id: 2,
      name: 'Workspace Beta',
      groupId: 102,
      groupName: 'Group B',
      settings: {
        hiddenRoutes: []
      }
    }
  ];

  before(() => {
    addFirstUser();
  });

  after(() => {
    deleteFirstUser();
    cy.resetDb();
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/admin/workspaces', mockWorkspaces).as('getAllWorkspaces');
    cy.visit('/');
    cy.findAdminSettings().click();
    clickIndexTabAdmin('workspaces');
    cy.wait('@getAllWorkspaces');
  });

  it('should display the workspaces table with correct data', () => {
    cy.get('[data-cy="admin-workspaces-table"]').should('be.visible');
    cy.get('.mat-mdc-row').should('have.length', 2);

    cy.get('.mat-mdc-row').eq(0).within(() => {
      cy.get('.cdk-column-id').should('contain', '1');
      cy.get('.cdk-column-name').should('contain', 'Workspace Alpha');
      cy.get('.cdk-column-groupId').should('contain', '101');
      // Editor should be hidden (directions_off)
      cy.get('.cdk-column-editor mat-icon').should('contain', 'directions_off');
      // Preview should be visible (directions)
      cy.get('.cdk-column-preview mat-icon').should('contain', 'directions');
    });

    cy.get('.mat-mdc-row').eq(1).within(() => {
      cy.get('.cdk-column-id').should('contain', '2');
      cy.get('.cdk-column-name').should('contain', 'Workspace Beta');
      cy.get('.cdk-column-groupId').should('contain', '102');
      // All routes should be visible
      cy.get('.cdk-column-editor mat-icon').should('contain', 'directions');
      cy.get('.cdk-column-preview mat-icon').should('contain', 'directions');
    });
  });

  it('should filter workspaces by name', () => {
    cy.get('[data-cy="admin-workspaces-search-filter"]').should('exist');
    cy.get('[data-cy="search-filter-input"]').type('Alpha');

    cy.get('.mat-mdc-row').should('have.length', 1);
    cy.get('.mat-mdc-row').should('contain', 'Workspace Alpha');
    cy.get('.mat-mdc-row').should('not.contain', 'Workspace Beta');
  });

  it('should sort workspaces by name', () => {
    // Default order is as mocked
    cy.get('.mat-mdc-row').eq(0).should('contain', 'Workspace Alpha');

    // Sort ascending (Alpha then Beta) - already in this order likely
    cy.get('.cdk-column-name').contains('Name').click();

    // Sort descending
    cy.get('.cdk-column-name').contains('Name').click();
    cy.get('.mat-mdc-row').eq(0).should('contain', 'Workspace Beta');
  });

  it('should trigger report download', () => {
    cy.intercept('GET', '/api/admin/workspace-groups?download=true').as('downloadReport');
    cy.get('[data-cy="admin-workspaces-menu-download"]').click();
    cy.wait('@downloadReport');
  });

  it('should show info count', () => {
    cy.translate(Cypress.expose('locale')).then(json => {
      const expectedText = json.admin['issue-count-info']
        .replace('{{count}}', '2')
        .replace('{{issue}}', json.admin.workspaces);
      cy.get('.info').should('contain', expectedText);
    });
  });
});
