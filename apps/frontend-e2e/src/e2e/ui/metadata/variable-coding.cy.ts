/// <reference types="cypress" />
import {
  addFirstUser, addModules,
  createGroup, createSimpleCoding,
  createWs,
  deleteFirstUser,
  deleteGroup, deleteModule,
  grantRemovePrivilegeAtWs, importExercise, selectUnit, selectVariableAtCoding, setVeronaWs
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
    cy.contains('MA_01')
      .should('exist');
  });

  it.skip('adds a new item and select the corresponding variable', () => {
    selectUnit('MA_01');
    cy.wait(1000);
    cy.pause();
    cy.contains('span', 'Kodierung').click();
    selectVariableAtCoding('math-table_1');
    createSimpleCoding('240');
  });

  it('deletes the data', () => {
    cy.visit('/');
    deleteGroup(group);
    cy.visit('/');
    deleteModule();
  });
});
