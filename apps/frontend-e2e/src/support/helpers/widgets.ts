import { clickIndexTabAdmin } from './navigation';

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
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('widgets');

  cy.get('body').then($body => {
    if ($body.find('mat-row').length > 0) {
      cy.get('mat-header-cell').find('mat-checkbox').click({ multiple: true });
    }
  });
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
}
