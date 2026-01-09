import { createBasicSpecCy, deleteBasicSpecCy } from './shared/basic.spec.cy';
import { ws1 } from '../../support/testData';
import {
  clickIndexTabWorkspace,
  importExercise,
  selectUnit
} from '../../support/util';

describe('Definition:', () => {
  before(() => {
    createBasicSpecCy();
  });

  after(() => {
    deleteBasicSpecCy();
  });

  it('imports the units', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
  });

  it('selects the definition of a unit', () => {
    cy.get('.cdk-overlay-backdrop').eq(0).click();
    selectUnit('M6_AK0012');
    clickIndexTabWorkspace('editor');
    cy.wait(100);
  });

  it('should edit the M6_AK0011', () => {
    selectUnit('M6_AK0011');
    cy.wait(30);
    selectUnit('M6_AK0012');
    cy.wait(30);
    selectUnit('M6_AK0011');
    cy.wait(100);
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('mat-form-field', 'Beschriftung')
        .find('textarea')
        .clear()
        .type('Neue Text');
    });
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('checks that the M6_AK0011 was not overwritten', () => {
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
