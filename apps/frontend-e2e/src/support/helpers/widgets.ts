import { clickIndexTabAdmin } from './navigation';
import { waitForSuccess } from './common';

export function addWidgets(files: string | string[]) {
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('widgets');

  const filenames = Array.isArray(files) ? files : [files];
  filenames.forEach(filename => {
    cy.intercept('POST', '**/api/admin/verona-modules?type=WIDGET').as('uploadWidget');
    cy.loadModule(filename);
    cy.wait('@uploadWidget');
  });
}

export function deleteAllWidgets() {
  cy.intercept('GET', '**/api/verona-modules*').as('getWidgets');
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('widgets');

  // Decided by the table, not by the response: a list loaded before comes back as 304 without
  // a body, and the widgets were then never deleted (#1750)
  waitForSuccess('@getWidgets');
  cy.get('studio-lite-widgets mat-row').should('have.length.greaterThan', 0);
  cy.get('mat-header-cell').find('mat-checkbox').click({ multiple: true });
  cy.get('[data-cy="delete-widgets-button"]').click();
  cy.translate(Cypress.expose('locale')).then(json => {
    cy.clickButtonWithResponseCheck(
      json.delete,
      [200],
      '/api/admin/verona-modules*',
      'DELETE',
      'deleteModule'
    );
  });
  cy.get('studio-lite-widgets mat-table').should('not.exist');
}
