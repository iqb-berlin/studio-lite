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
  deleteUnit,
  ensureUnitExists,
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
    // Both profiles of the subject, as insert-record.cy.ts does: the unit and the item
    // profile are enabled one by one, and the workspace below can only pick what the
    // group offers.
    selectProfileForGroup(group1, IqbProfile.DEu);
    selectProfileForGroup(group1, IqbProfile.DEi);
  });

  it('selects metadata profile from group settings', () => {
    selectProfileForAreaFromGroup([IqbProfile.DEu, IqbProfile.DEi], ws1, group1);
  });

  it('adds custom states to workspace', () => {
    cy.findAdminGroupSettings(group1).click();
    clickIndexTabWsgAdmin('settings');
    addStatus('In Bearbeitung', 0);
    addStatus('Finale', 1);
    cy.intercept('PATCH', '/api/workspace-groups/*').as('saveStates');
    cy.get('[data-cy="wsg-admin-settings-save-button"]')
      .should('not.be.disabled')
      .click();
    cy.wait('@saveStates').its('response.statusCode').should('eq', 200);
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
    ensureUnitExists(ws1, unit3);
    ensureUnitExists(ws1, newUnit);
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

  it('export dialog shows file-config checkboxes', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    // export-unit-file-config: definition, coding, resources, notes checkboxes
    cy.get('mat-card.files mat-checkbox, studio-lite-export-unit-file-config mat-checkbox')
      .should('have.length.greaterThan', 0);
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
  });

  it('export dialog search filter narrows the unit list', () => {
    ensureUnitExists(ws1, unit3);
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    cy.get('[data-cy="workspace-select-unit-list-filter-units"]')
      .type(unit3.shortname);
    cy.get(`[data-cy="workspace-select-unit-list-checkbox-${unit3.shortname}"]`)
      .should('be.visible');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
  });

  it('export dialog definition checkbox can be toggled', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    cy.get('mat-card.files mat-checkbox, studio-lite-export-unit-file-config mat-checkbox')
      .first()
      .find('input')
      .then($chk => {
        const wasChecked = $chk.prop('checked');
        cy.wrap($chk).click({ force: true });
        cy.wrap($chk).should(wasChecked ? 'not.be.checked' : 'be.checked');
      });
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
  });

  it('performs unit download/export successfully', () => {
    ensureUnitExists(ws1, unit3);
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    selectListUnits([unit3.shortname]);
    cy.get('mat-radio-button[value="json"]').click();
    cy.intercept('POST', '/api/workspaces/*/download-units', {
      statusCode: 200,
      body: {}
    }).as('downloadReq');
    cy.get('[data-cy="workspace-export-unit-button"]').click();
    cy.wait('@downloadReq').its('response.statusCode').should('eq', 200);
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
    cy.get('[data-cy="metadata-table-view-download"]').should('be.visible');
    cy.get('[data-cy="metadata-table-view-close"]').should('be.visible').click();
    cy.get('[data-cy="metadata-table-view-close"]').should('not.exist');
  });

  it('displays coding report', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-coding-report"]').click();
    // coding-report component must be rendered inside the dialog
    cy.get('mat-mdc-dialog-container, mat-dialog-container').within(() => {
      cy.get('studio-lite-coding-report, mat-table, table, p').should('exist');
    });
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.close);
    });
    cy.get('mat-mdc-dialog-container, mat-dialog-container').should('not.exist');
  });

  it('exports codebook for selected units', () => {
    ensureUnitExists(ws1, newUnit);
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

  it('coding book export dialog can be cancelled without a selection', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-export-coding-book"]').click();
    // with nothing selected the dialog should still render the unit list
    cy.get('[data-cy="workspace-select-unit-list-key"]').should('exist');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
    cy.get('mat-mdc-dialog-container, mat-dialog-container').should('not.exist');
  });

  it('displays print preview for units with coding and comments', () => {
    ensureUnitExists(ws1, unit3);
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
    ensureUnitExists(ws1, unit3);
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-copy-unit"]').click();
    cy.get('mat-select').click();
    cy.get(`mat-option:contains("${ws2}")`).click();
    cy.get(`[data-cy="workspace-select-unit-list-checkbox-${unit3.shortname}"]`).click();
    cy.clickDataCyWithResponseCheck(
      '[data-cy="workspace-move-unit-button"]',
      [200, 201],
      '/api/workspaces/*/units',
      'POST',
      'copyUnit'
    );
  });

  it('verifies save-or-discard dialog when navigating with unsaved changes', () => {
    cy.visitWs(ws1);
    selectUnit('M6_AK0011');
    clickIndexTabWorkspace('properties');

    // Modify unit name to trigger "isChanged" state
    cy.get('input[formControlName="name"]').type(' New Title');

    // Try to select another unit
    selectUnit('M6_AK0012');

    // Verify SaveOrDiscard dialog
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('studio-lite-save-or-discard, mat-dialog-container', {
        timeout: 5000
      })
        .eq(0)
        .within(() => {
          cy.contains(json.workspace.save).should('be.visible'); // Title
          cy.contains(json.workspace['save-unit-data-changes']).should(
            'be.visible'
          ); // Content
        });

      // Test "Cancel" button
      cy.get('button').contains(json.cancel).click();
      cy.url().should('include', '/properties'); // Stay on properties tab
    });

    // Try to select another unit
    selectUnit('M6_AK0012');

    // Test "Discard" button
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('button').contains(json.workspace['reject-changes-label']).click();
    });
  });
});
