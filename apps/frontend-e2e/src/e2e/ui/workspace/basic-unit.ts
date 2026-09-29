import {
  baseGroup,
  primaryWorkspace,
  unitCrudUnits
} from '../../../support/testData';
import {
  addUnitFromExisting,
  addUnitPred,
  clickIndexTabWorkspace,
  deleteUnit,
  importExercise,
  selectUnit
} from '../../../support/helpers';
import { createBasicSpecCy } from '../shared/basic.spec.cy';

describe('Workspace Unit Management (Core CRUD)', () => {
  before(() => {
    createBasicSpecCy();
  });

  it('imports test units', () => {
    cy.visitWs(primaryWorkspace);
    importExercise('test_studio_units_download.zip');
    cy.contains('M6_AK0011').should('exist');
  });

  it('creates new units', () => {
    cy.visitWs(primaryWorkspace);
    addUnitPred(unitCrudUnits.crud1);
    cy.visitWs(primaryWorkspace);
    addUnitPred(unitCrudUnits.crud2);
    cy.visitWs(primaryWorkspace);
    addUnitPred(unitCrudUnits.crudPrint);
  });

  it('creates a unit from existing unit', () => {
    cy.visitWs(primaryWorkspace);
    addUnitFromExisting(
      `${baseGroup}: ${primaryWorkspace}`,
      unitCrudUnits.crud1,
      unitCrudUnits.crudFromExisting
    );
    cy.visitWs(primaryWorkspace);
    cy.contains(unitCrudUnits.crudFromExisting.shortname).should('exist');
  });

  it('deletes a unit', () => {
    cy.visitWs(primaryWorkspace);
    deleteUnit(unitCrudUnits.crud1.shortname);
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
