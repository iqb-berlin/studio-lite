import {
  addUnitPred,
  clickIndexTabWorkspace,
  deleteUnit,
  selectUnit,
  setModuleWithoutVerification,
  waitForSuccess
} from '../../../support/helpers';
import { definitionAllElementsUnit, primaryWorkspace } from '../../../support/testData';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

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

// The studio only listens to messages whose source is the player's frame, so the notification is
// posted by a script running inside that frame, as the player itself would post it.
const sendRuntimeErrorFromPlayer = (code: string, message: string): void => {
  cy.get<HTMLIFrameElement>('[data-cy="unit-preview-iframe"]').then($iframe => {
    const playerDocument = $iframe[0].contentDocument as Document;
    const script = playerDocument.createElement('script');
    const notification = { type: 'vopRuntimeErrorNotification', code, message };
    script.textContent = `parent.postMessage(${JSON.stringify(notification)}, '*');`;
    playerDocument.body.appendChild(script);
  });
};

// One path through three modules: DEF_ALL1 is written in the editor, coded in the schemer and
// played in the preview, each describe working on what the one before it saved.
before(() => {
  createTestBaseAPI({ units: 'test_studio_units_download.zip' });
});

after(() => {
  deleteTestBaseAPI();
});

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
    waitForSuccess('@saveUnit');
    cy.get('[data-cy="workspace-unit-save-button"]').should('be.disabled');
  });
});

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
      cy.contains('.var-list-entry', 'text-field_1', { timeout: 10000 })
        .should('exist')
        .click();
      cy.get('var-coding', { timeout: 10000 }).should('exist');
      cy.get('var-coding button')
        .filter((_, el) => el.querySelector('svg[viewBox="0 0 24 24"]') !== null ||
          (el.getAttribute('mattooltip') || '').includes('Kodierung generieren'))
        .first()
        .click();
      cy.get('mat-dialog-content textarea', { timeout: 10000 })
        .type('Eingabe Text');
      cy.contains('mat-dialog-actions button', 'Generiere Kodierung')
        .click();
      cy.get('mat-dialog-container').should('not.exist');
    });
    cy.intercept('PATCH', '/api/workspaces/*/units/*/scheme').as('saveScheme');
    cy.get('[data-cy="workspace-unit-save-button"]', { timeout: 10000 })
      .should('not.be.disabled')
      .click();
    waitForSuccess('@saveScheme');
    cy.get('[data-cy="workspace-unit-save-button"]').should('be.disabled');
  });

  it('verifies coding variable for text-area element', () => {
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('.var-list-entry', 'text-area_1', { timeout: 10000 })
        .should('exist')
        .click();
      cy.get('var-coding', { timeout: 10000 }).should('exist');
      cy.get('var-coding button')
        .filter((_, el) => el.querySelector('svg[viewBox="0 0 24 24"]') !== null ||
          (el.getAttribute('mattooltip') || '').includes('Kodierung generieren'))
        .first()
        .click();
      cy.get('mat-dialog-content textarea', { timeout: 10000 })
        .type('Langer Antworttext');
      cy.contains('mat-dialog-actions button', 'Generiere Kodierung')
        .click();
      cy.get('mat-dialog-container').should('not.exist');
    });
    cy.intercept('PATCH', '/api/workspaces/*/units/*/scheme').as('saveScheme');
    cy.get('[data-cy="workspace-unit-save-button"]', { timeout: 10000 })
      .should('not.be.disabled')
      .click();
    waitForSuccess('@saveScheme');
    cy.get('[data-cy="workspace-unit-save-button"]').should('be.disabled');
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
      cy.contains('.var-list-entry', 'checkbox_1', { timeout: 10000 })
        .should('exist')
        .click();
      cy.get('var-coding', { timeout: 10000 }).should('exist');
      cy.get('var-coding button')
        .filter((_, el) => el.querySelector('svg[viewBox="0 0 24 24"]') !== null ||
          (el.getAttribute('mattooltip') || '').includes('Kodierung generieren'))
        .first()
        .click();
      cy.contains('mat-list-option', 'Angekreuzt: Beschriftung', { timeout: 10000 })
        .click();
      cy.contains('mat-dialog-actions button', 'Generiere Kodierung')
        .click();
      cy.get('mat-dialog-container').should('not.exist');
    });
    cy.intercept('PATCH', '/api/workspaces/*/units/*/scheme').as('saveScheme');
    cy.get('[data-cy="workspace-unit-save-button"]', { timeout: 10000 })
      .should('not.be.disabled')
      .click();
    waitForSuccess('@saveScheme');
    cy.get('[data-cy="workspace-unit-save-button"]').should('be.disabled');
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

