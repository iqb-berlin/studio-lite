import {
  addWidgets,
  addFirstUser
} from '../../../support/helpers';
import { widgets as widgetFiles } from '../../../support/testData';
import { deleteTestBaseAPI } from '../../../support/helpers/test-base';

describe('Widget Management', () => {
  before(() => {
    addFirstUser();
  });

  // The deletion test removes the widget as well, but only if it gets that far
  after(() => {
    deleteTestBaseAPI();
  });

  it('should upload widgets and display them in the table', () => {
    addWidgets(widgetFiles);

    // Verify upload for the test widget
    cy.contains('mat-row', 'Verona-Testwidget').within(() => {
      cy.get('.cdk-column-id').should('contain', 'verona-test-widget');
      cy.get('.cdk-column-version').should('contain', '1.0.0');
    });
  });

  it('should allow deleting widget', () => {
    const widgetToDelete = 'Verona-Testwidget';

    // Checks the widget exists
    cy.get('mat-row').filter(`:contains("${widgetToDelete}")`).should('exist');

    // Select the widget
    cy.selectModule(widgetToDelete);

    // Delete selected
    cy.get('[data-cy="delete-widgets-button"]').click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickButtonWithResponseCheck(json.delete, [200], '/api/admin/verona-modules*', 'DELETE', 'deleteModule');
    });
    // Verify it is gone: with it goes the last row, so it cannot be looked for among the rows
    cy.contains('mat-row', widgetToDelete).should('not.exist');
  });
});
