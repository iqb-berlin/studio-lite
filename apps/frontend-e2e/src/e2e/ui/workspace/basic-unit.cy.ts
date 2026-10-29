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
    createTestBaseAPI({ zip: 'test_studio_units_download.zip', units: [unitCrudUnits.crud1] });
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
    selectUnit('M6_AK0011');
    cy.get('.unit-row.selected').should('contain.text', 'M6_AK0011');
    clickIndexTabWorkspace('properties');

    cy.get('input[formControlName="name"]').type(' New Title');

    selectUnit('M6_AK0012');

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
      cy.url().should('include', '/properties');
    });

    selectUnit('M6_AK0012');

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('button').contains(json.workspace['reject-changes-label']).click();
    });
  });
});
