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
          .find('input').click();
        cy.contains('mat-checkbox', json.workspace['review-show-comments'])
          .find('input')
          .click();
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
    login(Cypress.expose('username'), Cypress.expose('password'));
  });

  it('exports a review', () => {
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

  it('prints a review', () => {
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

  it('updates review unit selection', () => {
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

  it.skip('reflects updated units in review', () => {
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

  it('covers StartComponent and BookletConfigShowComponent', () => {
    cy.visit('/');
    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.contains('a', review).click();
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
    cy.get('.continue-button a').click();
  });

  it('covers UnitPlayerComponent and UnitNavComponent', () => {
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

  it('covers AddCommentButtonComponent and CommentDialogComponent', () => {
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
        cy.clickButton(json.dialogs.close);
      });
    });
  });

  it('covers UnitInfoComponent', () => {
    cy.get('studio-lite-unit-info').should('be.visible');

    // Open info panel
    cy.get('studio-lite-unit-info').within(() => {
      cy.contains('button', 'chevron_right').click();
      cy.get('.infoPanel').should('not.be.visible');
      cy.contains('button', 'chevron_left').click();
      cy.get('.infoPanel').should('be.visible');
      cy.get('.infoPanel h2').should('not.be.empty'); // Unit Key
    });
  });

  it('covers FinishComponent', () => {
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

  it('deletes a review', () => {
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
