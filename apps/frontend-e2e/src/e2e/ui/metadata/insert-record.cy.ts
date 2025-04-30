/// <reference types="cypress" />
import {
  addFirstUser,
  addUnit, clickSave,
  createGroup,
  createWs,
  deleteFirstUser,
  deleteGroup,
  deleteUnit,
  grantRemovePrivilege
} from '../../../support/util';
import {
  getItem,
  getStructure,
  selectProfileForArea,
  selectProfileForAreaFromGroup,
  selectProfileForGroup
} from '../../../support/metadata/metadata-util';
import { AccessLevel } from '../../../support/testData';
import { IqbProfile } from '../../../support/metadata/iqbProfile';

describe('Metadata Management', () => {
  const ws1 = 'Deutsch I';
  const ws2 = 'Mathematik I';
  const group = 'Bista I';
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
  });
  beforeEach(() => {
    cy.visit('/');
  });

  it('prepares context', () => {
    createGroup(group);
    cy.visit('/');
    createWs(ws1, group);
    grantRemovePrivilege([Cypress.env('username')], ws1, [AccessLevel.Admin]);
    clickSave();

    cy.visit('/');
    createWs(ws2, group);
    grantRemovePrivilege([Cypress.env('username')], ws2, [AccessLevel.Admin]);
    clickSave();
  });

  it('chooses profiles from the group ', () => {
    cy.visit('/');
    selectProfileForGroup(group, IqbProfile.DE);
    cy.visit('/');
    selectProfileForGroup(group, IqbProfile.MA);
  });

  it('chooses profile for an area from a group', () => {
    cy.visit('/');
    selectProfileForAreaFromGroup(IqbProfile.DE, ws1, group);
    cy.visit('/');
    selectProfileForAreaFromGroup(IqbProfile.MA, ws2, group);
  });

  it('chooses a profile for an area from workspace', () => {
    cy.visit('/');
    cy.contains(ws1).click();
    selectProfileForArea(IqbProfile.DE);
    cy.visit('/');
    cy.contains(ws2).click();
    selectProfileForArea(IqbProfile.MA);
  });

  it('creates a new Unit in an area', () => {
    cy.visit('/');
    cy.visitWs(ws2);
    addUnit('M1_001');
  });

  it('creates more than one Unit in an area', () => {
    cy.visit('/');
    cy.visitWs(ws1);
    addUnit('D1_001');
    cy.visit('/');
    cy.visitWs(ws1);
    addUnit('D1_002');
  });

  it('adds metadata', () => {
    cy.visitWs(ws2);
    cy.contains('M1_001').should('exist').click();
    getStructure('uMA', false);
    getItem('iMA', false);
    cy.contains('Speichern').click();
  });

  it('adds metadata with more than one element', () => {
    cy.visitWs(ws1);
    cy.contains('D1_001').should('exist').click();
    getStructure('uDE', false);
    getItem('iDE', false);
    getItem('iDE', true);
    getItem('iDE', true, 'iDE');
    cy.contains('Speichern').click();
  });

  it('creates a definition for the unit1', () => {
    cy.visitWs(ws1);
  });

  it('deletes the data', () => {
    cy.visitWs(ws1);
    deleteUnit('D1_001');
    deleteUnit('D1_002');
    cy.visit('/');
    cy.visitWs(ws2);
    deleteUnit('M1_001');
    cy.visit('/');
    deleteGroup(group);
    cy.visit('/');
  });
});
