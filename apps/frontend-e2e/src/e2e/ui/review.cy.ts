import {
  AccessLevel,
  group1,
  newUser,
  ws1
} from '../../support/testData';
import {
  clickIndexTabWsgAdmin,
  goToWsMenu,
  grantRemovePrivilegeAtWs,
  importExercise,
  login,
  logout,
  selectCheckBox
} from '../../support/util';
import { createBasicSpecCy, deleteBasicSpecCy } from './shared/basic.spec.cy';

describe('Review:', () => {
  before(() => {
    createBasicSpecCy();
  });

  after(() => {
    deleteBasicSpecCy();
    // cy.resetDb();
  });

  const review:string = 'Review1';
  it('should import units', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
  });

  it('should add a review', () => {
    cy.visit('/');
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.get('[data-cy="workspace-review-menu-add-review-button"]').click();
    cy.translate('de').then(json => {
      cy.get(`input[placeholder="${json.workspace['new-review-name']}"]`)
        .should('exist')
        .clear()
        .type(review);
      cy.get('.mat-mdc-dialog-component-host > .mat-mdc-dialog-actions').within(
        () => {
          cy.clickButton(json.workspace.save);
        }
      );
      selectCheckBox('M6_AK0011');
      selectCheckBox('M6_AK0012');
      cy.get('studio-lite-save-changes').within(() => {
        cy.clickButton(json.workspace.save);
      });
      cy.get('[data-cy="workspace-review-close"]').click();
    });
  });

  it('should check that review exists', () => {
    cy.visit('/');
    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.get(`a:contains("${review}")`).should('exist');
    });
  });

  it('should open a review and assert that nav bar exists', () => {
    cy.visit('/');
    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.get(`a:contains("${review}")`).click();
    });
    cy.get('.start-data').should('exist');
    cy.get('studio-lite-unit-nav').within(() => {
      cy.get('i:contains("chevron_left")').should('exist');
      cy.get('i:contains("chevron_right")').should('exist');
      cy.get('.mat-mdc-list-item:contains("1")').should('exist');
    });
  });

  it('should other user access to the review', () => {
    cy.findAdminGroupSettings(group1).click();
    clickIndexTabWsgAdmin('workspaces');
    grantRemovePrivilegeAtWs([newUser.username], ws1, [AccessLevel.Basic]);
    logout();
    login(newUser.username, newUser.password);
    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.get(`a:contains("${review}")`).should('exist');
    });
    logout();
    login(Cypress.env('username'), Cypress.env('password'));
  });

  it('should export a review', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.contains('mat-row', review).click();
    cy.get('[data-cy="workspace-review-menu-export-review-button"]').click();
    cy.translate('de').then(json => {
      cy.clickButton(json['unit-download'].dialog['ok-button-label']);
    });
    cy.get('[data-cy="workspace-review-close"]').click();
  });

  it('should print a review', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.contains('mat-row', review).click();
    cy.get('[data-cy="workspace-review-menu-print-review-button"]').click();
    cy.translate('de').then(json => {
      cy.clickButton(json.workspace.print);
    });
    cy.get('[data-cy="workspace-review-close"]').click();
  });

  it('should modify a review', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.contains('mat-row', review).click();
    selectCheckBox('M6_AK0013');
    cy.translate('de').then(json => {
      cy.get('studio-lite-save-changes').within(() => {
        cy.clickButton(json.workspace.save);
      });
    });
    cy.get('[data-cy="workspace-review-close"]').click();
  });

  it('should check that the review was modified', () => {
    cy.visit('/');
    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.get(`a:contains("${review}")`).click();
    });
    cy.reload();
    cy.wait(1000);
    cy.get('studio-lite-unit-nav').within(() => {
      cy.get('i:contains("chevron_left")').should('exist');
      cy.get('i:contains("chevron_right")').should('exist');
      cy.get('.mat-mdc-list-item:contains("3")').should('exist');
    });
  });

  it('should delete the review', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.contains('mat-row', review).click();
    cy.get('[data-cy="workspace-review-menu-delete-review-button"]').click();
    cy.translate('de').then(json => {
      cy.clickButton(json.workspace.delete);
    });
    cy.get('[data-cy="workspace-review-close"]').click();
  });
});
