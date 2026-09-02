import {
  baseGroup,
  primaryWorkspace,
  secondaryWorkspace,
  moveCopyUnits
} from '../../../support/testData';
import {
  addUnitFromExisting,
  ensureUnitExists,
  goToWsMenu,
  moveUnit
} from '../../../support/helpers';

describe('Workspace Unit Move & Copy Operations', () => {
  it('creates unit from existing unit within same workspace', () => {
    ensureUnitExists(primaryWorkspace, moveCopyUnits.copySource);
    cy.visitWs(primaryWorkspace);
    addUnitFromExisting(`${baseGroup}: ${primaryWorkspace}`, moveCopyUnits.copySource, moveCopyUnits.newFromExisting);
    cy.visitWs(primaryWorkspace);
    cy.contains(moveCopyUnits.copySource.shortname).should('exist');
    cy.contains(moveCopyUnits.newFromExisting.shortname).should('exist');
  });

  it('moves unit to another workspace and verifies removal from source workspace', () => {
    ensureUnitExists(primaryWorkspace, moveCopyUnits.moveTarget);
    moveUnit(primaryWorkspace, secondaryWorkspace, moveCopyUnits.moveTarget);
    cy.visitWs(secondaryWorkspace);
    cy.contains(moveCopyUnits.moveTarget.shortname).should('exist');
    cy.visitWs(primaryWorkspace);
    cy.contains(moveCopyUnits.moveTarget.shortname).should('not.exist');
  });

  it('copies unit to another workspace and verifies target workspace', () => {
    ensureUnitExists(primaryWorkspace, moveCopyUnits.copyTarget);
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-copy-unit"]').click();
    cy.get('mat-select').click();
    cy.get(`mat-option:contains("${secondaryWorkspace}")`).click();
    cy.get(`[data-cy="workspace-select-unit-list-checkbox-${moveCopyUnits.copyTarget.shortname}"]`).click();
    cy.clickDataCyWithResponseCheck(
      '[data-cy="workspace-move-unit-button"]',
      [200, 201],
      '/api/workspaces/*/units',
      'POST',
      'copyUnit'
    );
    cy.visitWs(secondaryWorkspace);
    cy.contains(moveCopyUnits.copyTarget.shortname).should('exist');
    cy.visitWs(primaryWorkspace);
    cy.contains(moveCopyUnits.copyTarget.shortname).should('exist');
  });
});
