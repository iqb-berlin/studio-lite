/// <reference types="cypress" />
import {
  addFirstUser,
  addUnit,
  createGroup,
  createWs,
  deleteFirstUser,
  deleteGroup,
  deleteUnit2,
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
    grantRemovePrivilege(Cypress.env('username'), ws1, AccessLevel.Admin);

    cy.visit('/');
    createWs(ws2, group);
    grantRemovePrivilege(Cypress.env('username'), ws2, AccessLevel.Admin);
  });

  it('chooses profiles from the group ', () => {
    cy.visit('/');
    selectProfileForGroup(group, IqbProfile.DE);
    cy.visit('/');
    selectProfileForGroup(group, IqbProfile.MA);
  });
  // Execute only one of the two test: the previous oder this, not both together

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
    cy.contains('Speichern').click();
  });

  it('deletes the data', () => {
    cy.visitWs(ws1);
    deleteUnit2('D1_001');
    deleteUnit2('D1_002');
    cy.visit('/');
    cy.visitWs(ws2);
    deleteUnit2('M1_001');
    cy.visit('/');
    deleteGroup(group);
    cy.visit('/');
  });
});
