import {
  importedUnit,
  ws1
} from '../../support/testData';
import {
  clickIndexTabWorkspaceRoutes,
  importExercise,
  selectUnit
} from '../../support/util';
import { createBasicSpecCy, deleteBasicSpecCy } from './shared/basic.spec.cy';

describe('Comment:', () => {
  before(() => {
    createBasicSpecCy();
  });

  after(() => {
    deleteBasicSpecCy();
  });

  it('should import units', () => {
    cy.visit('/');
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
  });

  it('should add a comment', () => {
    selectUnit(importedUnit.shortname);
    clickIndexTabWorkspaceRoutes('comments');
    cy.get('tiptap-editor').type('Neue allgemein Kommentar 1');
    cy.contains('button', 'send').click();
    cy.get('tiptap-editor').type('Neue allgemein Kommentar 2');
    cy.contains('button', 'send').click();
    cy.get('studio-lite-comment').should('have.length', '2');
  });

  it('should reply the first comment', () => {
    // click replay button
    cy.get('studio-lite-comment')
      .eq(0).contains('button', 'reply').click();
    cy.get('tiptap-editor').eq(0).type('Antworten zu Neue Kommentar 1');
    cy.contains('button', 'send').click();
    //
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

  it('should show the hidden comments', () => {
    cy.contains('mat-icon', 'filter_alt').click();
    cy.get('mat-slide-toggle').click();
    cy.get('studio-lite-comment').should('have.length', '3');
  });
  it('should show the hidden comments', () => {
    cy.pause();
  });
});
