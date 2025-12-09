import {
  importedUnit, newUser,
  ws1
} from '../../support/testData';
import {
  clickIndexTabWorkspace,
  importExercise,
  loginWithUser,
  selectUnit
} from '../../support/util';
import { createBasicSpecCy, deleteBasicSpecCy } from './shared/basic.spec.cy';

describe('Comment:', () => {
  before(() => {
    createBasicSpecCy();
  });

  after(() => {
    deleteBasicSpecCy();
    // cy.resetDb();
  });

  it('should import units', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
  });

  it('should add comments', () => {
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.get('tiptap-editor').type('Neue allgemein Kommentar 1');
    cy.contains('button', 'send').click();
    cy.get('tiptap-editor').type('Neue allgemein Kommentar 2');
    cy.contains('button', 'send').click();
    cy.get('studio-lite-comment').should('have.length', '2');
  });

  it('should reply the first comment', () => {
    cy.get('studio-lite-comment')
      .eq(0).contains('button', 'reply').click();
    cy.get('tiptap-editor').eq(0).type('Antworten zu Neue Kommentar 1');
    cy.contains('button', 'send').click();
  });

  it('should edit the last comment', () => {
    cy.get('studio-lite-comment')
      .eq(-1).contains('button', 'edit').type('Verändert ');
    cy.contains('button', 'send').click();
  });

  it('should hide the first comment', () => {
    cy.get('studio-lite-comment').should('have.length', '3');
    cy.get('studio-lite-comment')
      .eq(0).contains('mat-icon', 'visibility_off').click();
    cy.get('studio-lite-comment').should('have.length', '1');
  });

  it('should other user able to see the hidden comments by ignoring the visibility setting ', () => {
    loginWithUser(newUser.username, newUser.password);
    cy.visitWs(ws1);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.get('studio-lite-comment').should('have.length', '1');
    cy.contains('mat-icon', 'filter_alt').click();
    cy.get('mat-slide-toggle').click();
    cy.get('studio-lite-comment').should('have.length', '3');
  });

  it('should delete the visible comment', () => {
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

  it('should set visibility on ', () => {
    cy.contains('mat-icon', 'filter_alt').click();
    cy.get('mat-slide-toggle').click();
    cy.get('studio-lite-comment')
      .eq(0).contains('mat-icon', 'visibility').click({ force: true });
  });

  it('should able to write a comment related to a item', () => {
    cy.visitWs(ws1);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.get('tiptap-editor').type('Neues Kommentar zur Item 01');
    cy.get('[data-cy="comment-editor-link-to-item"]').click();
    cy.contains('mat-option', '01').click();
    cy.contains('button', 'send').click({ force: true });
  });

  it('should show only comments related to Item 01', () => {
    cy.visitWs(ws1);
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspace('comments');
    cy.get('studio-lite-comment').should('have.length', '3');
    cy.contains('mat-icon', 'filter_alt').click();
    cy.contains('mat-list-option', '01').click();
    cy.get('studio-lite-comment').should('have.length', '1');
  });
});
