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
  goToWsMenu,
  saveWorkspaceSettings,
  setModuleWithoutVerification,
  setRouteVisibility,
  verifyModuleConfiguration
} from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

const deutsch = 'https://w3id.org/iqb/p12/unit/';
const mathematik = 'https://w3id.org/iqb/p11/unit/';

/**
 * A group offering the unit profiles Deutsch and Mathematik, and a workspace in it with Deutsch, which
 * the logged-in user administers.
 */
function createWorkspaceWithUnitProfile(
  group: string,
  workspace: string
): Cypress.Chainable<{ wsId: string; token: string }> {
  const created = { wsId: '', token: '' };
  cy.window().then(win => {
    created.token = win.localStorage.getItem('id_token') || '';
    cy.getUserIdAPI(created.token).then(user => {
      expect(user.status, 'id of the user').to.equal(200);
      const profiles = [{ id: deutsch, label: IqbProfile.DEu }, { id: mathematik, label: IqbProfile.MAu }];
      cy.createGroupAPI({ id: '', name: group }, created.token, { profiles }).then(createdGroup => {
        expect(createdGroup.status, group).to.equal(201);
        cy.createWsAPI(String(createdGroup.body), { id: '', name: workspace }, created.token).then(createdWs => {
          expect(createdWs.status, workspace).to.equal(201);
          created.wsId = String(createdWs.body);
          cy.setUsersOfWsAPI(created.wsId, [{ id: String(user.body.userId), access: AccessLevel.Admin }], created.token)
            .its('status').should('equal', 200);
          cy.updateWsSettingsAPI(created.wsId, { unitMDProfile: deutsch }, created.token)
            .its('status').should('equal', 200);
        });
      });
    });
  });
  return cy.then(() => created);
}

function openWorkspaceSettings(): void {
  goToWsMenu();
  cy.get('[data-cy="workspace-edit-unit-settings"]').click();
}

/** The select's own text holds the labels of its options as well, so only its value is read. */
function shownUnitProfile(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('[data-cy="edit-workspace-settings-select-unit-profile"] .mat-mdc-select-value-text');
}

function storedUnitProfile(wsId: string, token: string): Cypress.Chainable<string> {
  return cy.getWsNormalAPI(wsId, token).then(stored => {
    expect(stored.status, 'stored workspace').to.equal(200);
    return stored.body.settings.unitMDProfile as string;
  });
}

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
    const workspace = 'Profil vor Antwort';
    let requested = 0;
    let answered = 0;
    let holding = true;
    const heldBack: Array<() => void> = [];
    createWorkspaceWithUnitProfile('Gruppe Profil vor Antwort', workspace).then(({ wsId, token }) => {
      cy.visitWs(workspace);
      cy.intercept('GET', new RegExp(`/api/workspaces/${wsId}$`), req => {
        requested += 1;
        req.on('response', () => (holding ? new Promise<void>(resolve => {
          heldBack.push(resolve);
        }) : undefined));
        req.on('after:response', () => {
          answered += 1;
        });
      });
      openWorkspaceSettings();
      // The menu loads the workspace before it opens the dialog: that request is let through. Without the
      // fix there is none, the dialog opens at once, and its own request stays held until the choice.
      cy.get('body')
        .should($body => {
          expect($body.find('mat-dialog-container').length + heldBack.length, 'an open dialog or a held request')
            .to.be.greaterThan(0);
        })
        .then($body => {
          if (!$body.find('mat-dialog-container').length) heldBack.shift()?.();
        });
      cy.get('[data-cy="edit-workspace-settings-select-unit-profile"]').click();
      cy.get('[data-cy="edit-workspace-settings-unit-profile"]')
        .contains(IqbProfile.MAu)
        .click()
        .then(() => {
          holding = false;
          heldBack.splice(0).forEach(letThrough => letThrough());
        });
      // Without the fix the held response arrives now; with it there is none to wait for. The page
      // applies a response before the answer to a request it sends after it, so only once that answer
      // is in does the select show what the late response left on it.
      cy.wrap(null).should(() => {
        expect(answered, 'answered workspace requests').to.equal(requested);
      });
      cy.window().then(page => page.fetch('/assets/i18n/de.json', { cache: 'no-store' }));
      shownUnitProfile().should('have.text', IqbProfile.MAu);
      saveWorkspaceSettings();
      storedUnitProfile(wsId, token).should('equal', mathematik);
    });
  });

  // The workspace view keeps the settings it loaded when the workspace was opened. The dialog showed
  // and saved those, even when the workspace had been changed since, for example by a group admin (#2138).
  it('shows and keeps a unit profile changed elsewhere since the workspace was opened (#2138)', () => {
    const workspace = 'Profil anderswo geändert';
    createWorkspaceWithUnitProfile('Gruppe Profil anderswo geändert', workspace).then(({ wsId, token }) => {
      cy.visitWs(workspace);
      cy.updateWsSettingsAPI(wsId, { unitMDProfile: mathematik }, token)
        .its('status').should('equal', 200);
      openWorkspaceSettings();
      shownUnitProfile().should('have.text', IqbProfile.MAu);
      saveWorkspaceSettings();
      storedUnitProfile(wsId, token).should('equal', mathematik);
    });
  });
});
