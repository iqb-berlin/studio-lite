import {
  clickIndexTabWorkspace,
  selectUnit
} from '../../../support/helpers';
import { primaryWorkspace } from '../../../support/testData';

describe('Unit Definitions', () => {
  it('opens unit definition editor', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit('M6_AK0012');
    cy.get('.unit-row.selected').should('contain.text', 'M6_AK0012');
    clickIndexTabWorkspace('editor');
    cy.get('.wait-animation', { timeout: 30000 }).should('not.exist');
    cy.get('iframe.unitHost').should('exist');
  });

  it('clicks rapidly between units and preserves the correct unit definition', () => {
    selectUnit('M6_AK0011');
    cy.wait(50);
    selectUnit('M6_AK0012');
    cy.wait(50);
    selectUnit('M6_AK0011');
    cy.get('.unit-row.selected').should('contain.text', 'M6_AK0011');
    cy.get('.wait-animation', { timeout: 30000 }).should('not.exist');
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-editor-dynamic-overlay', { timeout: 30000 })
        .eq(2)
        .within(() => {
          cy.get('aspect-math-table td:contains("2")').should('not.exist');
          cy.get('aspect-math-table td:contains("1")').should('exist');
        });
    });
  });

  it('preserves unit definition when switching back to previous unit', () => {
    selectUnit('M6_AK0012');
    cy.get('.unit-row.selected').should('contain.text', 'M6_AK0012');
    cy.get('.wait-animation', { timeout: 30000 }).should('not.exist');
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-editor-dynamic-overlay', { timeout: 30000 })
        .eq(2)
        .within(() => {
          cy.get('aspect-math-table td:contains("2")').should('exist');
        });
    });
  });
});
