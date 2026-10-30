import { FIRST_WORKSPACE_REQUEST_TIMEOUT } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

// Only the discard button of the confirmation discards. Esc and a click beside the dialog close it
// without an answer, and until #1844 that counted as one.
describe('Discarding the unsaved changes of a unit', () => {
  const unit = { shortname: 'DISCARD1', name: 'Verwerfen', group: '' };
  let wsId = '';
  let unitId = '';

  const description = () => cy.get('textarea[formcontrolname="description"]');
  const saveButton = () => cy.get('[data-cy="workspace-unit-save-button"]');

  before(() => {
    createTestBaseAPI({ units: [unit] }).then(base => {
      wsId = base.wsId;
      [unitId] = base.unitIds;
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('keeps them when the dialog is closed with Esc or beside it, and discards them on confirmation', () => {
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${unitId}/properties`).as('loadProps');
    cy.visit(`/#/a/${wsId}/${unitId}/properties`);
    cy.wait('@loadProps', { requestTimeout: FIRST_WORKSPACE_REQUEST_TIMEOUT });
    description().type('Entwurf');
    saveButton().should('be.enabled');

    cy.get('[data-cy="workspace-unit-discard-button"]').click();
    cy.get('mat-dialog-container').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('mat-dialog-container').should('not.exist');
    description().should('have.value', 'Entwurf');
    saveButton().should('be.enabled');

    cy.get('[data-cy="workspace-unit-discard-button"]').click();
    cy.get('mat-dialog-container').should('be.visible');
    cy.get('.cdk-overlay-backdrop').click({ force: true });
    cy.get('mat-dialog-container').should('not.exist');
    description().should('have.value', 'Entwurf');
    saveButton().should('be.enabled');

    cy.get('[data-cy="workspace-unit-discard-button"]').click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.contains('mat-dialog-container button', json.workspace.reject).click();
    });
    description().should('have.value', '');
    saveButton().should('be.disabled');
  });
});
