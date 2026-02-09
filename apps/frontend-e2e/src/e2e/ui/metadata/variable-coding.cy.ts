/// <reference types="cypress" />
import {
  selectProfileForArea,
  selectProfileForGroup
} from '../../../support/metadata/metadata-util';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import {
  AccessLevel, modules, testGroups, testWorkspaces
} from '../../../support/testData';
import {
  addFirstUser,
  addModules,
  assignVariableToItem,
  clickIndexTabWorkspace,
  createGroup,
  createItem,
  createWs,
  deleteAllModules,
  deleteFirstUser,
  deleteGroup,
  goToItem,
  goToWsMenu,
  grantRemovePrivilegeAtWs,
  importExercise,
  selectUnit,
  setVeronaWs
} from '../../../support/helpers';

describe('Variable and Item Metadata Coherence', () => {
  const mathArea = testWorkspaces.metadata.mathPrimar1;
  const group = testGroups.metadata.bista3;

  before(() => {
    addFirstUser();
  });

  after(() => {
    deleteFirstUser();
    // cy.resetDb();
  });

  it('sets up workspace with modules and profile', () => {
    addModules(modules);
    createGroup(group);
    createWs(mathArea, group);
    grantRemovePrivilegeAtWs([Cypress.env('username')], mathArea, [AccessLevel.Admin]);
    selectProfileForGroup(group, IqbProfile.MA);
    setVeronaWs(mathArea);
    selectProfileForArea(IqbProfile.MA);
    importExercise('variable_metadata.zip');
  });

  it('creates item 01 and assigns variable text-field_1', () => {
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    goToItem('01');
    assignVariableToItem('text-field_1');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('prevents reusing assigned variable in new item', () => {
    createItem('02');
    cy.translate(Cypress.env('locale')).then(json => {
      cy.get(`mat-select[placeholder="${json.metadata['choose-item-variable']}"]`)
        .eq(-1).find('svg').click();
    });
    // cy.get('mat-select[placeholder="Variable auswählen"]').eq(-1).find('svg').click();
    cy.get('mat-option:contains("text-field_1")').should('not.exist');
    cy.get('mat-option:contains("radio_1")').eq(0).click();
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('displays error for duplicate item names', () => {
    createItem('02');
    cy.get('mat-form-field').find('mat-error').should('exist');
  });

  it('renames item and assigns variable', () => {
    cy.get('mat-label:contains("Item ID")').eq(-1).type('{backspace}{backspace}03');
    assignVariableToItem('drop-list_1');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('unassigns variable from item', () => {
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    goToItem('03');
    assignVariableToItem('');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('removes variable from item properties', () => {
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    goToItem('03');
    cy.translate(Cypress.env('locale')).then(json => {
      cy.get(`mat-select[placeholder="${json.metadata['choose-item-variable']}"]`)
        .eq(-1).find('svg').click()
        .then(() => {
          cy.get('mat-select:contains("drop-list_1")').should('have.length', 0);
        });
    });
  });

  it('excludes unassigned variable from metadata report', () => {
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-metadata"]').click();
    cy.get('[data-cy="workspace-show-metadata-display"]').click();
    cy.translate(Cypress.env('locale')).then(json => {
      cy.get(`.mdc-tab__text-label:contains("${json.metadata.items}")`).click();
    });
    cy.get('mat-dialog-container:contains("drop-list_1")').should('have.length', 0);
    cy.get('[data-cy="metadata-table-view-close"]').click();
  });

  it('sorts items by variable ID', () => {
    cy.get('studio-lite-item').eq(1).find('span:contains("02")').should('exist');
    cy.get('studio-lite-item').eq(0).find('span:contains("01")').should('exist');
    cy.translate(Cypress.env('locale')).then(json => {
      cy.get('select.sort-items').select(`${json.metadata['sort-by-variableId']}`,
        { force: true });
    });
    cy.get('studio-lite-item').eq(0).find('span:contains("02")').should('exist');
    cy.get('studio-lite-item').eq(1).find('span:contains("01")').should('exist');
  });

  it('provides sort by item ID option', () => {
    cy.translate(Cypress.env('locale')).then(json => {
      cy.get('select.sort-items').select(`${json.metadata['sort-by-id']}`, { force: true });
    });
  });

  it('excludes unassigned variable from preview', () => {
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    goToItem('03');
    assignVariableToItem('');
    cy.contains('mat-icon', 'visibility').click({ force: true });
    cy.contains('span.item_value', 'drop-list_1').should('not.exist');
  });

  it('creates comment linked to multiple items', () => {
    clickIndexTabWorkspace('comments');
    cy.get('tiptap-editor').type('Neue Kommentar zu item1');
    cy.get('.fx-row-space-between-end').find('svg').eq(0).click();
    cy.get('.mat-pseudo-checkbox').next().contains('01').click();
    cy.get('.mat-pseudo-checkbox').next().contains('02').click();
    cy.contains('button', 'send').click({ force: true });
  });

  it('cleans up test data', () => {
    deleteGroup(group);
    deleteAllModules();
  });
});
