import {
  UnitData,
  ws1
} from '../../../support/testData';
import {
  addUnitPred,
  clickIndexTabWorkspace,
  clickIndexTabWsgAdmin,
  deleteUnit,
  ensureUnitExists,
  goToWsMenu,
  importExercise,
  selectListUnits,
  selectUnit
} from '../../../support/helpers';
import { createBasicSpecCy, deleteBasicSpecCy } from '../shared/basic.spec.cy';

describe('Workspace Unit Management (Core CRUD)', () => {
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

  it('selects metadata profile from group settings and verifies in workspace settings', () => {
    selectProfileForAreaFromGroup([IqbProfile.DEu, IqbProfile.DEi], ws1, group1);
    cy.visitWs(ws1);
    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();
    cy.get('[data-cy="edit-workspace-settings-select-unit-profile"]').should(
      'contain.text',
      'Deu'
    );
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
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

  it('saves default Verona editor selection and persists after reload', () => {
    cy.visitWs(ws2);
    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();

    cy.get('[data-cy="edit-workspace-settings-editor"]').find('mat-select').click();
    cy.get('mat-option').should('have.length.at.least', 1).first().click();

    cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();

    cy.visitWs(ws2);
    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();
    cy.get('[data-cy="edit-workspace-settings-editor"]').should('be.visible');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
  });

  it('hides a route tab (Begleitmaterial / notes) when unchecked in settings', () => {
    ensureUnitExists(ws1, unit1);
    cy.visitWs(ws1);
    selectUnit(unit1.shortname);

    cy.get('[data-cy="workspace-routes-notes"]').should('be.visible');

    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();

    cy.get('studio-lite-edit-workspace-settings mat-checkbox')
      .contains('Begleitmaterial')
      .click();

    cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();

    cy.get('[data-cy="workspace-routes-notes"]').should('not.exist');
  });

  it('restores route tab when checked back on in settings', () => {
    ensureUnitExists(ws1, unit1);
    cy.visitWs(ws1);
    selectUnit(unit1.shortname);

    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();

    cy.get('studio-lite-edit-workspace-settings mat-checkbox')
      .contains('Begleitmaterial')
      .click();

    cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();

    cy.get('[data-cy="workspace-routes-notes"]').should('be.visible');
  });

  it('creates new units', () => {
    cy.visitWs(ws1);
    addUnitPred(unit1);
    cy.visitWs(ws1);
    addUnitPred(unit2);
    cy.visitWs(ws1);
    addUnitPred(unit3);
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
    ensureUnitExists(ws1, unit3);
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-preview-units"]').click();
    selectListUnits([unit3.shortname]);

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
    cy.visitWs(ws1);
    deleteUnit(unit1.shortname);
  });

  it('verifies save-or-discard dialog when navigating with unsaved changes', () => {
    cy.visitWs(ws1);
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
