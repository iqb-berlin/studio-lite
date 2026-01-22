import {
  importedUnit, newUser,
  ws1
} from '../../../support/testData';
import { createBasicSpecCy, deleteBasicSpecCy } from '../shared/basic.spec.cy';
import {
  clickIndexTabWorkspace,
  importExercise,
  loginWithUser,
  selectUnit
} from '../../../support/helpers';

describe('Unit Comments', () => {
  before(() => {
    // cy.resetDb();
    createBasicSpecCy();
  });

  after(() => {
    deleteBasicSpecCy();
  });

  it('imports test units', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
  });

  it('creates multiple general comments', () => {
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.get('tiptap-editor').type('Neue allgemein Kommentar 1');
    cy.contains('button', 'send').click();
    cy.get('tiptap-editor').type('Neue allgemein Kommentar 2');
    cy.contains('button', 'send').click();
    cy.get('studio-lite-comment').should('have.length', '2');
  });

  it('replies to a comment', () => {
    cy.get('studio-lite-comment')
      .eq(0).contains('button', 'reply').click();
    cy.get('tiptap-editor').eq(0).type('Antworten zu Neue Kommentar 1');
    cy.contains('button', 'send').click();
  });

  it('edits a comment', () => {
    cy.get('studio-lite-comment')
      .eq(-1).contains('button', 'edit').type('Verändert ');
    cy.contains('button', 'send').click();
  });

  it('hides a comment', () => {
    cy.get('studio-lite-comment').should('have.length', '3');
    cy.get('studio-lite-comment')
      .eq(0).contains('mat-icon', 'visibility_off').click();
    cy.get('studio-lite-comment').should('have.length', '1');
  });

  it('allows other users to view hidden comments with filter enabled', () => {
    loginWithUser(newUser.username, newUser.password);
    cy.visitWs(ws1);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.get('studio-lite-comment').should('have.length', '1');
    cy.contains('mat-icon', 'filter_alt').should('exist').click();
    cy.get('mat-slide-toggle').should('exist').click();
    cy.get('studio-lite-comment').should('have.length', '3');
  });

  it('deletes a comment', () => {
    loginWithUser(Cypress.env('username'), Cypress.env('password'));
    cy.visitWs(ws1);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.get('studio-lite-comment').eq(0).contains('button', 'delete').click();
    cy.get('studio-lite-comment').should('have.length', '1');
    cy.clickButtonWithResponseCheck(
      'Löschen', [200], '/api/workspaces/*/units/*/comments/*', 'DELETE', 'deleteComment');
    cy.get('studio-lite-comment').should('have.length', '0');
  });

  it('makes hidden comment visible again', () => {
    cy.contains('mat-icon', 'filter_alt').click();
    cy.get('mat-slide-toggle').click();
    cy.get('studio-lite-comment')
      .eq(0).contains('mat-icon', 'visibility').click({ force: true });
  });

  it('creates comment linked to specific item', () => {
    cy.visitWs(ws1);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.get('tiptap-editor').type('Neues Kommentar zur Item 01');
    cy.get('[data-cy="comment-editor-link-to-item"]').click();
    cy.contains('mat-option', '01').click();
    cy.contains('button', 'send').click({ force: true });
  });

  it('filters comments by item', () => {
    cy.visitWs(ws1);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.get('studio-lite-comment').should('have.length', '3');
    cy.contains('mat-icon', 'filter_alt').click();
    cy.contains('mat-list-option', '01').click();
    cy.get('studio-lite-comment').should('have.length', '1');
  });
});