describe('Unit Preview (Vorschau)', () => {
  afterEach(() => {
    cy.get('body').then($body => {
      if ($body.find('mat-dialog-container').length > 0) {
        cy.contains('mat-dialog-container button', 'Schließen').click({ force: true });
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

  // #1788: a code of the player specification is explained to the author
  it('explains a runtime error the player reports with a known code', () => {
    sendRuntimeErrorFromPlayer('GEOGEBRA_NOT_LOADING', 'GeoGebra could not be loaded');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('mat-dialog-container', { timeout: 10000 }).within(() => {
        cy.contains('h1', json['runtime-error-dialog'].title).should('exist');
        cy.get('[data-cy="runtime-error-dialog-explanation"]')
          .should('have.text', json['runtime-error-dialog'].codes.GEOGEBRA_NOT_LOADING);
        cy.get('code').should('have.text', 'GEOGEBRA_NOT_LOADING');
        cy.get('[data-cy="runtime-error-dialog-message"]').should('contain.text', 'GeoGebra could not be loaded');
        cy.contains('button', json['runtime-error-dialog'].close).click();
      });
    });
    cy.get('mat-dialog-container').should('not.exist');
  });

  // #1869: errors the player reports one by one are collected in one dialog. The repeated error is sent
  // before the last one, so once the last one is shown the repetition has been handled as well.
  it('collects the runtime errors the player reports in one dialog', () => {
    sendRuntimeErrorFromPlayer('IMAGE_NOT_LOADING', 'image a');
    sendRuntimeErrorFromPlayer('IMAGE_NOT_LOADING', 'image b');
    sendRuntimeErrorFromPlayer('IMAGE_NOT_LOADING', 'image a');
    sendRuntimeErrorFromPlayer('IMAGE_NOT_LOADING', 'image c');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('mat-dialog-container', { timeout: 10000 }).within(() => {
        cy.get('[data-cy="runtime-error-dialog-message"]').should('have.length', 3);
        cy.get('[data-cy="runtime-error-dialog-message"]').then($messages => {
          expect($messages.toArray().map(message => message.textContent?.trim()))
            .to.deep.equal(['image a', 'image b', 'image c']);
        });
        cy.get('[data-cy="runtime-error-dialog-explanation"]')
          .should('have.length', 1)
          .and('have.text', json['runtime-error-dialog'].codes.IMAGE_NOT_LOADING);
      });
      cy.get('mat-dialog-container').should('have.length', 1);
      cy.contains('mat-dialog-container button', json['runtime-error-dialog'].close).click();
    });
    cy.get('mat-dialog-container').should('not.exist');
  });

  // #1361: the coding is checked with the unit as it is now, saved or not
  it('checks the coding without asking to save first', () => {
    clickIndexTabWorkspace('properties');
    cy.get('textarea[formcontrolname="description"]').type(' ungespeichert');
    cy.get('[data-cy="workspace-unit-save-button"]').should('be.enabled');
    clickIndexTabWorkspace('preview');
    cy.get('.wait-animation', { timeout: 30000 }).should('not.exist');
    // the check codes responses, so the player is given one first
    waitForPlayerState('checkbox_1', 'true', () => {
      cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
        cy.get('aspect-checkbox', { timeout: 10000 }).contains('Beschriftung').click();
      });
    });
    cy.get('[data-cy="preview-bar-check-coding"]').click();
    cy.get('mat-dialog-content', { timeout: 10000 }).within(() => {
      cy.contains('checkbox_1').should('exist');
    });
    cy.contains('mat-dialog-actions button', 'Schließen').click();
    cy.get('mat-dialog-container').should('not.exist');
    cy.get('[data-cy="workspace-unit-discard-button"]').click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.contains('mat-dialog-container button', json.workspace.reject).click();
    });
    cy.get('[data-cy="workspace-unit-save-button"]').should('be.disabled');
  });

  it('cleans up the test unit', () => {
    cy.visitWs(primaryWorkspace);
    cy.intercept('DELETE', '/api/workspaces/*/units*').as('delUnits');
    deleteUnit(definitionAllElementsUnit.shortname);
    cy.wait('@delUnits');
    cy.contains(definitionAllElementsUnit.shortname).should('not.exist');
  });
});
