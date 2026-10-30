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
