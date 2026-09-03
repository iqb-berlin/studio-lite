import {
  clickIndexTabWorkspace,
  selectUnit
} from '../../../support/helpers';
import { primaryWorkspace } from '../../../support/testData';

describe('Unit Definitions', () => {
  it('opens unit definition editor', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit('M6_AK0012');
    clickIndexTabWorkspace('editor');
    cy.get('iframe.unitHost').should('exist');
  });

  it.skip('clicks between two units and saves the unit M6_AK0011', () => {
    selectUnit('M6_AK0011');
    selectUnit('M6_AK0012');
    selectUnit('M6_AK0011');
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-element-model-properties-component', { timeout: 10000 })
        .should('be.visible')
        .within(() => {
          cy.contains('mat-form-field', 'Beschriftung')
            .should('be.visible')
            .find('textarea')
            .should('be.visible')
            .click()
            .clear()
            .type('Neue Text');
        });
    });
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('preserves unit definition when switching between units', () => {
    selectUnit('M6_AK0011');
    cy.get('iframe.unitHost').should('exist');
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-editor-dynamic-overlay')
        .eq(2)
        .within(() => {
          cy.get('aspect-math-table td:contains("2")').should('not.exist');
        });
    });
  });
});
