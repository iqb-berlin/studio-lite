/// <reference types="cypress" />
import {
  addFirstUser, addModules, assignVariableToItem,
  createGroup, createItem,
  createWs,
  deleteFirstUser,
  deleteGroup, deleteModule, focusOnMenu, goToItem,
  grantRemovePrivilegeAtWs, importExercise, selectListUnits, selectUnit, setVeronaWs
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
  });

  it('prepares context', () => {
    addModules(modules, 'Module');
    cy.visit('/');
    createGroup(group);
    cy.visit('/');
    createWs(mathArea, group);
    grantRemovePrivilegeAtWs([Cypress.env('username')], mathArea, [AccessLevel.Admin]);
    cy.visit('/');
    selectProfileForGroup(group, IqbProfile.MA);
    cy.visit('/');
    setVeronaWs(mathArea);
    selectProfileForArea(IqbProfile.MA);
    importExercise('variable_metadata.zip');
  });

  it('adds new items, and select the corresponding variable', () => {
    cy.visit('/');
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    goToItem('01');
    assignVariableToItem('text-field_1');
    createItem('02');
    assignVariableToItem('radio_1');
    createItem('03');
    assignVariableToItem('drop-list_1');
    cy.contains('Speichern').click();
  });

  it('ends the connection the variable drop_list_1 with item 03', () => {
    cy.visit('/');
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    goToItem('03');
    assignVariableToItem('');
    cy.contains('Speichern').click();
  });

  it('checks the connection the variable drop-list_1 with item 03 is not active at properties', () => {
    cy.visit('/');
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
    selectListUnits(['MA_01']);
    cy.buttonToContinue('Anzeigen', [200, 304], '/api/workspaces/*/units/properties', 'GET', 'summaryMetadata');
    cy.get('.mdc-tab__text-label:contains("Metadaten Items")').click();
    cy.get('mat-dialog-container:contains("drop-list_1")').should('have.length', 0);
    cy.clickButton('Schließen');
  });

  it('checks that drop-list_1 is not present at eye view', () => {
    cy.visit('/');
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    goToItem('03');
    assignVariableToItem('');
    cy.contains('mat-icon', 'visibility').click({ force: true });
    cy.contains('span.item_value', 'drop-list_1').should('not.exist');
  });

  it('deletes the data', () => {
    cy.visit('/');
    deleteGroup(group);
    cy.visit('/');
    deleteModule();
  });
});
