/// <reference types="cypress" />
import {
  addFirstUser,
  addModules,
  assignVariableToItem,
  clickIndexTabWorkspace,
  createGroup,
  createItem,
  createWs,
  deleteFirstUser,
  deleteGroup,
  deleteModule,
  focusOnMenu,
  goToItem,
  grantRemovePrivilegeAtWs,
  importExercise,
  selectUnit,
  setVeronaWs
} from '../../../support/util';
import {
  selectProfileForArea,
  selectProfileForGroup
} from '../../../support/metadata/metadata-util';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import { AccessLevel, modules } from '../../../support/testData';

describe('UI variable coherence in Scheme, Aspect and Metadata', () => {
  const mathArea = 'Mathematik Primar I';
  const group = 'Bista III';

  before(() => {
    addFirstUser();
  });

  after(() => {
    deleteFirstUser();
    // cy.resetDb();
  });

  it('prepares the context', () => {
    addModules(modules);
    createGroup(group);
    createWs(mathArea, group);
    grantRemovePrivilegeAtWs([Cypress.env('username')], mathArea, [AccessLevel.Admin]);
    selectProfileForGroup(group, IqbProfile.MA);
    setVeronaWs(mathArea);
    selectProfileForArea(IqbProfile.MA);
    importExercise('variable_metadata.zip');
  });

  it('adds a new item 01, and select the corresponding variable text-field_1', () => {
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    goToItem('01');
    assignVariableToItem('text-field_1');
    cy.contains('Speichern').click();
  });

  it('creates the item 02 and checks that text-field_1 is not available', () => {
    createItem('02');
    cy.get('mat-select[placeholder="Variable auswählen"]').eq(-1).find('svg').click();
    cy.get('mat-option:contains("text-field_1")').should('not.exist');
    cy.get('mat-option:contains("radio_1")').eq(0).click();
    cy.contains('Speichern').click();
  });

  it('checks that it shows a warning when we try to create an item with same name as an existent item', () => {
    createItem('02');
    cy.get('mat-form-field').find('mat-error').should('exist');
  });

  it('replaces the name of the third item', () => {
    cy.get('mat-label:contains("Item ID")').eq(-1).type('{backspace}{backspace}03');
    assignVariableToItem('drop-list_1');
    cy.contains('Speichern').click();
  });

  it('ends the connection the variable drop_list_1 with item 03', () => {
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    goToItem('03');
    assignVariableToItem('');
    cy.contains('Speichern').click();
  });

  it('checks the connection the variable drop-list_1 with item 03 is not active at properties', () => {
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    goToItem('03');
    cy.get('mat-select[placeholder="Variable auswählen"]')
      .eq(-1).find('svg').click()
      .then(() => {
        cy.get('mat-select:contains("drop-list_1")').should('have.length', 0);
      });
  });

  it('checks that drop-list_1 is not present at Menu -> Berichte -> Metadaten', () => {
    focusOnMenu('Berichte', 'Metadaten');
    // eslint-disable-next-line max-len
    cy.clickButtonWithResponseCheck('Anzeigen', [200, 304], '/api/workspaces/*/units/properties', 'GET', 'summaryMetadata');
    cy.get('.mdc-tab__text-label:contains("Metadaten Items")').click();
    cy.get('mat-dialog-container:contains("drop-list_1")').should('have.length', 0);
    cy.clickButton('Schließen');
  });

  it('checks the order of items before and after clicking Nach Variable ID Sortieren is not the same', () => {
    cy.get('studio-lite-item').eq(1).find('span:contains("02")').should('exist');
    cy.get('studio-lite-item').eq(0).find('span:contains("01")').should('exist');
    cy.get('select.sort-items').select('Nach Variablen ID sortieren', { force: true });
    cy.get('studio-lite-item').eq(0).find('span:contains("02")').should('exist');
    cy.get('studio-lite-item').eq(1).find('span:contains("01")').should('exist');
  });

  it('checks that the select order by Id exists', () => {
    cy.get('select.sort-items').select('Nach Item ID sortieren', { force: true });
  });

  it('checks that drop-list_1 is not present at eye view', () => {
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    goToItem('03');
    assignVariableToItem('');
    cy.contains('mat-icon', 'visibility').click({ force: true });
    cy.contains('span.item_value', 'drop-list_1').should('not.exist');
  });

  it('creates a comment to items ', () => {
    clickIndexTabWorkspace('comments');
    cy.get('tiptap-editor').type('Neue Kommentar zu item1');
    cy.get('.fx-row-space-between-end').find('svg').eq(0).click();
    cy.get('.mat-pseudo-checkbox').next().contains('01').click();
    cy.get('.mat-pseudo-checkbox').next().contains('02').click();
    cy.contains('button', 'send').click({ force: true });
  });

  it('deletes the data', () => {
    deleteGroup(group);
    deleteModule();
  });
});
