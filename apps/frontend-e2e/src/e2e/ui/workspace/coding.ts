import {
  clickIndexTabWorkspace,
  selectUnit
} from '../../../support/helpers';
import { definitionAllElementsUnit, primaryWorkspace } from '../../../support/testData';

describe('Aspect Coding Scheme (Kodierung)', () => {
  it('opens unit and navigates to coding (schemer) tab', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(definitionAllElementsUnit.shortname);
    cy.get('.unit-row.selected').should('contain.text', definitionAllElementsUnit.shortname);
    clickIndexTabWorkspace('schemer');
    cy.get('.wait-animation', { timeout: 30000 }).should('not.exist');
    cy.get('iframe.unitHost').should('exist');
  });

  it('verifies schemer iframe and variable list load', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.get('iqb-schemer', { timeout: 30000 }).should('exist');
      cy.get('.var-scheme-list', { timeout: 30000 }).should('exist');
    });
  });

  it('verifies coding variable for text-field element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('.var-list-entry', 'text-field_1', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies coding variable for text-area element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('.var-list-entry', 'text-area_1', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies coding variable for spell-correct element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('.var-list-entry', 'spell-correct_1', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies coding variable for math-table element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('.var-list-entry', 'math-table_1', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies coding variable for checkbox element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('.var-list-entry', 'checkbox_1', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies coding variable for dropdown element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('.var-list-entry', 'dropdown_1', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies coding variable for slider element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('.var-list-entry', 'slider_1', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies coding variable for drop-list element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('.var-list-entry', 'drop-list_1', { timeout: 10000 }).should('exist');
    });
  });

  it('selects a variable and verifies coding details container displays', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('.var-list-entry', 'text-field_1').click();
      cy.get('var-coding', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies coding scheme save button functionality', () => {
    cy.get('[data-cy="workspace-unit-save-button"]').should('exist');
  });
});
