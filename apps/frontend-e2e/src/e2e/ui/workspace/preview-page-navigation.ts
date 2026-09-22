import {
  clickIndexTabWorkspace,
  selectUnit
} from '../../../support/helpers';
import { importedUnit, lightUnit, primaryWorkspace } from '../../../support/testData';

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
});
