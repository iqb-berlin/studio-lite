import {
  group1,
  UnitData,
  ws1,
  ws2
} from '../../../support/testData';
import {
  addUnitFromExisting,
  ensureUnitExists,
  goToWsMenu,
  moveUnit
} from '../../../support/helpers';

describe('Workspace Unit Move & Copy Operations', () => {
  const unit1: UnitData = {
    shortname: 'AUF_MC1',
    name: 'MoveCopy Unit 1',
    group: 'Gruppe D'
  };
  const unit2: UnitData = {
    shortname: 'AUF_MC2',
    name: 'MoveCopy Unit 2',
    group: 'Gruppe E'
  };
  const unit3: UnitData = {
    shortname: 'AUF_MC3',
    name: 'MoveCopy Unit 3',
    group: 'Gruppe D'
  };
  const newUnit: UnitData = {
    shortname: 'Neu_Ex_MC1',
    name: 'New MoveCopy Unit',
    group: 'Group D'
  };

  it('creates unit from existing unit within same workspace', () => {
    ensureUnitExists(ws1, unit1);
    cy.visitWs(ws1);
    addUnitFromExisting(`${group1}: ${ws1}`, unit1, newUnit);
    cy.visitWs(ws1);
    cy.contains(unit1.shortname).should('exist');
    cy.contains(newUnit.shortname).should('exist');
  });

  it('moves unit to another workspace and verifies removal from source workspace', () => {
    ensureUnitExists(ws1, unit2);
    moveUnit(ws1, ws2, unit2);
    cy.visitWs(ws2);
    cy.contains(unit2.shortname).should('exist');
    cy.visitWs(ws1);
    cy.contains(unit2.shortname).should('not.exist');
  });

  it('copies unit to another workspace and verifies target workspace', () => {
    ensureUnitExists(ws1, unit3);
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-copy-unit"]').click();
    cy.get('mat-select').click();
    cy.get(`mat-option:contains("${ws2}")`).click();
    cy.get(`[data-cy="workspace-select-unit-list-checkbox-${unit3.shortname}"]`).click();
    cy.clickDataCyWithResponseCheck(
      '[data-cy="workspace-move-unit-button"]',
      [200, 201],
      '/api/workspaces/*/units',
      'POST',
      'copyUnit'
    );
    cy.visitWs(ws2);
    cy.contains(unit3.shortname).should('exist');
    cy.visitWs(ws1);
    cy.contains(unit3.shortname).should('exist');
  });
});
