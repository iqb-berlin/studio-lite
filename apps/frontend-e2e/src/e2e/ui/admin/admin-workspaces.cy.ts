import { addFirstUser, clickIndexTabAdmin } from '../../../support/helpers';

/** The text of a cell as it reads, without the line breaks and indentation of the template. */
const normalized = (text: string): string => text.replace(/\s+/g, ' ').trim();

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

  beforeEach(() => {
    cy.intercept({ method: 'GET', pathname: '/api/workspaces' }, mockWorkspaces).as('getAllWorkspaces');
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
      // The hidden routes by name, in the order of the settings dialog (#2251)
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.get('.cdk-column-hiddenRoutes').should($cell => expect(normalized($cell.text()))
          .to.equal(`${json.workspace.routes.editor}, ${json.workspace.routes.schemer}`));
      });
    });

    cy.get('.mat-mdc-row').eq(1).within(() => {
      cy.get('.cdk-column-id').should('contain', '2');
      cy.get('.cdk-column-name').should('contain', 'Workspace Beta');
      cy.get('.cdk-column-groupId').should('contain', '102');
      // Nothing hidden
      cy.get('.cdk-column-hiddenRoutes').should($cell => expect(normalized($cell.text())).to.equal('–'));
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

  // The browser builds the file from the figures the API sends, loading exceljs only now (#2181).
  it('should save the report as an Excel file', () => {
    cy.intercept('GET', '/api/workspace-groups/report').as('report');
    cy.get('[data-cy="admin-workspaces-menu-download"]').click();
    cy.wait('@report').its('response.statusCode').should('equal', 200);
    cy.translate(Cypress.expose('locale')).then(json => {
      const day = new Date().toLocaleDateString('sv-SE'); // yyyy-MM-dd, the date in the file name
      const file = `${Cypress.config('downloadsFolder')}/${day} ${json['wsg-admin']['report-workspaces']}.xlsx`;
      // An xlsx file is a zip archive
      cy.readFile(file, 'binary').should(content => expect(content.slice(0, 2)).to.equal('PK'));
    });
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
