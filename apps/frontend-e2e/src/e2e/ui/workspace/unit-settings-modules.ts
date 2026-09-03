import {
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
  addStatus,
  clickIndexTabWsgAdmin,
  goToWsMenu,
  setModuleWithoutVerification,
  verifyModuleConfiguration
} from '../../../support/helpers';

describe('Workspace Settings & Verona Modules', () => {
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

  it('adds custom states to workspace', () => {
    cy.findAdminGroupSettings(baseGroup).click();
    clickIndexTabWsgAdmin('settings');
    addStatus('In Bearbeitung', 0);
    addStatus('Finale', 1);
    cy.get('[data-cy="wsg-admin-settings-save-button"]').click();
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

  it('allows switching between different player modules', () => {
    setModuleWithoutVerification(primaryWorkspace, 'Aspect', 'Speedtest', 'Schemer');
    setModuleWithoutVerification(primaryWorkspace, 'Aspect', 'Stars', 'Schemer');
  });

  it('saves default Verona editor selection and persists after reload', () => {
    cy.visitWs(secondaryWorkspace);
    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();

    cy.get('[data-cy="edit-workspace-settings-editor"]').find('mat-select').click();
    cy.get('mat-option').should('have.length.at.least', 1).first().click();

    cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();

    cy.visitWs(secondaryWorkspace);
    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();
    cy.get('[data-cy="edit-workspace-settings-editor"]').should('be.visible');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
  });

  it('hides a route tab (Begleitmaterial / notes) when unchecked in settings', () => {
    cy.visitWs(primaryWorkspace);

    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();

    cy.get('studio-lite-edit-workspace-settings mat-checkbox')
      .contains('Begleitmaterial')
      .click();

    cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();

    cy.get('[data-cy="workspace-routes-notes"]').should('not.exist');
  });

  it('restores route tab when checked back on in settings', () => {
    cy.visitWs(primaryWorkspace);

    cy.get('[data-cy="workspace-edit-unit-menu"]').click({ force: true });
    cy.get('[data-cy="workspace-edit-unit-settings"]').click();

    cy.get('studio-lite-edit-workspace-settings mat-checkbox')
      .contains('Begleitmaterial')
      .click();

    cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();

    cy.get('[data-cy="workspace-routes-notes"]').should('be.visible');
  });

  it('displays group management dialog', () => {
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-manage-unit-groups"]').click();
    cy.get('studio-lite-group-manage').should('exist');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.close);
    });
  });

  it('displays workspace user list dialog', () => {
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-user-list"]').click();
    cy.get('studio-lite-workspace-user-list').should('exist');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.close);
    });
  });
});
