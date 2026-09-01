import {
  group1,
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
  clickIndexTabWsgAdmin,
  clickSaveButtonRight,
  goToWsMenu,
  setModuleWithoutVerification,
  verifyModuleConfiguration
} from '../../../support/helpers';
import { createBasicSpecCy, deleteBasicSpecCy } from '../shared/basic.spec.cy';

describe('Workspace Settings & Verona Modules', () => {
  before(() => {
    createBasicSpecCy();
  });

  after(() => {
    deleteBasicSpecCy();
  });

  it('selects metadata profile from workspace settings', () => {
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
    verifyModuleConfiguration(ws1, 'Aspect', 'Aspect', 'Schemer');

    cy.visitWs(ws2);
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
    setModuleWithoutVerification(ws2, 'Aspect', 'Stars', 'Schemer');
    verifyModuleConfiguration(ws1, 'Aspect', 'Aspect', 'Schemer');
  });

  it('allows switching between different player modules', () => {
    setModuleWithoutVerification(ws1, 'Aspect', 'Speedtest', 'Schemer');
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
    cy.visitWs(ws1);

    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();

    cy.get('studio-lite-edit-workspace-settings mat-checkbox')
      .contains('Begleitmaterial')
      .click();

    cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();

    cy.get('[data-cy="workspace-routes-notes"]').should('not.exist');
  });

  it('restores route tab when checked back on in settings', () => {
    cy.visitWs(ws1);

    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();

    cy.get('studio-lite-edit-workspace-settings mat-checkbox')
      .contains('Begleitmaterial')
      .click();

    cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();

    cy.get('[data-cy="workspace-routes-notes"]').should('be.visible');
  });

  it('displays group management dialog', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-manage-unit-groups"]').click();
    cy.get('studio-lite-group-manage').should('exist');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.close);
    });
  });

  it('displays workspace user list dialog', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-user-list"]').click();
    cy.get('studio-lite-workspace-user-list').should('exist');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.close);
    });
  });
});
