import {
  AccessLevel,
  group1,
  newUser,
  ws1
} from '../../../support/testData';

import { createBasicSpecCy, deleteBasicSpecCy } from '../shared/basic.spec.cy';
import {
  clickIndexTabWsgAdmin,
  goToWsMenu,
  grantRemovePrivilegeAtWs,
  importExercise,
  login,
  logout,
  selectCheckBox
} from '../../../support/helpers';

describe('Unit Reviews', () => {
  before(() => {
    createBasicSpecCy();
  });

  after(() => {
    deleteBasicSpecCy();
    // cy.resetDb();
  });

  const review: string = 'Review1';
  it('imports test units', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
  });

  it('creates a review with selected units', () => {
    cy.visit('/');
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.get('[data-cy="workspace-review-menu-add-review-button"]').click();
    cy.translate(Cypress.env('locale')).then(json => {
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

  it('displays review in user reviews area', () => {
    cy.visit('/');
    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.get(`a:contains("${review}")`).should('exist');
    });
  });

  it('opens review and displays navigation', () => {
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

  it('allows other users to access review', () => {
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

  it('exports a review', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.contains('mat-row', review).click();
    cy.get('[data-cy="workspace-review-menu-export-review-button"]').click();
    cy.translate(Cypress.env('locale')).then(json => {
      cy.clickButton(json['unit-download'].dialog['ok-button-label']);
    });
    cy.get('[data-cy="workspace-review-close"]').click();
  });

  it('prints a review', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.contains('mat-row', review).click();
    cy.get('[data-cy="workspace-review-menu-print-review-button"]').click();
    cy.translate(Cypress.env('locale')).then(json => {
      cy.clickButton(json.workspace.print);
    });
    cy.get('[data-cy="workspace-review-close"]').click();
  });

  it('updates review unit selection', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.contains('mat-row', review).click();
    selectCheckBox('M6_AK0013');
    cy.translate(Cypress.env('locale')).then(json => {
      cy.get('studio-lite-save-changes').within(() => {
        cy.clickButton(json.workspace.save);
      });
    });
    cy.get('[data-cy="workspace-review-close"]').click();
  });

  it('reflects updated units in review', () => {
    cy.intercept('GET', '/api/reviews/*').as('getReview');
    cy.visit('/');
    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.get(`a:contains("${review}")`).click();
    });
    cy.reload();
    cy.wait('@getReview');
    cy.get('studio-lite-unit-nav').within(() => {
      cy.get('i:contains("chevron_left")').should('exist');
      cy.get('i:contains("chevron_right")').should('exist');
      cy.get('.mat-mdc-list-item:contains("3")').should('exist');
    });
  });

  it('deletes a review', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.contains('mat-row', review).click();
    cy.get('[data-cy="workspace-review-menu-delete-review-button"]').click();
    cy.translate(Cypress.env('locale')).then(json => {
      cy.clickButton(json.workspace.delete);
    });
    cy.get('[data-cy="workspace-review-close"]').click();
  });
});
