import {
  importedUnit, standardUser,
  primaryWorkspace
} from '../../../support/testData';
import {
  clickIndexTabWorkspace,
  loginWithUser,
  selectUnit,
  waitForSuccess
} from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

describe('Unit Comments', () => {
  before(() => {
    createTestBaseAPI({ zip: 'test_studio_units_download.zip' });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/workspaces/*/units/*/comments').as('getComments');
  });

  it('creates multiple general comments', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.wait('@getComments');
    cy.get('tiptap-editor').type('Neue allgemein Kommentar 1');
    cy.contains('button', 'send').click();
    cy.get('tiptap-editor').type('Neue allgemein Kommentar 2');
    cy.contains('button', 'send').click();
    cy.get('studio-lite-comment').should('have.length', '2');
  });

  it('edits a comment', () => {
    cy.intercept('PATCH', '/api/workspaces/*/units/*/comments/*').as('editComment');
    cy.get('studio-lite-comment').eq(-1).within(() => {
      cy.contains('button', 'edit').click();
      cy.get('tiptap-editor .ProseMirror').click().type('{moveToEnd} verändert');
      cy.contains('button', 'send').click();
    });
    waitForSuccess('@editComment');
    cy.contains('studio-lite-comment .comment-html', /^\s*Neue allgemein Kommentar \d verändert\s*$/)
      .should('exist');
  });

  it('replies to a comment and hides it with its reply', () => {
    cy.get('studio-lite-comment')
      .eq(0).contains('button', 'reply').click();
    cy.get('tiptap-editor').eq(0).type('Antworten zu Neue Kommentar 1');
    cy.contains('button', 'send').click();
    cy.get('studio-lite-comment').should('have.length', '3');
    cy.get('studio-lite-comment')
      .eq(0).contains('mat-icon', 'visibility_off').click();
    cy.get('studio-lite-comment').should('have.length', '1');
  });

  it('allows other users to view hidden comments with filter enabled', () => {
    loginWithUser(standardUser.username, standardUser.password);
    cy.visitWs(primaryWorkspace);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.wait('@getComments');
    cy.get('studio-lite-comment').should('have.length', '1');
    cy.contains('mat-icon', 'filter_alt').should('be.visible').click();
    cy.get('mat-slide-toggle').should('be.visible')
      .should('not.have.class', 'mat-mdc-slide-toggle-checked')
      .find('button')
      .click({ force: true });
    cy.get('mat-slide-toggle').should('have.class', 'mat-mdc-slide-toggle-checked');
    cy.get('studio-lite-comment').should('have.length', '3');
  });

  it('deletes a comment', () => {
    loginWithUser(Cypress.expose('username'), Cypress.expose('password'));
    cy.visitWs(primaryWorkspace);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.wait('@getComments');
    cy.get('studio-lite-comment').eq(0).contains('button', 'delete').click();
    cy.get('studio-lite-comment').should('have.length', '1');
    cy.clickButtonWithResponseCheck(
      'Löschen', [200], '/api/workspaces/*/units/*/comments/*', 'DELETE', 'deleteComment');
    cy.get('studio-lite-comment').should('have.length', '0');
  });

  // the comment hidden above comes back with its reply
  it('makes hidden comment visible again', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.wait('@getComments');
    cy.contains('mat-icon', 'filter_alt').should('be.visible').click();
    cy.get('mat-slide-toggle').should('be.visible')
      .should('not.have.class', 'mat-mdc-slide-toggle-checked')
      .find('button')
      .click({ force: true });
    cy.get('mat-slide-toggle').should('have.class', 'mat-mdc-slide-toggle-checked');
    // saved before the page is loaded again, which would otherwise cut the request off
    cy.intercept('PATCH', '/api/workspaces/*/units/*/comments/*/hidden').as('showComment');
    cy.get('studio-lite-comment')
      .eq(0).contains('mat-icon', 'visibility').click({ force: true });
    waitForSuccess('@showComment');

    cy.visitWs(primaryWorkspace);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.wait('@getComments');
    cy.get('studio-lite-comment').should('have.length', '2');
  });

  it('creates comment linked to specific item', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.wait('@getComments');
    cy.get('tiptap-editor').type('Neues Kommentar zur Item 01');
    cy.get('[data-cy="comment-editor-link-to-item"]').click();
    cy.contains('mat-option', '01').click();
    cy.contains('button', 'send').click({ force: true });
    cy.get('studio-lite-comment').should('have.length', '3');
  });

  it('filters comments by item', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.wait('@getComments');
    cy.get('studio-lite-comment').should('have.length', '3');
    cy.contains('mat-icon', 'filter_alt').click();
    cy.contains('mat-list-option', '01').click();
    cy.get('studio-lite-comment').should('have.length', '1');
  });

  it('upvotes a comment and checks count and coloring', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.wait('@getComments');

    cy.get('studio-lite-comment').eq(0).within(() => {
      cy.get('.integrated-vote-container').eq(0).should('not.have.class', 'vote-active-up');

      cy.get('.integrated-vote-container').eq(0).find('button.vote-button').click();

      cy.get('.integrated-vote-container').eq(0).should('have.class', 'vote-active-up');
      cy.get('.integrated-vote-container').eq(0).find('.vote-count').should('contain', '1');
    });
  });

  it('removes upvote on a comment', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.wait('@getComments');

    cy.get('studio-lite-comment').eq(0).within(() => {
      cy.get('.integrated-vote-container').eq(0).should('have.class', 'vote-active-up');
      cy.get('.integrated-vote-container').eq(0).find('.vote-count').should('contain', '1');

      cy.get('.integrated-vote-container').eq(0).find('button.vote-button').click();

      cy.get('.integrated-vote-container').eq(0).should('not.have.class', 'vote-active-up');
      cy.get('.integrated-vote-container').eq(0).find('.vote-count').should('not.exist');
    });
  });

  it('downvotes a comment and checks count and coloring', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.wait('@getComments');

    cy.get('studio-lite-comment').eq(0).within(() => {
      cy.get('.integrated-vote-container').eq(1).should('not.have.class', 'vote-active-down');

      cy.get('.integrated-vote-container').eq(1).find('button.vote-button').click();

      cy.get('.integrated-vote-container').eq(1).should('have.class', 'vote-active-down');
      cy.get('.integrated-vote-container').eq(1).find('.vote-count').should('contain', '1');
    });
  });

  it('shows voter overview dialog', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.wait('@getComments');

    cy.get('studio-lite-comment').eq(0).within(() => {
      cy.get('.integrated-vote-container').eq(1).find('.vote-count').should('be.visible')
        .click();
    });

    cy.get('mat-dialog-content.voter-dialog-content').should('be.visible');
    cy.get('.voter-section.down .voter-chip').should('contain', Cypress.expose('username'));

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('mat-dialog-actions button').contains(json.close, { matchCase: false }).click();
    });
  });
});
