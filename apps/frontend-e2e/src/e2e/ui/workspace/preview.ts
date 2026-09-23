import {
  clickIndexTabWorkspace,
  deleteUnit,
  selectUnit
} from '../../../support/helpers';
import { definitionAllElementsUnit, primaryWorkspace } from '../../../support/testData';

interface PlayerMessageData {
  unitState?: {
    dataParts?: Record<string, string>;
  };
}

const waitForPlayerState = (
  variableId: string,
  expectedContent: string,
  action: () => void
): void => {
  cy.window().then(win => {
    const statePromise = new Cypress.Promise<boolean>(resolve => {
      const handler = (event: MessageEvent): void => {
        let msg: unknown = event.data;
        if (typeof msg === 'string') {
          try {
            msg = JSON.parse(msg);
          } catch {
            // ignore non-json messages
          }
        }
        const dataParts = (msg as PlayerMessageData)?.unitState?.dataParts;
        if (dataParts) {
          const str = JSON.stringify(dataParts);
          if (str.includes(variableId) && str.includes(expectedContent)) {
            win.removeEventListener('message', handler);
            resolve(true);
          }
        }
      };
      win.addEventListener('message', handler);
    });

    action();

    cy.wrap(statePromise, { timeout: 10000 });
  });
};

describe('Unit Preview (Vorschau)', () => {
  afterEach(() => {
    cy.get('body').then($body => {
      if ($body.find('mat-dialog-container').length > 0) {
        cy.contains('mat-dialog-actions button', 'Schließen').click({ force: true });
        cy.get('mat-dialog-container').should('not.exist');
      }
      if ($body.find('.cdk-overlay-backdrop').length > 0) {
        cy.get('.cdk-overlay-backdrop').should('not.exist');
      }
    });
  });

  it('opens unit and navigates to Vorschau (preview) tab', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(definitionAllElementsUnit.shortname);
    cy.get('.unit-row.selected').should('contain.text', definitionAllElementsUnit.shortname);
    clickIndexTabWorkspace('preview');
    cy.get('.wait-animation', { timeout: 30000 }).should('not.exist');
    cy.get('[data-cy="unit-preview-iframe"]', { timeout: 30000 }).should('be.visible');
  });

  it('verifies text element in preview', () => {
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-text', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies text-field element in preview', () => {
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-text-field', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies text-area element in preview', () => {
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-text-area', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies spell-correct element in preview', () => {
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-spell-correct', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies math-table element in preview', () => {
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-math-table', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies checkbox element in preview', () => {
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-checkbox', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies that coding exists for coded elements', () => {
    cy.get('[data-cy="preview-bar-check-coding"]').click();
    cy.get('mat-dialog-content', { timeout: 10000 }).within(() => {
      cy.contains('checkbox_1').should('exist');
      cy.contains('text-field_1').should('exist');
      cy.contains('text-area_1').should('exist');
      cy.contains('dropdown_1').should('not.exist');
    });
    cy.contains('mat-slide-toggle', 'Nur Variablen mit Codes').click();
    cy.get('mat-dialog-content').within(() => {
      cy.contains('checkbox_1').should('exist');
      cy.contains('text-field_1').should('exist');
      cy.contains('text-area_1').should('exist');
      cy.contains('dropdown_1').should('exist');
    });
    cy.contains('mat-dialog-actions button', 'Schließen').click();
    cy.get('mat-dialog-container').should('not.exist');
  });

  it('verifies that element checkbox has state coding_complete', () => {
    waitForPlayerState('checkbox_1', 'true', () => {
      cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
        cy.get('aspect-checkbox').contains('Beschriftung').click();
        cy.get('aspect-checkbox input[type="checkbox"]').should('be.checked');
      });
    });
    cy.get('[data-cy="preview-bar-check-coding"]').click();
    cy.get('td:contains("checkbox_1")').should('exist').next().next()
      .should('contain.text', 'CODING_COMPLETE');
    cy.contains('mat-dialog-actions button', 'Schließen').click();
    cy.get('mat-dialog-container').should('not.exist');
  });

  it('verifies that element text-field has state coding_complete', () => {
    waitForPlayerState('text-field_1', 'Eingabe Text', () => {
      cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
        cy.get('aspect-text-field input', { timeout: 10000 }).type('Eingabe Text');
      });
    });
    cy.get('[data-cy="preview-bar-check-coding"]').click();
    cy.get('td:contains("text-field_1")')
      .should('exist')
      .next()
      .next()
      .should('contain.text', 'CODING_COMPLETE');
    cy.contains('mat-dialog-actions button', 'Schließen').click();
    cy.get('mat-dialog-container').should('not.exist');
  });

  it('verifies that element text-area has state coding_complete', () => {
    waitForPlayerState('text-area_1', 'Langer Antworttext', () => {
      cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
        cy.get('aspect-text-area textarea', { timeout: 10000 }).type('Langer Antworttext');
      });
    });
    cy.get('[data-cy="preview-bar-check-coding"]').click();
    cy.get('td:contains("text-area_1")').should('exist')
      .next()
      .next()
      .should('contain.text', 'CODING_COMPLETE');
    cy.contains('mat-dialog-actions button', 'Schließen').click();
    cy.get('mat-dialog-container').should('not.exist');
  });

  it('verifies dropdown element in preview', () => {
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-dropdown', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies likert element in preview', () => {
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-likert', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies slider element in preview', () => {
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-slider', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies drop-list element in preview', () => {
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-drop-list', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies cloze element in preview', () => {
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-cloze', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies table element in preview', () => {
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-table', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies button element in preview', () => {
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-button', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies frame element in preview', () => {
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-frame', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies preview bar controls', () => {
    cy.get('studio-lite-preview-bar').should('exist');
    cy.get('[data-cy="preview-bar-check-coding"]').should('exist');
    cy.get('[data-cy="preview-bar-print"]').should('exist');
  });

  it('cleans up the test unit', () => {
    cy.visitWs(primaryWorkspace);
    cy.intercept('DELETE', '/api/workspaces/*/units*').as('delUnits');
    deleteUnit(definitionAllElementsUnit.shortname);
    cy.wait('@delUnits');
    cy.contains(definitionAllElementsUnit.shortname).should('not.exist');
  });
});
