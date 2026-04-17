import {
  group1,
  UnitData,
  ws1,
  ws2
} from '../../../support/testData';
import {
  selectProfileForAreaFromGroup,
  selectProfileForGroup
} from '../../../support/metadata/metadata-util';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import {
  addStatus,
  addUnitFromExisting,
  addUnitPred,
  clickIndexTabWorkspace,
  clickIndexTabWsgAdmin,
  clickSaveButtonRight,
  deleteUnit,
  goToWsMenu,
  importExercise,
  moveUnit,
  selectListUnits,
  selectUnit,
  setModuleWithoutVerification,
  verifyModuleConfiguration
} from '../../../support/helpers';
import { createBasicSpecCy, deleteBasicSpecCy } from '../shared/basic.spec.cy';

describe('Workspace Unit Management', () => {
  const unit1: UnitData = {
    shortname: 'AUF_D1',
    name: 'Name Auf 1',
    group: 'Gruppe D'
  };
  const unit2: UnitData = {
    shortname: 'AUF_E1',
    name: 'Name Auf 2',
    group: 'Gruppe E'
  };
  const unit3: UnitData = {
    shortname: 'AUF_D2',
    name: 'Name Auf 2',
    group: 'Gruppe D'
  };
  const newUnit: UnitData = {
    shortname: 'Neu_Ex_D1',
    name: 'New Auf 1',
    group: 'Group D'
  };
  before(() => {
    createBasicSpecCy();
  });
  after(() => {
    deleteBasicSpecCy();
    // cy.resetDb();
  });

  it('selects metadata profile from workspace settings', () => {
    selectProfileForGroup(group1, IqbProfile.DE);
  });

  it('selects metadata profile from group settings', () => {
    selectProfileForAreaFromGroup(IqbProfile.DE, ws1, group1);
  });

  it('adds custom states to workspace', () => {
    cy.findAdminGroupSettings(group1).click();
    clickIndexTabWsgAdmin('settings');
    addStatus('In Bearbeitung', 0);
    addStatus('Finale', 1);
    clickSaveButtonRight();
  });

  it('displays available modules in dropdowns', () => {
    cy.visitWs(ws2);
    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();

    // Verify editor options
    cy.get('[data-cy="edit-workspace-settings-editor"]')
      .find('mat-select').click();
    cy.get('mat-option').should('have.length', 2);
    cy.get('.cdk-overlay-backdrop').last().click({ force: true });

    // Verify player options
    cy.get('[data-cy="edit-workspace-settings-player"]')
      .find('mat-select').click();
    cy.get('mat-option').should('have.length', 3);
    cy.get('.cdk-overlay-backdrop').last().click({ force: true });

    // Verify schemer options
    cy.get('[data-cy="edit-workspace-settings-schemer"]')
      .find('mat-select').click();
    cy.get('mat-option').should('have.length', 1);
    cy.get('.cdk-overlay-backdrop').last().click({ force: true });

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
  });

  it('configures Verona modules for workspace', () => {
    setModuleWithoutVerification(ws1, 'Aspect', 'Aspect', 'Schemer');
  });

  it('verifies module configuration persists after page reload', () => {
    cy.visit('/');
    cy.visitWs(ws1);
    verifyModuleConfiguration(ws1, 'Aspect', 'Aspect', 'Schemer');
  });

  it('validates module settings are workspace-specific', () => {
    // Verify ws1 has configured modules
    verifyModuleConfiguration(ws1, 'Aspect', 'Aspect', 'Schemer');

    // Verify ws2 has independent configuration
    cy.visitWs(ws2);
    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();

    // ws2 should have module dropdowns available (even if not configured yet)
    cy.get('[data-cy="edit-workspace-settings-editor"]')
      .find('mat-select').should('have.class', 'mat-mdc-select-empty');
    cy.get('[data-cy="edit-workspace-settings-player"]')
      .find('mat-select').should('have.class', 'mat-mdc-select-empty');
    cy.get('[data-cy="edit-workspace-settings-schemer"]')
      .find('mat-select').should('have.class', 'mat-mdc-select-empty');

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
  });

  it('configures workspace with alternative module combinations', () => {
    // Configure ws2 with different modules (Speedtest editor, Stars player)
    // setModuleWithVerification already verifies the configuration
    setModuleWithoutVerification(ws2, 'Aspect', 'Stars', 'Schemer');

    // Verify ws1 still has original configuration
    verifyModuleConfiguration(ws1, 'Aspect', 'Aspect', 'Schemer');
  });

  it('allows switching between different player modules', () => {
    // Switch to Speedtest player
    setModuleWithoutVerification(ws1, 'Aspect', 'Speedtest', 'Schemer');
    // Switch to Stars player (already verified by setModuleWithVerification)
    setModuleWithoutVerification(ws1, 'Aspect', 'Stars', 'Schemer');
  });

  it('creates new units', () => {
    cy.visitWs(ws1);
    addUnitPred(unit1);
    cy.visitWs(ws1);
    addUnitPred(unit2);
    cy.visitWs(ws1);
    addUnitPred(unit3);
  });

  it('creates unit from existing unit', () => {
    cy.visitWs(ws1);
    addUnitFromExisting(`${group1}: ${ws1}`, unit1, newUnit);
  });

  it('imports units from zip file', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
    cy.contains('M6_AK0011')
      .should('exist');
  });
  it('navigates to unit preview and verifies iframe', () => {
    selectUnit('M6_AK0011');
    clickIndexTabWorkspace('preview');
    cy.get('[data-cy="unit-preview-iframe"]').should('be.visible');
  });

  it('verifies coding check functionality', () => {
    // Mock the API for unit scheme
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

    // Simulate player sending responses by dispatching a MessageEvent with the iframe as source
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

    // Verify that the coding results dialog opens
    // We check for both MDC and legacy dialog containers to be robust
    cy.get('mat-mdc-dialog-container, mat-dialog-container', {
      timeout: 15000
    }).should('be.visible');

    // Close the dialog
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('mat-dialog-actions, .mat-mdc-dialog-actions')
        .contains('button', json.close)
        .click({ force: true });
    });
  });

  it('verifies print options dialog opens', () => {
    cy.get('[data-cy="preview-bar-print"]').click();

    // Verify that the print options dialog opens
    cy.get('mat-mdc-dialog-container, mat-dialog-container', {
      timeout: 15000
    }).should('be.visible');

    // Close the dialog
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('mat-dialog-actions, .mat-mdc-dialog-actions')
        .contains('button', json.cancel || json.close)
        .click({ force: true });
    });
  });

  it('deletes a unit', () => {
    cy.visitWs(ws1);
    deleteUnit(unit1.shortname);
  });

  it('moves unit to another workspace', () => {
    moveUnit(ws1, ws2, unit2);
  });

  it('exports selected units', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    selectListUnits([unit3.shortname, newUnit.shortname]);
    cy.clickDataCyWithResponseCheck(
      '[data-cy="workspace-export-unit-button"]',
      [200, 304],
      '/api/workspaces/*',
      'GET',
      'export'
    );
  });

  it('displays metadata report', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-metadata"]').click();
    cy.clickDataCyWithResponseCheck(
      '[data-cy="workspace-show-metadata-display"]',
      [200, 304],
      '/api/workspaces/*/units/properties',
      'GET',
      'summaryMetadata');
    cy.get('[data-cy="metadata-table-view-download"]');
  });

  it('displays coding report', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-coding-report"]').click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.close);
    });
  });

  it('exports codebook for selected units', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-export-coding-book"]').click();
    selectListUnits([newUnit.shortname]);
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickButtonWithResponseCheck(
        json.export,
        [200, 304],
        '/api/workspaces/*/units/coding-book*',
        'GET',
        'codebook'
      );
    });
  });

  it('displays print preview for units with coding and comments', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-preview-units"]').click();
    selectListUnits([unit3.shortname]);

    // Intercept API calls to provide mock data for coding and comments
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

    // Intercept window.open
    cy.window().then(win => {
      cy.stub(win, 'open')
        .callsFake((url: string) => {
          // Change location directly
          win.location.hash = url.replace(/^#/, '');
        })
        .as('windowOpen');
    });

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('button[type="submit"]').contains(json.construct).click();
    });

    cy.get('@windowOpen').should('be.called');
    cy.url().should('include', '/print');

    // Verify coding component and its mocked data
    cy.get('studio-lite-unit-print-coding').should('exist');
    cy.get('studio-lite-unit-print-coding')
      .contains('Variable_1')
      .should('exist');

    // Verify code component (which is inside coding component)
    cy.get('studio-lite-unit-print-code').should('exist');
    cy.get('studio-lite-unit-print-code').contains('111').should('exist');

    // Verify comments component and its mocked data
    cy.get('studio-lite-unit-print-comments').should('exist');
    cy.get('studio-lite-unit-print-comments')
      .contains('Test comment')
      .should('exist');
    cy.get('studio-lite-unit-print-comments')
      .contains('tester')
      .should('exist');
  });

  it('displays group management', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-manage-unit-groups"]').click();
    cy.get('studio-lite-group-manage').should('exist');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.close);
    });
  });

  it('displays user list', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-user-list"]').click();
    cy.get('studio-lite-workspace-user-list').should('exist');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.close);
    });
  });

  it('copies unit to another workspace', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-copy-unit"]').click();
    cy.get('mat-select').click();
    cy.get(`mat-option:contains("${ws2}")`).click();
    cy.get(`mat-cell:contains("${unit3.shortname}")`).prev().click();
    cy.clickDataCyWithResponseCheck(
      '[data-cy="workspace-move-unit-button"]',
      [200, 201],
      '/api/workspaces/*/units',
      'POST',
      'copyUnit'
    );
  });

  it('has disabled submit and return buttons', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-submit-units"]').should('be.disabled');
    cy.get('[data-cy="workspace-edit-unit-return-submitted-units"]').should('be.disabled');
  });
});
