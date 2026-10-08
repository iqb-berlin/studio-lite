import { Interception } from 'cypress/types/net-stubbing';
import {
  AccessLevel,
  baseGroup,
  standardUser,
  reviewTestNames,
  primaryWorkspace
} from '../../../support/testData';

import {
  clickIndexTabWorkspace,
  clickIndexTabWsgAdmin,
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
  goToReviewAdmin,
  saveReviewConfig,
  selectReviewInAdmin,
  waitForSuccess,
  setReviewPassword,
  copyReviewLink,
  loginToReviewLink,
  logoutFromReviewLink,
  enableReviewComments
} from '../../../support/helpers';
import { grantRemovePrivilegeAtWs } from '../../../support/helpers/group-admin';

describe('Unit Reviews', () => {
  const review: string = reviewTestNames.reviewName;

  it('allows an admin to create a new review with specific unit selection and configuration', () => {
    cy.visitWs(primaryWorkspace);
    goToReviewAdmin();
    createReview(review, ['M6_AK0011', 'M6_AK0012']);

    // Re-configure to set booklet and review settings
    goToReviewAdmin();
    selectReviewInAdmin(review);

    enableReviewComments();
    cy.translate(Cypress.expose('locale')).then(json => {
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

      saveReviewConfig();
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
    cy.findAdminGroupSettings(baseGroup).click();
    clickIndexTabWsgAdmin('workspaces');
    grantRemovePrivilegeAtWs([standardUser.username], primaryWorkspace, [AccessLevel.Basic]);
    logout();
    login(standardUser.username, standardUser.password);
    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.get(`a:contains("${review}")`).should('exist');
    });
    logout();
    login(Cypress.expose('username'), Cypress.expose('password'));
  });

  it('exports the review configuration via the admin menu', () => {
    cy.visitWs(primaryWorkspace);
    goToReviewAdmin();
    exportReview(review);
    cy.get('[data-cy="workspace-review-close"]').click();
  });

  it('prints the review summary via the admin menu', () => {
    cy.visitWs(primaryWorkspace);
    goToReviewAdmin();
    printReview(review);
    cy.get('[data-cy="workspace-review-close"]').click();
  });

  it('allows modifying the unit selection for an existing review', () => {
    cy.visitWs(primaryWorkspace);
    goToReviewAdmin();
    modifyReviewUnits(review, ['M6_AK0013']);
  });

  it('reflects the updated unit count when the review is opened', () => {
    cy.intercept('GET', '/api/reviews/*').as('getReview');
    cy.visit('/');
    openReview(review);
    waitForSuccess('@getReview');
    cy.get('studio-lite-unit-nav', { timeout: 15000 }).within(() => {
      cy.get('.mat-mdc-list-item:contains("3")', { timeout: 10000 }).should('exist');
    });
  });

  it('verifies metadata, booklet settings, and review player navigation', () => {
    cy.visit('/');

    openReview(review);
    verifyReviewStartPage(review, primaryWorkspace);

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
    cy.visit('/');
    openReview(review);
    startReview();
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
    cy.intercept('GET', '/api/reviews/*').as('getReview');
    cy.intercept('GET', '/api/reviews/*/units/*/definition').as('getUnitDefinition');
    cy.intercept('POST', '/api/reviews/*/units/*/comments').as('postReviewComment');

    cy.visit('/');
    openReview(review);
    waitForSuccess('@getReview');
    startReview();
    waitForSuccess('@getUnitDefinition');

    cy.get('studio-lite-add-comment-button', { timeout: 15000 }).should('be.visible');
    cy.get('studio-lite-add-comment-button button').click();

    // Check CommentDialogComponent
    cy.get('mat-dialog-container').should('be.visible');
    cy.get('mat-dialog-container').within(() => {
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.contains(json.review.comment).should('exist');
        cy.get('tiptap-editor').type('Test comment from Review');
        cy.contains('button', 'send').click({ force: true });
        waitForSuccess('@postReviewComment');
        cy.get('button').contains(json.dialogs.close).should('exist').click({ force: true });
      });
    });
    cy.get('mat-dialog-container').should('not.exist');
  });

  it('displays unit technical details in the expandable info panel', () => {
    cy.visit('/');
    openReview(review);
    startReview();
    cy.get('studio-lite-unit-info', { timeout: 15000 }).should('be.visible');

    // Open info panel
    cy.get('studio-lite-unit-info').within(() => {
      cy.contains('button', 'chevron_right').click();
      cy.get('.infoPanel').should('not.be.visible');
      cy.contains('button', 'chevron_left').click();
      cy.get('.infoPanel').should('be.visible');
      cy.get('.infoPanel h2').should('not.be.empty');
    });
  });

  it('shows the finish page upon completion and allows returning to the review', () => {
    cy.intercept('GET', '/api/reviews/*').as('getReview');
    cy.visit('/');
    openReview(review);
    waitForSuccess('@getReview');
    startReview();

    // Navigate to the end (click the finish page option container at the end of the unit nav list)
    cy.get('studio-lite-unit-nav').within(() => {
      cy.get('.unit-list > div').last().click({ force: true });
    });

    // Should be in FinishComponent (end page)
    cy.get('.finish-page', { timeout: 15000 }).should('be.visible');
    cy.url().should('include', '/end');
    cy.get('.finish-data h1').should('contain', review);

    // Backwards button
    cy.get('.backwards-button a').click();
    cy.url().should('include', '/u/2');
  });

  it('shows no dot for comments inserted by himself in the workspace unit list: ', () => {
    cy.visitWs(primaryWorkspace);
    cy.get('mat-row').contains('M6_AK0012').parents('mat-row').within(() => {
      cy.get('.new-comments').should('have.css', 'opacity', '0');
    });

    cy.get('mat-row').contains('M6_AK0012').click();
    clickIndexTabWorkspace('comments');
    cy.get('studio-lite-comments', { timeout: 10000 }).should('be.visible');
    clickIndexTabWorkspace('properties');
  });

  it('clears the new comment dot after viewing comments as different users', () => {
    // Ensure an unread comment from another user (fadmin) exists on the unit
    cy.visitWs(primaryWorkspace);
    cy.get('mat-row').contains('M6_AK0012').click();
    clickIndexTabWorkspace('comments');
    cy.intercept('POST', '/api/workspaces/*/units/*/comments').as('createWorkspaceComment');
    cy.get('tiptap-editor').type('Unread comment for dot test');
    cy.contains('button', 'send').click();
    waitForSuccess('@createWorkspaceComment');
    clickIndexTabWorkspace('properties');

    loginWithUser(standardUser.username, standardUser.password);
    cy.visitWs(primaryWorkspace);
    cy.intercept('PATCH', '/api/workspaces/*/units/*/comments').as('markCommentsSeen');
    cy.get('mat-row').contains('M6_AK0012').parents('mat-row').within(() => {
      cy.get('.new-comments').should('have.css', 'opacity', '1');
    });
    // Wait on the request that actually stores the seen-state instead of a
    // fixed 100ms: under CI load the PATCH regularly took longer, the tab
    // switch happened first, and the dot legitimately stayed on (#1597).
    cy.get('mat-row').contains('M6_AK0012').click();
    clickIndexTabWorkspace('comments');
    cy.get('studio-lite-comments', { timeout: 15000 }).should('be.visible');
    waitForSuccess('@markCommentsSeen');
    clickIndexTabWorkspace('properties');
    cy.get('mat-row').contains('M6_AK0012').parents('mat-row').within(() => {
      cy.get('.new-comments', { timeout: 15000 }).should('have.css', 'opacity', '0');
    });
  });

  it('grants anonymous access to a password-protected review link', () => {
    loginWithUser(Cypress.expose('username'), Cypress.expose('password'));
    cy.visitWs(primaryWorkspace);
    goToReviewAdmin();
    selectReviewInAdmin(review).then(({ link: reviewLink }) => {
      setReviewPassword('rev-1234');
      cy.get('[data-cy="workspace-review-close"]').click();
      logout();
      // open the shared link as anonymous visitor and log in with the password
      loginToReviewLink(`/#/${reviewLink}`, 'rev-1234');

      // the review must open and its units must be playable
      openReview(review);
      cy.get('.start-data').should('exist');
      startReview();
      cy.url().should('include', '/u/0');

      // drop the anonymous review session so subsequent tests find the
      // regular logged-in state they expect
      cy.window().then(win => {
        win.localStorage.removeItem('id_token');
        win.localStorage.removeItem('refresh_token');
      });
      login(Cypress.expose('username'), Cypress.expose('password'));
    });
  });

  const codingReviewName = 'CodingReviewTest';

  it('creates a review with coding (Kodierung) enabled', () => {
    loginWithUser(Cypress.expose('username'), Cypress.expose('password'));
    cy.visitWs(primaryWorkspace);
    goToReviewAdmin();
    createReview(codingReviewName, ['M6_AK0011', 'M6_AK0012']);

    goToReviewAdmin();
    selectReviewInAdmin(codingReviewName);

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('studio-lite-review-config').within(() => {
        cy.contains('mat-checkbox', json.workspace['review-show-codes'])
          .find('input')
          .check({ force: true });
      });

      saveReviewConfig();
      cy.get('[data-cy="workspace-review-close"]').click();
    });
  });

  it('opens the coding review, and click the continue button, and wait until the content with coding', () => {
    cy.visit('/');
    openReview(codingReviewName);
    cy.get('.start-data').should('exist');
    cy.get('studio-lite-unit-nav').within(() => {
      cy.get('i:contains("chevron_left")').should('exist');
      cy.get('i:contains("chevron_right")').should('exist');
      cy.get('.mat-mdc-list-item:contains("1")').should('exist');
    });
    // Click continue button
    cy.get('studio-lite-start').within(() => {
      cy.get('i:contains("chevron_right")').click({ force: true });
    });
    cy.get('studio-lite-unit-print-coding').should('exist');
  });

  it('allows an admin to permanently delete a review', () => {
    loginWithUser(Cypress.expose('username'), Cypress.expose('password'));
    cy.visitWs(primaryWorkspace);
    goToReviewAdmin();
    deleteReview(review);
    cy.get('[data-cy="workspace-review-close"]').click();
    cy.contains('mat-row', review).should('not.exist');
  });

  // Externals reach a review through the link the copy button hands out, with the review's password
  // and without an account of their own. Mocha runs this block after the tests above, with a review
  // of its own (#1726); its tests build on each other.
  describe('#1783 the review link for external visitors', () => {
    const externalReview = 'ExternalReview';
    const password = 'ext-1234';
    const visitorName = 'Externe Person';
    const commentText = 'Kommentar von extern';
    let copiedLink = '';
    // Where the comment went, so that after() can take it away again: comments belong to the unit,
    // not to the review, and would outlive it in the workspace
    let commentPath = '';
    let commentUnitId = '';

    /** Opens the first unit of the review and its comment dialog, as the external visitor */
    const openCommentDialog = (): void => {
      cy.intercept('GET', '/api/reviews/*/units/*/definition').as('getExternalUnitDefinition');
      cy.visit('/');
      openReview(externalReview);
      startReview();
      waitForSuccess('@getExternalUnitDefinition');
      cy.get('studio-lite-add-comment-button button').should('be.enabled').click();
      cy.get('mat-dialog-container').should('be.visible');
    };

    before(() => {
      cy.visitWs(primaryWorkspace);
      goToReviewAdmin();
      createReview(externalReview, ['M6_AK0011', 'M6_AK0012']);
      goToReviewAdmin();
      selectReviewInAdmin(externalReview);
      enableReviewComments();
      saveReviewConfig();
      cy.get('[data-cy="workspace-review-close"]').click();
    });

    after(() => {
      // Whatever state a failed test left: back to the admin, as the specs after this one expect
      cy.window().then(win => {
        win.localStorage.removeItem('id_token');
        win.localStorage.removeItem('refresh_token');
        win.localStorage.removeItem('iqb-studio-user-name-for-review-comments');
      });
      login(Cypress.expose('username'), Cypress.expose('password'));
      cy.window().then(win => {
        if (!commentPath) return;
        cy.request({
          method: 'DELETE',
          url: commentPath,
          headers: {
            'app-version': Cypress.expose('version'),
            authorization: `bearer ${win.localStorage.getItem('id_token')}`
          }
        });
      });
      cy.visitWs(primaryWorkspace);
      goToReviewAdmin();
      deleteReview(externalReview);
      cy.get('[data-cy="workspace-review-close"]').click();
    });

    it('keeps the link locked until a password of at least 4 characters is saved', () => {
      cy.visitWs(primaryWorkspace);
      goToReviewAdmin();
      selectReviewInAdmin(externalReview);
      cy.translate(Cypress.expose('locale')).then(json => {
        // The review data has to be in place first: without its units the button is locked for
        // another reason
        cy.get(`input[placeholder="${json.workspace['review-name']}"]`).should('have.value', externalReview);
        cy.get('[data-cy="workspace-review-menu-copy-review-link-button"] button').should('be.disabled');

        setReviewPassword('abc');
        cy.contains(json.workspace['review-password-info']).should('be.visible');
        cy.get('[data-cy="workspace-review-menu-copy-review-link-button"] button').should('be.disabled');
      });
      cy.get('[data-cy="workspace-review-close"]').click();
    });

    it('copies the link of the review once its password is saved', () => {
      cy.visitWs(primaryWorkspace);
      goToReviewAdmin();
      selectReviewInAdmin(externalReview).then(({ link }) => {
        setReviewPassword(password);
        copyReviewLink().then(copied => {
          cy.location('origin').then(origin => {
            expect(copied).to.equal(`${origin}/#/${link}`);
          });
          copiedLink = copied;
        });
      });
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.contains(json.workspace['link-copied']).should('be.visible');
      });
      cy.get('[data-cy="workspace-review-close"]').click();
      logout();
    });

    it('logs an external visitor in through the copied link, to this review alone', () => {
      loginToReviewLink(copiedLink, password);
      cy.get('studio-lite-user-reviews-area').within(() => {
        cy.get('mat-row.review-row').should('have.length', 1);
        cy.contains('a.review-link', externalReview).should('exist');
      });
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.contains(json.home['logged-in-for-review']).should('be.visible');
      });
      cy.get('studio-lite-user-workspaces-area').should('not.exist');
      cy.get('[data-cy="goto-user-menu"]').should('not.exist');
    });

    it('sends an external visitor back home from workspaces and the administration', () => {
      ['/#/a/1', '/#/admin'].forEach(url => {
        cy.visit(url);
        cy.url().should('include', '/home');
        cy.get('studio-lite-user-reviews-area').should('be.visible');
        cy.get('studio-lite-user-workspaces-area').should('not.exist');
      });
    });

    it('lets an external visitor comment once a name is given', () => {
      cy.intercept('POST', '/api/reviews/*/units/*/comments').as('postExternalComment');
      openCommentDialog();
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.get('mat-dialog-container').within(() => {
          // Without a user, a comment needs a name; the editor appears once there is one
          cy.get('studio-lite-comments').should('not.exist');
          // Typed as a visitor types it: the editor appears with the first letter, and once took the
          // focus, so that the rest of the name went into the comment (#1785)
          cy.get(`input[placeholder="${json.review['enter-comment-name']}"]`).type(visitorName);
          cy.get('tiptap-editor').should('be.visible').type(commentText);
          cy.contains('button', 'send').click({ force: true });
        });
      });
      waitForSuccess('@postExternalComment');
      cy.get<Interception>('@postExternalComment').then(({ request, response }) => {
        // The API answers with the id of the new comment
        const path = new URL(request.url).pathname;
        commentPath = `${path}/${response?.body}`;
        // `/api/reviews/<review>/units/<unit>/comments`
        commentUnitId = path.split('/')[5];
      });
      cy.contains('studio-lite-comment', commentText).within(() => {
        cy.get('.comment-meta').should('contain', visitorName);
        cy.get('.comment-html').should('have.text', commentText);
      });
    });

    it('lets an external visitor neither change, delete nor vote on the comment', () => {
      // The name given before is kept in the browser: the dialog opens with the comments at once
      openCommentDialog();
      cy.contains('studio-lite-comment', commentText).within(() => {
        cy.contains('.comment-action', 'edit').should('not.exist');
        cy.get('.delete-action').should('not.exist');
        cy.contains('.comment-action', 'reply').should('be.enabled');
        cy.get('[data-cy="comment-vote-up"]').should('be.disabled');
        cy.get('[data-cy="comment-vote-down"]').should('be.disabled');
        cy.get('.vote-button-host').first().trigger('mouseenter');
      });
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.get('.mat-mdc-tooltip').should(
          'contain',
          json.comment['vote-needs-account']
        );
        cy.get('mat-dialog-container').within(() => {
          cy.contains('button', json.dialogs.close).click();
        });
      });
      cy.get('mat-dialog-container').should('not.exist');
    });

    it('keeps a kept name in its field while it is typed anew', () => {
      const newName = 'Andere Person';
      openCommentDialog();
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.get('mat-dialog-container').within(() => {
          // With the name kept, the editor is ready at once and has the focus
          cy.focused().should('have.class', 'ProseMirror');
          // Cleared, the editor disappears; it appears again with the first letter, and took the focus
          // there, so that the rest of the name went into the comment (#1785)
          cy.get(`input[placeholder="${json.review['enter-comment-name']}"]`)
            .clear()
            .type(newName)
            .should('have.value', newName);
          cy.get('tiptap-editor .ProseMirror').should('have.text', '');
          cy.contains('button', json.dialogs.close).click();
        });
      });
      cy.get('mat-dialog-container').should('not.exist');
    });

    it('logs an external visitor out through the reviews area', () => {
      logoutFromReviewLink();
      cy.get('studio-lite-user-reviews-area').should('not.exist');
    });

    it('shows the comment of the external visitor to the workspace, under the given name', () => {
      login(Cypress.expose('username'), Cypress.expose('password'));
      cy.visitWs(primaryWorkspace);
      // The comment is on the review's first unit; which one that is, the request it was sent with
      // says. The unit is opened through its route, on the tab with its comments.
      cy.location('hash').then(hash => {
        const workspaceId = hash.split('/')[2];
        cy.intercept('GET', `/api/workspaces/${workspaceId}/units/${commentUnitId}/comments`)
          .as('getWorkspaceComments');
        cy.visit(`/#/a/${workspaceId}/${commentUnitId}/comments`);
      });
      waitForSuccess('@getWorkspaceComments');
      cy.contains('studio-lite-comment', commentText).within(() => {
        cy.get('.comment-meta').should('contain', visitorName);
        cy.get('.comment-html').should('have.text', commentText);
      });
    });
  });

  // A review whose booklet settings were never touched: pageNaviButtons then means its default,
  // SEPARATE_BOTTOM, and the player shows its pages one by one without buttons of its own. Without
  // the studio's navigation the pages after the first could not be reached (#1800).
  describe('#1800 the page navigation of a review without booklet settings', () => {
    const defaultsReview = 'DefaultsReview';

    it('creates a review with a unit of three pages and leaves the booklet settings alone', () => {
      loginWithUser(Cypress.expose('username'), Cypress.expose('password'));
      cy.visitWs(primaryWorkspace);
      goToReviewAdmin();
      createReview(defaultsReview, ['M6_AK0011']);
      cy.get('[data-cy="workspace-review-close"]').click();
    });

    // The start page names what applies, the review's own value where a setting is empty (#1803)
    it('lists the settings the review applies on its start page, marked as defaults', () => {
      cy.visit('/');
      openReview(defaultsReview);
      cy.translate(Cypress.expose('locale')).then(json => {
        const config = json['booklet-config'];
        cy.get('mat-expansion-panel-header').click();
        cy.get('[data-cy="booklet-config-show-pageNaviButtons"]')
          .should('contain.text', config.pageNaviButtons.SEPARATE_BOTTOM)
          .and('contain.text', config['is-default']);
        cy.get('[data-cy="booklet-config-show-unitTitle"]')
          .should('contain.text', config.unitTitle.OFF)
          .and('contain.text', config['is-default']);
        cy.get('[data-cy^="booklet-config-show-"]').should('have.length', 6);
      });
    });

    it('shows one page button per page and turns the page with them', () => {
      cy.visit('/');
      openReview(defaultsReview);
      startReview();
      cy.get('studio-lite-unit-player [data-cy="page-navigation-page"]', { timeout: 30000 })
        .should('have.length', 3)
        .eq(1)
        .click();
      cy.get('studio-lite-unit-player [data-cy="page-navigation-page"]')
        .eq(1)
        .should('be.disabled');
    });

    it('deletes the review', () => {
      cy.visitWs(primaryWorkspace);
      goToReviewAdmin();
      deleteReview(defaultsReview);
      cy.get('[data-cy="workspace-review-close"]').click();
      cy.contains('mat-row', defaultsReview).should('not.exist');
    });
  });

  // Units and settings ticked while a review loads were reset by its arrival (#1786). The review
  // admin keeps them disabled until then; its answer is held back here to see that.
  describe('#1786 the review admin while a review loads', () => {
    const firstReview = 'LockedReviewOne';
    const secondReview = 'LockedReviewTwo';
    const newReview = 'LockedReviewNew';
    const unitCheckbox = '[data-cy="workspace-select-unit-list-checkbox-M6_AK0013"] input';
    const reviewName = '[data-cy="workspace-review-config-name"]';

    const holdBackReview = (): void => {
      cy.intercept('GET', '/api/workspaces/*/reviews/*', req => {
        req.on('response', res => { res.setDelay(2000); });
      }).as('heldBackReview');
    };

    const expectLocked = (locked: boolean): void => {
      const state = locked ? 'be.disabled' : 'be.enabled';
      cy.get(unitCheckbox).should(state);
      cy.get(reviewName).should(state);
    };

    it('creates two reviews', () => {
      loginWithUser(Cypress.expose('username'), Cypress.expose('password'));
      cy.visitWs(primaryWorkspace);
      goToReviewAdmin();
      createReview(firstReview, ['M6_AK0011']);
      goToReviewAdmin();
      createReview(secondReview, ['M6_AK0011', 'M6_AK0012']);
    });

    it('locks the units and the settings while another review loads', () => {
      cy.visitWs(primaryWorkspace);
      goToReviewAdmin();
      selectReviewInAdmin(firstReview);
      expectLocked(false);
      holdBackReview();
      cy.contains('mat-row', secondReview).click();
      expectLocked(true);
      cy.wait('@heldBackReview');
      expectLocked(false);
      cy.get(reviewName).should('have.value', secondReview);
      cy.get('[data-cy^="workspace-select-unit-list-checkbox-"] input:checked').should('have.length', 2);
      cy.get('[data-cy="workspace-review-close"]').click();
    });

    it('locks the units and the settings of a new review until it has loaded', () => {
      cy.visitWs(primaryWorkspace);
      goToReviewAdmin();
      cy.intercept('POST', '/api/workspaces/*/reviews').as('createLockedReview');
      holdBackReview();
      cy.get('[data-cy="workspace-review-menu-add-review-button"]')
        .should('be.visible')
        .click();
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.get(`input[placeholder="${json.workspace['new-review-name']}"]`)
          .should('be.visible')
          .clear()
          .type(newReview);
        cy.get('.mat-mdc-dialog-component-host > .mat-mdc-dialog-actions').within(() => {
          cy.get('button').contains(json.workspace.save).click();
        });
      });
      waitForSuccess('@createLockedReview');
      expectLocked(true);
      cy.wait('@heldBackReview');
      expectLocked(false);
      cy.get(reviewName).should('have.value', newReview);
      cy.get('[data-cy="workspace-review-close"]').click();
    });

    it('deletes the reviews', () => {
      cy.visitWs(primaryWorkspace);
      goToReviewAdmin();
      // A row clicked while the list reloads after a delete is deselected by the reloaded list
      [firstReview, secondReview, newReview].forEach(name => {
        deleteReview(name);
        cy.contains('mat-row', name).should('not.exist');
      });
      cy.get('[data-cy="workspace-review-close"]').click();
    });
  });
});
