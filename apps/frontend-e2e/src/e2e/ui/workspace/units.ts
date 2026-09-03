import { primaryWorkspace, unitCrudUnits } from '../../../support/testData';
import {
  addUnitPred,
  clickIndexTabWorkspace,
  deleteUnit,
  ensureUnitExists,
  goToWsMenu,
  importExercise,
  selectListUnits,
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

  it('navigates to unit preview and verifies iframe', () => {
    selectUnit('M6_AK0011');
    clickIndexTabWorkspace('preview');
    cy.get('[data-cy="unit-preview-iframe"]').should('be.visible');
  });

  it('verifies coding check functionality', () => {
    cy.intercept('GET', '/api/workspaces/*/units/*/scheme', {
      body: {
        scheme: JSON.stringify({
          variableCodings: [
            {
              id: 'var1',
              alias: 'Variable_1',
              sourceType: 'BASE',
              codes: [
                {
                  id: 111,
                  type: 'FULL_CREDIT',
                  score: 1,
                  ruleSetOperatorAnd: true,
                  ruleSets: []
                }
              ]
            }
          ]
        })
      }
    }).as('getUnitScheme');

    cy.get('[data-cy="unit-preview-iframe"]').then($iframe => {
      const iframeWindow = ($iframe[0] as HTMLIFrameElement).contentWindow;
      cy.window().then(win => {
        const messageEvent = new MessageEvent('message', {
          data: {
            type: 'vopStateChangedNotification',
            sessionId: 'test-session',
            unitState: {
              dataParts: { all: '[]' },
              unitStateDataType: 'iqb-standard@1.0',
              presentationProgress: 'complete',
              responseProgress: 'complete'
            }
          },
          source: iframeWindow
        });
        win.dispatchEvent(messageEvent);
      });
    });

    cy.get('[data-cy="preview-bar-check-coding"]').click();
    cy.wait('@getUnitScheme');

    cy.get('mat-mdc-dialog-container, mat-dialog-container', {
      timeout: 15000
    }).should('be.visible');

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('mat-dialog-actions, .mat-mdc-dialog-actions')
        .contains('button', json.close)
        .click({ force: true });
    });
  });

  it('verifies print options dialog opens', () => {
    cy.get('[data-cy="preview-bar-print"]').click();

    cy.get('mat-mdc-dialog-container, mat-dialog-container', {
      timeout: 15000
    }).should('be.visible');

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('mat-dialog-actions, .mat-mdc-dialog-actions')
        .contains('button', json.cancel || json.close)
        .click({ force: true });
    });
  });

  it('displays print preview for units with coding and comments', () => {
    ensureUnitExists(primaryWorkspace, unitCrudUnits.crudPrint);
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-preview-units"]').click();
    selectListUnits([unitCrudUnits.crudPrint.shortname]);

    cy.intercept('GET', '/api/workspaces/*/units/*/scheme', {
      body: {
        scheme: JSON.stringify({
          variableCodings: [
            {
              id: 'var1',
              alias: 'Variable_1',
              sourceType: 'BASE',
              codes: [
                {
                  id: 111,
                  type: 'FULL_CREDIT',
                  score: 1,
                  ruleSetOperatorAnd: true,
                  ruleSets: [
                    {
                      ruleOperatorAnd: false,
                      rules: [
                        {
                          method: 'MATCH',
                          parameters: ['adios']
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        })
      }
    }).as('getUnitScheme');

    cy.intercept('GET', '/api/workspaces/*/units/*/comments*', {
      body: [
        {
          id: 1,
          body: '<p>Test comment</p>',
          userName: 'tester',
          changedAt: new Date().toISOString()
        }
      ]
    }).as('getComments');

    cy.window().then(win => {
      cy.stub(win, 'open')
        .callsFake((url: string) => {
          win.location.hash = url.replace(/^#/, '');
        })
        .as('windowOpen');
    });

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('button[type="submit"]').contains(json.construct).click();
    });

    cy.get('@windowOpen').should('be.called');
    cy.url().should('include', '/print');

    cy.get('studio-lite-unit-print-coding').should('exist');
    cy.get('studio-lite-unit-print-coding')
      .contains('Variable_1')
      .should('exist');

    cy.get('studio-lite-unit-print-code').should('exist');
    cy.get('studio-lite-unit-print-code').contains('111').should('exist');

    cy.get('studio-lite-unit-print-comments').should('exist');
    cy.get('studio-lite-unit-print-comments')
      .contains('Test comment')
      .should('exist');
    cy.get('studio-lite-unit-print-comments')
      .contains('tester')
      .should('exist');
  });

  it('deletes a unit', () => {
    cy.visitWs(primaryWorkspace);
    deleteUnit(unitCrudUnits.crud1.shortname);
  });

  it('verifies save-or-discard dialog when navigating with unsaved changes', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit('M6_AK0011');
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
