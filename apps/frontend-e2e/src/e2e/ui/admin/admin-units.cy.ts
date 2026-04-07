import { addFirstUser, deleteFirstUser, clickIndexTabAdmin } from '../../../support/helpers';

describe('Admin Units Management', () => {
  const mockUnits = [
    {
      id: 1,
      key: 'UNIT-001',
      name: 'Unit Alpha',
      workspaceId: 10,
      workspaceName: 'Workspace A',
      lastChangedDefinition: '2023-01-01T10:00:00Z',
      lastChangedDefinitionUser: 'user1',
      lastChangedMetadata: '2023-01-02T10:00:00Z',
      lastChangedMetadataUser: 'user1',
      lastChangedScheme: '2023-01-03T10:00:00Z',
      lastChangedSchemeUser: 'user1'
    },
    {
      id: 2,
      key: 'UNIT-002',
      name: 'Unit Beta',
      workspaceId: 11,
      workspaceName: 'Workspace B',
      lastChangedDefinition: '2023-02-01T11:00:00Z',
      lastChangedDefinitionUser: 'user2',
      lastChangedMetadata: '2023-02-02T11:00:00Z',
      lastChangedMetadataUser: 'user2',
      lastChangedScheme: '2023-02-03T11:00:00Z',
      lastChangedSchemeUser: 'user2'
    }
  ];

  before(() => {
    addFirstUser();
  });

  after(() => {
    deleteFirstUser();
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/admin/units', mockUnits).as('getAllUnits');
    cy.visit('/');
    cy.findAdminSettings().click();
    clickIndexTabAdmin('units');
    cy.wait('@getAllUnits');
  });

  it('should display the units table with correct data', () => {
    cy.get('[data-cy="admin-units-table"]').should('be.visible');
    cy.get('.mat-mdc-row').should('have.length', 2);

    cy.get('.mat-mdc-row').eq(0).within(() => {
      cy.get('.cdk-column-key').should('contain', 'UNIT-001');
      cy.get('.cdk-column-name').should('contain', 'Unit Alpha');
      cy.get('.cdk-column-workspaceId').should('contain', '10');
    });

    cy.get('.mat-mdc-row').eq(1).within(() => {
      cy.get('.cdk-column-key').should('contain', 'UNIT-002');
      cy.get('.cdk-column-name').should('contain', 'Unit Beta');
      cy.get('.cdk-column-workspaceId').should('contain', '11');
    });
  });

  it('should filter units by name', () => {
    cy.get('[data-cy="admin-units-search-filter"]').should('exist');
    cy.get('[data-cy="search-filter-input"]').type('Alpha');

    cy.get('.mat-mdc-row').should('have.length', 1);
    cy.get('.mat-mdc-row').should('contain', 'Unit Alpha');
    cy.get('.mat-mdc-row').should('not.contain', 'Unit Beta');
  });

  it('should filter units by key', () => {
    cy.get('[data-cy="search-filter-input"]').type('002');

    cy.get('.mat-mdc-row').should('have.length', 1);
    cy.get('.mat-mdc-row').should('contain', 'UNIT-002');
    cy.get('.mat-mdc-row').should('not.contain', 'UNIT-001');
  });

  it('should sort units by name', () => {
    // Default order is as mocked
    cy.get('.mat-mdc-row').eq(0).should('contain', 'Unit Alpha');

    cy.translate(Cypress.expose('locale')).then(json => {
      // Sort ascending
      cy.get('.cdk-column-name').contains(json.unit.name).click();
      // (Material sort sometimes needs two clicks or checking the aria-sort attribute)
      // Actually, alphabetical order is Alpha, then Beta. So it might already be sorted.

      // Reverse sort
      cy.get('.cdk-column-name').contains(json.unit.name).click();
      cy.get('.mat-mdc-row').eq(0).should('contain', 'Unit Beta');
    });
  });

  it('should trigger unit download', () => {
    cy.intercept('GET', '/api/admin/units').as('downloadUnits');
    cy.get('[data-cy="admin-units-menu-download"]').click();
    cy.wait('@downloadUnits').its('request.url').should('include', '/api/admin/units');
  });

  it('should show info count', () => {
    cy.translate(Cypress.expose('locale')).then(json => {
      const expectedText = json.admin['issue-count-info']
        .replace('{{count}}', '2')
        .replace('{{issue}}', json.admin.units);
      cy.get('.info').should('contain', expectedText);
    });
  });
});
