import {
  AccessLevel,
  baseGroup,
  primaryWorkspace,
  secondaryWorkspace
} from '../../../support/testData';
import {
  selectProfileForAreaFromGroup,
  selectProfileForGroup
} from '../../../support/metadata/metadata-util';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import {
  saveWorkspaceSettings,
  setModuleWithoutVerification,
  setRouteVisibility,
  verifyModuleConfiguration
} from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

describe('Workspace Settings & Verona Modules', () => {
  before(() => {
    createTestBaseAPI();
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('selects metadata profile from workspace settings', () => {
    selectProfileForGroup(baseGroup, IqbProfile.DEu);
    selectProfileForGroup(baseGroup, IqbProfile.DEi);
  });

  it('selects metadata profile from group settings and verifies in workspace settings', () => {
    selectProfileForAreaFromGroup([IqbProfile.DEu, IqbProfile.DEi], primaryWorkspace, baseGroup);
    cy.visitWs(primaryWorkspace);
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

  it('displays available modules in dropdowns', () => {
    cy.visitWs(secondaryWorkspace);
    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();

    // Verify editor options
    cy.get('[data-cy="edit-workspace-settings-editor"]')
      .find('mat-select').click();
    cy.get('mat-option').should('have.length', 2);
    cy.get('body').type('{esc}');

    // Verify player options
    cy.get('[data-cy="edit-workspace-settings-player"]')
      .find('mat-select').click();
    cy.get('mat-option').should('have.length', 3);
    cy.get('body').type('{esc}');

    // Verify schemer options
    cy.get('[data-cy="edit-workspace-settings-schemer"]')
      .find('mat-select').click();
    cy.get('mat-option').should('have.length', 1);
    cy.get('body').type('{esc}');

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
  });

  it('configures Verona modules for workspace', () => {
    setModuleWithoutVerification(primaryWorkspace, 'Aspect', 'Aspect', 'Schemer');
  });

  it('verifies module configuration persists after page reload', () => {
    cy.visit('/');
    cy.visitWs(primaryWorkspace);
    verifyModuleConfiguration(primaryWorkspace, 'Aspect', 'Aspect', 'Schemer');
  });

  it('validates module settings are workspace-specific', () => {
    verifyModuleConfiguration(primaryWorkspace, 'Aspect', 'Aspect', 'Schemer');

    cy.visitWs(secondaryWorkspace);
    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();

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
    setModuleWithoutVerification(secondaryWorkspace, 'Aspect', 'Stars', 'Schemer');
    verifyModuleConfiguration(primaryWorkspace, 'Aspect', 'Aspect', 'Schemer');
  });

  // A new workspace starts with the notes route hidden, so it is shown first and hidden again.
  it('shows a route tab (Begleitmaterial / notes) when checked in settings', () => {
    cy.visitWs(primaryWorkspace);

    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();

    setRouteVisibility('notes', true);
    saveWorkspaceSettings();

    cy.get('[data-cy="workspace-routes-notes"]').should('be.visible');
  });

  it('hides the route tab again when unchecked in settings', () => {
    cy.visitWs(primaryWorkspace);

    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();

    setRouteVisibility('notes', false);
    saveWorkspaceSettings();

    cy.get('[data-cy="workspace-routes-notes"]').should('not.exist');
  });

  // The dialog showed the profiles from a request of its own for the workspace, and its response,
  // coming after a choice, put the stored profile back on screen while the choice was saved (#2138).
  // That request is held back until the choice is made, so that without the fix it comes after it.
  // With the fix the dialog makes no such request.
  it('shows the unit profile it saves when one is chosen before its own request answered (#2138)', () => {
    const group = 'Profil vor Arbeitsbereich';
    const workspace = 'Profil vor Antwort';
    const deutsch = 'https://w3id.org/iqb/p12/unit/';
    const mathematik = 'https://w3id.org/iqb/p11/unit/';
    let requested = false;
    let answered = false;
    let released = false;
    let letThrough: () => void = () => undefined;
    cy.window().then(win => {
      const token = win.localStorage.getItem('id_token') || '';
      cy.getUserIdAPI(token).then(user => {
        expect(user.status).to.equal(200);
        cy.createGroupAPI({ id: '', name: group }, token, {
          profiles: [{ id: deutsch, label: IqbProfile.DEu }, { id: mathematik, label: IqbProfile.MAu }]
        }).then(createdGroup => {
          expect(createdGroup.status).to.equal(201);
          cy.createWsAPI(String(createdGroup.body), { id: '', name: workspace }, token).then(createdWs => {
            expect(createdWs.status).to.equal(201);
            const wsId = String(createdWs.body);
            cy.setUsersOfWsAPI(wsId, [{ id: String(user.body.userId), access: AccessLevel.Admin }], token)
              .its('status').should('equal', 200);
            cy.updateWsSettingsAPI(wsId, { unitMDProfile: deutsch }, token)
              .its('status').should('equal', 200);
            cy.visitWs(workspace);
            cy.intercept('GET', new RegExp(`/api/workspaces/${wsId}$`), req => {
              requested = true;
              req.on('response', () => (released ? undefined : new Promise<void>(resolve => {
                letThrough = resolve;
              })));
              req.on('after:response', () => {
                answered = true;
              });
            });
            cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
            cy.get('[data-cy="workspace-edit-unit-settings"]').click();
            cy.get('[data-cy="edit-workspace-settings-select-unit-profile"]').click();
            cy.get('[data-cy="edit-workspace-settings-unit-profile"]')
              .contains(IqbProfile.MAu)
              .click()
              .then(() => {
                released = true;
                letThrough();
              });
            // Without the fix the held response arrives now; with it there is none to wait for. The page
            // applies a response before the answer to a request it sends after it, so only once that answer
            // is in does the select show what the late response left on it.
            cy.wrap(null).should(() => {
              if (requested) expect(answered, 'the held workspace response').to.equal(true);
            });
            cy.window().then(page => page.fetch('/assets/i18n/de.json', { cache: 'no-store' }));
            // The select's own text holds the labels of its options as well, so only the value is asked.
            cy.get('[data-cy="edit-workspace-settings-select-unit-profile"] .mat-mdc-select-value-text')
              .should('have.text', IqbProfile.MAu);
            saveWorkspaceSettings();
            cy.getWsNormalAPI(wsId, token).then(stored => {
              expect(stored.status).to.equal(200);
              expect(stored.body.settings.unitMDProfile).to.equal(mathematik);
            });
          });
        });
      });
    });
  });
});
