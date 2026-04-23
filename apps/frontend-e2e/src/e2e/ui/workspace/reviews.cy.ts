import {
  AccessLevel,
  group1,
  newUser,
  ws1
} from '../../../support/testData';

import { createBasicSpecCy, deleteBasicSpecCy } from '../shared/basic.spec.cy';
import {
  clickIndexTabWorkspace,
  clickIndexTabWsgAdmin,
  grantRemovePrivilegeAtWs,
  importExercise,
  login,
  loginWithUser,
  logout,
  createReview,
  openReview,
  verifyReviewStartPage,
  startReview,
  exportReview,
  printReview,
  deleteReview,
  modifyReviewUnits,
  goToReviewAdmin
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
    cy.contains('M6_AK0011', { timeout: 15000 }).should('exist');
  });

  it('allows an admin to create a new review with specific unit selection and configuration', () => {
    cy.visitWs(ws1);
    goToReviewAdmin();
    createReview(review, ['M6_AK0011', 'M6_AK0012']);

    // Re-configure to set booklet and review settings
    goToReviewAdmin();
    cy.contains('mat-row', review).click();

    cy.translate(Cypress.expose('locale')).then(json => {
      // Set Review Configuration
      cy.get('studio-lite-review-config').within(() => {
        cy.contains('mat-checkbox', json.workspace['review-allow-comments'])
          .find('input').check({ force: true });
        cy.contains('mat-checkbox', json.workspace['review-show-comments'])
          .find('input').check({ force: true });
      });

      // Set Booklet Configuration
      cy.get('mat-expansion-panel-header').contains(json.workspace['booklet-settings']).click();

      // Paging Mode
      cy.get('mat-form-field').contains(json['booklet-config'].pagingMode.label).click();
      cy.get('mat-option').contains(json['booklet-config'].pagingMode.buttons).click();

      // Page Navigation Buttons
      cy.get('mat-form-field').contains(json['booklet-config'].pageNaviButtons.label).click();
      cy.get('mat-option').contains(json['booklet-config'].pageNaviButtons.SEPARATE_BOTTOM).click();

      // Unit Navigation Buttons
      cy.get('mat-form-field').contains(json['booklet-config'].unitNaviButtons.label).click();
      cy.get('mat-option').contains(json['booklet-config'].unitNaviButtons.FULL).click();

      // Controller Design
      cy.get('mat-form-field').contains(json['booklet-config'].controllerDesign.label).click();
      cy.get('mat-option').contains(json['booklet-config'].controllerDesign['2018']).click();

      // Unit Screen Header
      cy.get('mat-form-field').contains(json['booklet-config'].unitScreenHeader.label).click();
      cy.get('mat-option').contains(json['booklet-config'].unitScreenHeader.WITH_UNIT_TITLE).click();

      // Unit Title
      cy.get('mat-form-field').contains(json['booklet-config'].unitTitle.label).click();
      cy.get('mat-option').contains(json['booklet-config'].unitTitle.ON).click();

      cy.get('studio-lite-save-changes').within(() => {
        cy.get('button').contains(json.workspace.save).click();
      });
      cy.get('[data-cy="workspace-review-close"]').click();
    });
  });

  it('displays the newly created review in the dashboard reviews section', () => {
    cy.visit('/');
    cy.get('studio-lite-user-reviews-area', { timeout: 20000 }).should('be.visible').within(() => {
      cy.get(`a:contains("${review}")`).should('exist');
    });
  });

  it('opens the review successfully and displays the unit navigation list', () => {
    cy.visit('/');
    openReview(review);
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
    goToReviewAdmin();
    exportReview(review);
    cy.get('[data-cy="workspace-review-close"]').click();
  });

  it('prints the review summary via the admin menu', () => {
    cy.visitWs(ws1);
    goToReviewAdmin();
    printReview(review);
    cy.get('[data-cy="workspace-review-close"]').click();
  });

  it('allows modifying the unit selection for an existing review', () => {
    cy.visitWs(ws1);
    goToReviewAdmin();
    modifyReviewUnits(review, ['M6_AK0013']);
  });

  it.skip('reflects the updated unit count when the review is opened', () => {
    cy.intercept('GET', '/api/reviews/*').as('getReview');
    cy.visit('/');
    openReview(review);
    cy.wait('@getReview');
    cy.get('studio-lite-unit-nav').within(() => {
      cy.get('.mat-mdc-list-item:contains("3")').should('exist');
    });
  });

  it('verifies metadata, booklet settings, and review player navigation', () => {
    cy.visit('/');

    openReview(review);
    verifyReviewStartPage(review, ws1);

    // Check BookletConfigShowComponent
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('mat-expansion-panel-header').click();
      cy.get('studio-lite-booklet-config-show').should('be.visible');
      // Verify the configuration we set earlier
      cy.get('studio-lite-booklet-config-show').within(() => {
        cy.contains(json['booklet-config'].pagingMode.label).should('exist');
        cy.contains(json['booklet-config'].pagingMode.buttons).should('exist');

        cy.contains(json['booklet-config'].pageNaviButtons.label).should('exist');
        cy.contains(json['booklet-config'].pageNaviButtons.SEPARATE_BOTTOM).should('exist');

        cy.contains(json['booklet-config'].unitNaviButtons.label).should('exist');
        cy.contains(json['booklet-config'].unitNaviButtons.FULL).should('exist');

        cy.contains(json['booklet-config'].controllerDesign.label).should('exist');
        cy.contains(json['booklet-config'].controllerDesign['2018']).should('exist');

        cy.contains(json['booklet-config'].unitScreenHeader.label).should('exist');
        cy.contains(json['booklet-config'].unitScreenHeader.WITH_UNIT_TITLE).should('exist');

        cy.contains(json['booklet-config'].unitTitle.label).should('exist');
        cy.contains(json['booklet-config'].unitTitle.ON).should('exist');
      });
    });

    startReview();
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
        cy.get('tiptap-editor').type('Test comment from Review');
        cy.contains('button', 'send').click({ force: true });
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
      cy.wait(500);
      cy.get('.infoPanel').should('not.be.visible');
      cy.contains('button', 'chevron_left').click();
      cy.wait(500);
      cy.get('.infoPanel').should('be.visible');
      cy.get('.infoPanel h2').should('not.be.empty');
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

    // Backwards button
    cy.get('.backwards-button a').click();
    cy.url().should('include', '/u/2');
  });

  it('shows a dot for new comments in the workspace unit list: ', () => {
    // do not show
    cy.visitWs(ws1);
    cy.get('mat-row').contains('M6_AK0012').parents('mat-row').within(() => {
      cy.get('.new-comments').should('have.css', 'opacity', '1');
    });

    cy.get('mat-row').contains('M6_AK0012').click();
    clickIndexTabWorkspace('comments');
    cy.get('studio-lite-comments', { timeout: 10000 }).should('be.visible');
    clickIndexTabWorkspace('properties');
  });

  it('clears the new comment dot after viewing comments as different users', () => {
    loginWithUser(newUser.username, newUser.password);
    cy.visitWs(ws1);
    cy.get('mat-row').contains('M6_AK0012').parents('mat-row').within(() => {
      cy.get('.new-comments').should('have.css', 'opacity', '1');
    });
    cy.get('mat-row').contains('M6_AK0012').click();
    clickIndexTabWorkspace('comments');
    cy.get('studio-lite-comments', { timeout: 15000 }).should('be.visible');
    clickIndexTabWorkspace('properties');

    cy.get('mat-row').contains('M6_AK0012').parents('mat-row').within(() => {
      cy.get('.new-comments', { timeout: 15000 }).should('have.css', 'opacity', '0');
    });
  });

  it('allows an admin to permanently delete a review', () => {
    loginWithUser(Cypress.expose('username'), Cypress.expose('password'));
    cy.visitWs(ws1);
    goToReviewAdmin();
    deleteReview(review);
    cy.get('[data-cy="workspace-review-close"]').click();
    cy.contains('mat-row', review).should('not.exist');
  });
});
