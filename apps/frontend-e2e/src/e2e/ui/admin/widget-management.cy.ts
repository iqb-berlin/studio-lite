import {
  addWidgets,
  deleteAllWidgets,
  addFirstUser,
  deleteFirstUser
} from '../../../support/helpers';
import { widgets as widgetFiles } from '../../../support/testData';

describe('Widget Management', () => {
  before(() => {
    addFirstUser();
  });

  after(() => {
    deleteFirstUser();
  });

  it('should upload widgets and display them in the table', () => {
    addWidgets(widgetFiles);
    // Verify both widgets are in the table
    cy.get('studio-lite-widgets mat-table').should('have.length', 2);

    // Verify upload for Molecule Editor
    cy.contains('mat-row', 'IQB-Widget Molekül-Editor').within(() => {
      cy.get('.cdk-column-id').should('contain', 'molecule-editor-widget');
      cy.get('.cdk-column-version').should('contain', '0.2.0');
    });

    // Verify upload for Periodic System Select
    cy.contains('mat-row', 'IQB Widget Periodensystem Auswahl').within(() => {
      cy.get('.cdk-column-id').should('contain', 'periodic-system-select-widget');
      cy.get('.cdk-column-version').should('contain', '0.2.0');
    });
  });

  it('should allow deleting widget', () => {
    const widgetToDelete = 'IQB-Widget Molekül-Editor';

    // Checks the widget exists
    cy.get('mat-row').filter(`:contains("${widgetToDelete}")`).should('exist');

    // Select the widget
    cy.selectModule(widgetToDelete);

    // Delete selected
    cy.get('[data-cy="delete-widgets-button"]').click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickButtonWithResponseCheck(json.delete, [200], '/api/admin/verona-modules*', 'DELETE', 'deleteModule');
    });
    // Verify it is gone
    cy.get('mat-row').filter(`:contains("${widgetToDelete}")`).should('not.exist');
  });

  it('deletes all widgets', () => {
    deleteAllWidgets();
  });
});
