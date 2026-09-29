import {
  addUnitPred,
  clickIndexTabWorkspace,
  selectUnit,
  setModuleWithoutVerification
} from '../../../support/helpers';
import { definitionAllElementsUnit, primaryWorkspace } from '../../../support/testData';

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

describe('Aspect Editor Elements Creation', () => {
  it('creates a new unit and opens definition editor', () => {
    setModuleWithoutVerification(primaryWorkspace, 'Aspect', 'Aspect', 'Schemer');
    cy.visitWs(primaryWorkspace);
    addUnitPred(definitionAllElementsUnit);
    cy.visitWs(primaryWorkspace);
    selectUnit(definitionAllElementsUnit.shortname);
    clickIndexTabWorkspace('editor');
    cy.get('.wait-animation', { timeout: 30000 }).should('not.exist');
    cy.get('iframe.unitHost').should('exist');
  });

  it('adds text element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-ui-element-toolbox button').contains('Text').click();
      cy.get('aspect-text', { timeout: 10000 }).should('exist');
    });
  });

  it('adds text-field element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-ui-element-toolbox button').contains('Eingabefeld').click();
      cy.get('aspect-text-field', { timeout: 10000 }).should('exist');
    });
  });

  it('adds text-area element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-ui-element-toolbox button').contains('Eingabebereich').click();
      cy.get('aspect-text-area', { timeout: 10000 }).should('exist');
    });
  });

  it('adds spell-correct element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-ui-element-toolbox button').contains('Wort korrigieren').click();
      cy.get('aspect-spell-correct', { timeout: 10000 }).should('exist');
    });
  });

  it('adds math-table element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-ui-element-toolbox button').contains('Rechenkästchen').click();
      cy.get('aspect-math-table', { timeout: 10000 }).should('exist');
    });
  });

  it('adds checkbox element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-ui-element-toolbox button').contains('Kontrollkästchen').click();
      cy.get('aspect-checkbox', { timeout: 10000 }).should('exist');
    });
  });

  it('adds dropdown element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-ui-element-toolbox button').contains('Klappliste').click();
      cy.get('aspect-dropdown', { timeout: 10000 }).should('exist');
    });
  });

  it('adds likert element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-ui-element-toolbox button').contains('Optionentabelle').click();
      cy.get('aspect-likert', { timeout: 10000 }).should('exist');
    });
  });

  it('adds slider element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-ui-element-toolbox button').contains('Schieberegler').click();
      cy.get('aspect-slider', { timeout: 10000 }).should('exist');
    });
  });

  it('adds drop-list element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('mat-expansion-panel-header', '(Zu)Ordnung').click();
      cy.get('aspect-ui-element-toolbox button').contains('Ablegeliste').click();
      cy.get('aspect-drop-list', { timeout: 10000 }).should('exist');
    });
  });

  it('adds cloze element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('mat-expansion-panel-header', 'Verbund').click();
      cy.get('aspect-ui-element-toolbox button').contains('Lückentext').click();
      cy.get('aspect-cloze', { timeout: 10000 }).should('exist');
    });
  });

  it('adds table element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-ui-element-toolbox button').contains('Tabelle').click();
      cy.get('aspect-table', { timeout: 10000 }).should('exist');
    });
  });

  it('adds button element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('mat-expansion-panel-header', 'Sonstige').click();
      cy.get('aspect-ui-element-toolbox button').contains('Knopf').click();
      cy.get('aspect-button', { timeout: 10000 }).should('exist');
    });
  });

  it('adds frame element ', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('aspect-ui-element-toolbox button').contains('Rahmen').click({ force: true });
      cy.get('aspect-frame', { timeout: 10000 }).should('exist');
    });
  });

  it('saves the unit definition with all added element', () => {
    cy.intercept('PATCH', '/api/workspaces/*/units/*/definition').as(
      'saveUnit'
    );
    cy.get('[data-cy="workspace-unit-save-button"]', { timeout: 10000 })
      .should('not.be.disabled')
      .click();
    cy.wait('@saveUnit').its('response.statusCode').should('eq', 200);
    cy.get('[data-cy="workspace-unit-save-button"]').should('be.disabled');
  });
});
