import { addFirstUser, deleteFirstUser, clickIndexTabAdmin } from '../../../support/helpers';

describe('Admin Unit Items Management', () => {
  const mockUnitItems = [
    {
      id: 1,
      uuid: 'uuid-1',
      unitId: 10,
      variableId: 'var_1',
      variableReadOnlyId: 'var_ro_1',
      weighting: 1.5,
      description: 'First item description',
      changedAt: '2023-01-02T10:00:00Z',
      createdAt: '2023-01-01T10:00:00Z'
    },
    {
      id: 2,
      uuid: 'uuid-2',
      unitId: 11,
      variableId: 'var_2',
      variableReadOnlyId: 'var_ro_2',
      weighting: 2.0,
      description: 'Second item description',
      changedAt: '2023-02-02T11:00:00Z',
      createdAt: '2023-02-01T11:00:00Z'
    }
  ];

  before(() => {
    addFirstUser();
  });

  after(() => {
    deleteFirstUser();
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/admin/unit-items', mockUnitItems).as('getAllUnitItems');
    cy.visit('/');
    cy.findAdminSettings().click();
    clickIndexTabAdmin('unit-items');
    cy.wait('@getAllUnitItems');
  });

  it('should display the unit items table with correct data', () => {
    cy.get('.mat-mdc-row').should('have.length', 2);

    cy.get('.mat-mdc-row').eq(0).within(() => {
      cy.get('.cdk-column-id').should('contain', '1');
      cy.get('.cdk-column-uuid').should('contain', 'uuid-1');
      cy.get('.cdk-column-unitId').should('contain', '10');
      cy.get('.cdk-column-variableId').should('contain', 'var_1');
      cy.get('.cdk-column-variableReadOnlyId').should('contain', 'var_ro_1');
      cy.get('.cdk-column-weighting').should('contain', '1.5');
      cy.get('.cdk-column-description').should('contain', 'First item description');
    });

    cy.get('.mat-mdc-row').eq(1).within(() => {
      cy.get('.cdk-column-id').should('contain', '2');
      cy.get('.cdk-column-uuid').should('contain', 'uuid-2');
      cy.get('.cdk-column-unitId').should('contain', '11');
      cy.get('.cdk-column-variableId').should('contain', 'var_2');
      cy.get('.cdk-column-variableReadOnlyId').should('contain', 'var_ro_2');
      cy.get('.cdk-column-weighting').should('contain', '2');
      cy.get('.cdk-column-description').should('contain', 'Second item description');
    });
  });

  it('should filter unit items by description', () => {
    cy.get('studio-lite-search-filter').should('exist');
    cy.get('[data-cy="search-filter-input"]').type('First');

    cy.get('.mat-mdc-row').should('have.length', 1);
    cy.get('.mat-mdc-row').should('contain', 'First item description');
    cy.get('.mat-mdc-row').should('not.contain', 'Second item description');
  });

  it('should filter unit items by variableId', () => {
    cy.get('[data-cy="search-filter-input"]').type('var_2');

    cy.get('.mat-mdc-row').should('have.length', 1);
    cy.get('.mat-mdc-row').should('contain', 'var_2');
    cy.get('.mat-mdc-row').should('not.contain', 'var_1');
  });

  it('should sort unit items by description', () => {
    cy.get('.mat-mdc-row').eq(0).should('contain', 'First item description');

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('.cdk-column-description').contains(json['unit-item'].description).click();
      cy.get('.cdk-column-description').contains(json['unit-item'].description).click();
      cy.get('.mat-mdc-row').eq(0).should('contain', 'Second item description');
    });
  });

  it('should show info count', () => {
    cy.translate(Cypress.expose('locale')).then(json => {
      const expectedText = json.admin['issue-count-info']
        .replace('{{count}}', '2')
        .replace('{{issue}}', json.admin['unit-items']);
      cy.get('.info').should('contain', expectedText);
    });
  });
});
