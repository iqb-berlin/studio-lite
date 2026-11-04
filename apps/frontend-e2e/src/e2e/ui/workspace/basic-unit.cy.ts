import {
  primaryWorkspace,
  unitCrudUnits
} from '../../../support/testData';
import {
  clickIndexTabWorkspace,
  deleteUnit,
  selectUnit
} from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

describe('Workspace Unit Management (Core CRUD)', () => {
  before(() => {
    createTestBaseAPI({ units: [unitCrudUnits.crud1, unitCrudUnits.unsaved, unitCrudUnits.switchedTo] });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('deletes a unit', () => {
    cy.visitWs(primaryWorkspace);
    cy.contains(unitCrudUnits.crud1.shortname).should('exist');
    deleteUnit(unitCrudUnits.crud1.shortname);
    cy.contains(unitCrudUnits.crud1.shortname).should('not.exist');
  });

  it('verifies save-or-discard dialog when navigating with unsaved changes', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(unitCrudUnits.unsaved.shortname);
    cy.get('.unit-row.selected').should('contain.text', unitCrudUnits.unsaved.shortname);
    clickIndexTabWorkspace('properties');

    cy.get('input[formControlName="name"]').type(' New Title');

    selectUnit(unitCrudUnits.switchedTo.shortname);

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('studio-lite-save-or-discard, mat-dialog-container', {
        timeout: 5000
      })
        .eq(0)
        .within(() => {
          cy.contains(json.workspace.save).should('be.visible');
          cy.contains(json.workspace['save-unit-data-changes']).should(
            'be.visible'
          );
        });

      cy.get('button').contains(json.cancel).click();
    });
    // cancelled: the unit stays, and so does what was typed
    cy.get('.unit-row.selected').should('contain.text', unitCrudUnits.unsaved.shortname);
    cy.get('input[formControlName="name"]').should('have.value', `${unitCrudUnits.unsaved.name} New Title`);

    selectUnit(unitCrudUnits.switchedTo.shortname);

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('button').contains(json.workspace['reject-changes-label']).click();
    });
    // rejected: the other unit opens, and the edited one keeps its name
    cy.get('.unit-row.selected').should('contain.text', unitCrudUnits.switchedTo.shortname);
    selectUnit(unitCrudUnits.unsaved.shortname);
    cy.get('input[formControlName="name"]').should('have.value', unitCrudUnits.unsaved.name);
  });
});
