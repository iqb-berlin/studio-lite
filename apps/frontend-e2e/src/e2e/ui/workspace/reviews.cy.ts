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
  });

  const review: string = 'Review1';
  it('imports test units successfully into the workspace', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
  });

  it('allows an admin to create a new review with specific unit selection and configuration', () => {
    cy.visit('/');
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.get('[data-cy="workspace-review-menu-add-review-button"]').click();
    cy.translate(Cypress.expose('locale')).then(json => {
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

      // Set Review Configuration
      cy.get('studio-lite-review-config').within(() => {
        cy.contains('mat-checkbox', json.workspace['review-allow-comments'])
          .find('input').check({ force: true });
        cy.contains('mat-checkbox', json.workspace['review-show-comments'])
          .find('input').check({ force: true });
      });
      // Set Booklet Configuration
      cy.get('mat-expansion-panel-header').contains(json.workspace['booklet-settings']).click();
      cy.get('mat-form-field').contains(json['booklet-config'].unitScreenHeader.label).click();
      cy.get('mat-option').contains(json['booklet-config'].unitScreenHeader.WITH_UNIT_TITLE).click();

      cy.get('studio-lite-save-changes').within(() => {
        cy.clickButton(json.workspace.save);
      });
      cy.get('[data-cy="workspace-review-close"]').click();
    });
  });

  it('displays the newly created review in the dashboard reviews section', () => {
    cy.visit('/');
    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.get(`a:contains("${review}")`).should('exist');
    });
  });

  it('opens the review successfully and displays the unit navigation list', () => {
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

  it('permits users with basic access to view and enter the review', () => {
    cy.findAdminGroupSettings(group1).click();
    clickIndexTabWsgAdmin('workspaces');
    grantRemovePrivilegeAtWs([newUser.username], ws1, [AccessLevel.Basic]);
    logout();
    login(newUser.username, newUser.password);
    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.get(`a:contains("${review}")`).should('exist');
    });
    logout();
    login(Cypress.expose('username'), Cypress.expose('password'));
  });

  it('exports the review configuration via the admin menu', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.contains('mat-row', review).click();
    cy.get('[data-cy="workspace-review-menu-export-review-button"]').click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickButton(json['unit-download'].dialog['ok-button-label']);
    });
    cy.get('[data-cy="workspace-review-close"]').click();
  });

  it('prints the review summary via the admin menu', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.contains('mat-row', review).click();
    cy.get('[data-cy="workspace-review-menu-print-review-button"]').click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickButton(json.workspace.print);
    });
    cy.get('[data-cy="workspace-review-close"]').click();
  });

  it('allows modifying the unit selection for an existing review', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.contains('mat-row', review).click();
    cy.intercept('PATCH', '/api/workspaces/*/reviews/*').as('updateReview');
    selectCheckBox('M6_AK0013');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('studio-lite-save-changes').within(() => {
        cy.clickButton(json.workspace.save);
      });
    });
    cy.wait('@updateReview');
    cy.get('[data-cy="workspace-review-close"]').click();
  });

  it.skip('reflects the updated unit count when the review is opened', () => {
    cy.intercept('GET', '/api/reviews/*').as('getReview');
    cy.visit('/');
    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.get(`a:contains("${review}")`).click();
    });
    cy.wait('@getReview');
    cy.reload();
    cy.wait('@getReview');
    cy.get('studio-lite-unit-nav').within(() => {
      cy.get('i:contains("chevron_left")').should('exist');
      cy.get('i:contains("chevron_right")').should('exist');
      cy.contains('.mat-mdc-list-item', '3').should('exist');
    });
  });

  it('displays correct review metadata and booklet settings on the start page', () => {
    cy.visit('/');
    cy.get('studio-lite-user-reviews-area').within(() => {
      // Ensure the link opens in the same window (prevents test failures if target="_blank" is used)
      cy.contains('a', review).invoke('removeAttr', 'target').click();
    });

    // Check StartComponent (start-page)
    cy.get('.start-page').should('be.visible');
    cy.get('.start-data h1').should('contain', review);
    cy.get('.start-data h2').should('contain', ws1);

    // Check BookletConfigShowComponent
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('mat-expansion-panel-header').click();
      cy.get('studio-lite-booklet-config-show').should('be.visible');
      // Verify the configuration we set earlier
      cy.get('studio-lite-booklet-config-show')
        .contains(json['booklet-config'].unitScreenHeader.WITH_UNIT_TITLE).should('exist');
    });

    // Start the review
    cy.get('.continue-button a').invoke('removeAttr', 'target').click();
    cy.get('studio-lite-unit-player iframe').should('be.visible');
  });

  it('loads the unit player and allows navigation through the review sequence', () => {
    // We should now be in the first unit
    cy.url().should('include', '/u/0');

    // Check UnitNavComponent in the header
    cy.get('studio-lite-unit-nav').should('be.visible');
    cy.get('studio-lite-unit-nav').within(() => {
      cy.get('i:contains("chevron_left")').should('exist');
      cy.get('i:contains("chevron_right")').should('exist');
    });

    // Check UnitPlayerComponent (iframe)
    cy.get('studio-lite-unit-player iframe').should('be.visible');

    // Navigate to next unit
    cy.get('studio-lite-unit-nav').within(() => {
      cy.get('i:contains("chevron_right")').click({ force: true });
    });
    cy.url().should('include', '/u/1');
  });

  it('allows users to submit and view comments on units during the review', () => {
    cy.get('studio-lite-add-comment-button').should('be.visible');
    cy.get('studio-lite-add-comment-button button').click();
    // Check CommentDialogComponent
    cy.get('mat-dialog-container').should('be.visible');
    cy.get('mat-dialog-container').within(() => {
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.contains(json.review.comment).should('exist');
        // Interaction with studio-lite-comments (inside the dialog)
        cy.get('tiptap-editor').type('Test comment from Review');
        cy.contains('button', 'send').click({ force: true });
        // The dialog remains open because we enabled showOthersComments
        cy.get('button').contains(json.dialogs.close).should('exist').click({ force: true });
      });
    });
    cy.get('mat-dialog-container').should('not.exist');
  });

  it('displays unit technical details in the expandable info panel', () => {
    cy.get('studio-lite-unit-info').should('be.visible');

    // Open info panel
    cy.get('studio-lite-unit-info').within(() => {
      cy.contains('button', 'chevron_right').click();
      cy.wait(500); // Wait for width transition
      cy.get('.infoPanel').should('not.be.visible');
      cy.contains('button', 'chevron_left').click();
      cy.wait(500); // Wait for width transition
      cy.get('.infoPanel').should('be.visible');
      cy.get('.infoPanel h2').should('not.be.empty'); // Unit Key
    });
  });

  it('shows the finish page upon completion and allows returning to the review', () => {
    // Navigate to the end
    cy.get('studio-lite-unit-nav').within(() => {
      cy.get('.mat-mdc-list-item').eq(-1).click();
    });

    // Should be in FinishComponent (end page)
    cy.url().should('include', '/end');
    cy.get('.finish-page').should('be.visible');
    cy.get('.finish-data h1').should('contain', review);

    // Test backwards button
    cy.get('.backwards-button a').click();
    cy.url().should('include', '/u/2');
  });

  it('allows an admin to permanently delete a review', () => {
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-review-admin"]').click();
    cy.contains('mat-row', review).click();
    cy.get('[data-cy="workspace-review-menu-delete-review-button"]').click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickButton(json.workspace.delete);
    });
    cy.get('[data-cy="workspace-review-close"]').click();
  });
});
