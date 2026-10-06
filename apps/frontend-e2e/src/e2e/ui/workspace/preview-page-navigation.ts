import {
  clickIndexTabWorkspace,
  selectUnit
} from '../../../support/helpers';
import { importedUnit, lightUnit, primaryWorkspace } from '../../../support/testData';

/**
 * Sends what the editor would send after an author has deleted all pages but the first. The studio
 * takes a definition only from the editor's own frame and only with the session it started the
 * editor with, so a script inside that frame asks for a fresh start, waits for it, and answers with
 * the definition it was given, cut down to its first page. The editor itself must not see that
 * start: it would load the unit again and report the original definition back.
 */
const reduceUnitToFirstPageInEditor = (): void => {
  cy.get<HTMLIFrameElement>('studio-lite-unit-editor iframe').then($iframe => {
    const editorDocument = $iframe[0].contentDocument as Document;
    const script = editorDocument.createElement('script');
    script.textContent = `
      window.addEventListener('message', function onStart(event) {
        if (!event.data || event.data.type !== 'voeStartCommand') return;
        event.stopImmediatePropagation();
        window.removeEventListener('message', onStart, true);
        const definition = JSON.parse(event.data.unitDefinition);
        definition.pages = definition.pages.slice(0, 1);
        parent.postMessage({
          type: 'voeDefinitionChangedNotification',
          sessionId: event.data.sessionId,
          timeStamp: Date.now(),
          unitDefinition: JSON.stringify(definition)
        }, '*');
      }, true);
      parent.postMessage({ type: 'voeReadyNotification', metadata: { specVersion: '4.0' } }, '*');
    `;
    editorDocument.body.appendChild(script);
  });
};

/**
 * The page navigation belongs to the unit that is shown, so it has to follow a unit change --
 * including down to nothing. M6_AK0011 has three pages, M6_AK0013 a single one, which the player
 * reports as no navigable pages at all (#1531).
 */
describe('Unit Preview Page Navigation', () => {
  it('shows one button per page of a unit with several pages', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(importedUnit.shortname);
    cy.get('.unit-row.selected').should('contain.text', importedUnit.shortname);
    clickIndexTabWorkspace('preview');
    cy.get('.wait-animation', { timeout: 30000 }).should('not.exist');
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-pages-layout', { timeout: 30000 }).should('exist');
    });
    cy.get('[data-cy="page-navigation"]', { timeout: 30000 }).should('exist');
    cy.get('[data-cy="page-navigation-page"]').should('have.length', 3);
  });

  it('drops the navigation when switching to a unit with a single page', () => {
    selectUnit(lightUnit.shortname);
    cy.get('.unit-row.selected').should('contain.text', lightUnit.shortname);
    cy.get('.wait-animation', { timeout: 30000 }).should('not.exist');
    cy.getIFrameBody('[data-cy="unit-preview-iframe"]').within(() => {
      cy.get('aspect-radio-button-group', { timeout: 30000 }).should('exist');
    });
    cy.get('[data-cy="page-navigation"]').should('not.exist');
  });

  it('builds the navigation again when switching back', () => {
    selectUnit(importedUnit.shortname);
    cy.get('.unit-row.selected').should('contain.text', importedUnit.shortname);
    cy.get('.wait-animation', { timeout: 30000 }).should('not.exist');
    cy.get('[data-cy="page-navigation-page"]', { timeout: 30000 }).should('have.length', 3);
  });

  /**
   * The unit changes under the running preview: the editor beside it reports a definition with a
   * single page, and the player restarts with it. The aspect player in the fixtures reports an empty
   * page list first, before it has counted its pages, and the studio has to wait for the count
   * (#1683).
   */
  it('drops the navigation when the editor beside the preview leaves the unit a single page', () => {
    // Opening the second pane resizes both frames at once, which Chrome reports as an error.
    cy.on('uncaught:exception', err => !err.message.includes('ResizeObserver loop'));
    clickIndexTabWorkspace('editor');
    cy.get('[data-cy="workspace-routes-preview"] [mat-icon-button]').click();
    cy.get('.unit-preview [data-cy="page-navigation-page"]', { timeout: 30000 })
      .should('have.length', 3);
    // The editor must have finished its own start, or its ready notification would replace the
    // session the reduced definition is sent with.
    cy.getIFrameBody('studio-lite-unit-editor iframe').within(() => {
      cy.get('aspect-editor-page-view', { timeout: 30000 }).should('exist');
    });

    reduceUnitToFirstPageInEditor();

    cy.get('.unit-preview [data-cy="page-navigation"]', { timeout: 30000 }).should('not.exist');
  });

  it('discards the edit and unpins the preview', () => {
    cy.on('uncaught:exception', err => !err.message.includes('ResizeObserver loop'));
    selectUnit(lightUnit.shortname);
    // The studio asks to save only an edit that has arrived, which makes this the proof that it did.
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.contains('mat-dialog-container button', json.workspace['reject-changes-label']).click();
    });
    cy.get('.unit-row.selected').should('contain.text', lightUnit.shortname);
    cy.get('[data-cy="workspace-routes-preview"] [mat-icon-button]').last().click();
    cy.get('.unit-preview').should('not.exist');
  });
});
