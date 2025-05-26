/// <reference types="cypress" />
import {
  addFirstUser, addModules, assignVariableToItem,
  createGroup, createItem,
  createWs,
  deleteFirstUser,
  deleteGroup, deleteModule,
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
    cy.get('mat-expansion-panel:contains("01")').click();
    assignVariableToItem('text-field_1');
    createItem('02');
    assignVariableToItem('radio_1');
    createItem('03');
    assignVariableToItem('drop-list_1');
    cy.contains('Speichern').click();
  });

  it('deletes the data', () => {
    cy.visit('/');
    deleteGroup(group);
    cy.visit('/');
    deleteModule();
  });
});
