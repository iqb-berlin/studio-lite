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

  it('should import the units to test', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
  });

  it('should click definition of a unit', () => {
    cy.get('.cdk-overlay-backdrop').eq(0).click();
    selectUnit('M6_AK0012');
    clickIndexTabWorkspace('editor');
    cy.wait(100);
  });

  it('should edit and overwrite the unit', () => {
    selectUnit('M6_AK0011');
    cy.wait(15);
    selectUnit('M6_AK0012');
    cy.wait(15);
    selectUnit('M6_AK0011');
    cy.wait(15);

    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('mat-form-field', 'Beschriftung')
        .find('textarea')
        .clear()
        .type('Neue Text');
    });
    cy.get('[data-cy="workspace-save-unit"]').click();
  });

  it('checks that both units have title', () => {
    selectUnit('M6_AK0011');
    cy.wait(100);
    cy.getIFrameBody('iframe.unitHost').within(() => {
      if (
        cy.get('aspect-editor-dynamic-overlay')
          .find('div:contains("Keine Zeilen oder Spalten vorhanden")')
      ) {
        cy.log('overwritten unit');
      }
    });
    selectUnit('M6_AK0012');
    cy.wait(100);
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-editor-dynamic-overlay')
        .find('div:contains("Keine Zeilen oder Spalten vorhanden")')
        .should('exist');
    });
  });
});
