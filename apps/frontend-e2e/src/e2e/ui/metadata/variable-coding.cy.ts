/// <reference types="cypress" />
import {
  addFirstUser, addModules, assignVariableToItem,
  createGroup, createItem,
  createWs,
  deleteFirstUser,
  deleteGroup, deleteModule, goToItem,
  grantRemovePrivilegeAtWs, importExercise, selectUnit, setVeronaWs
} from '../../../support/util';
import {
  selectProfileForArea,
  selectProfileForGroup
} from '../../../support/metadata/metadata-util';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import { AccessLevel } from '../../../support/testData';

describe('UI Variable in Scheme and Metadata', () => {
  const modules:string[] = ['iqb-schemer-2.5.3.html', 'iqb-editor-aspect-2.9.3.html', 'iqb-player-aspect-2.9.3.html'];
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
    cy.pause();
  });

  it('checks the connection the variable drop_list_1 with item 03 is still active', () => {
    cy.visit('/');
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    goToItem('03');
    cy.get('mat-select[placeholder="Variable auswählen"]')
      .eq(-1).find('svg').click()
      .then(() => {
        cy.get('mat-select:contains("drop-list_1")').should('have.length', 1);
      });
  });

  it('deletes the data', () => {
    cy.visit('/');
    deleteGroup(group);
    cy.visit('/');
    deleteModule();
  });
});
