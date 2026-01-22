import { createBasicSpecCy, deleteBasicSpecCy } from '../shared/basic.spec.cy';
import { ws1 } from '../../../support/testData';
import {
  clickIndexTabWorkspace,
  importExercise,
  selectUnit
} from '../../../support/helpers';

describe('Unit Definitions', () => {
  before(() => {
    createBasicSpecCy();
  });

  after(() => {
    deleteBasicSpecCy();
  });

  it('imports test units', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
  });

  it('opens unit definition editor', () => {
    cy.get('.cdk-overlay-backdrop').eq(0).click();
    selectUnit('M6_AK0012');
    clickIndexTabWorkspace('editor');
    cy.wait(100);
  });

  it.skip('should click between two units and save the unit M6_AK0011', () => {
    selectUnit('M6_AK0011');
    cy.wait(30);
    selectUnit('M6_AK0012');
    cy.wait(30);
    selectUnit('M6_AK0011');
    cy.wait(30);
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-element-model-properties-component').within(() => {
        cy.contains('mat-form-field', 'Beschriftung')
          .find('textarea')
          .click()
          .clear()
          .type('Neue Text');
      });
    });
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('preserves unit definition when switching between units', () => {
    selectUnit('M6_AK0011');
    cy.wait(100);
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-editor-dynamic-overlay')
        .eq(2)
        .within(() => {
          cy.get('aspect-math-table td:contains("2")').should('not.exist');
        });
    });
  });
});
