/// <reference types="cypress" />
import {
  addFirstUser,
  addUnit,
  createWs,
  createGroup, deleteFirstUser, deleteGroup, deleteUnit2,
  grantRemovePrivilege
} from '../../../support/util/util';
import {
  getItem,
  getStructure, selectProfileForArea,
  selectProfileForAreaFromGroup,
  selectProfileForGroup
} from '../../../support/util/metadata/metadata-util';
import { IqbProfile } from '../../../support/util/metadata/iqbProfile';

describe('Metadata Management', () => {
  const area = 'Deutsch I';
  const mathArea = 'Mathematik I';
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

  it('prepare context', () => {
    createGroup(group);
    cy.visit('/');
    createWs(area, group);
    grantRemovePrivilege(Cypress.env('username'), area, 'write');

    cy.visit('/');
    createWs(mathArea, group);
    grantRemovePrivilege(Cypress.env('username'), mathArea, 'write');
  });

  it('choose profiles from the group ', () => {
    cy.visit('/');
    selectProfileForGroup(group, IqbProfile.DE);
    cy.visit('/');
    selectProfileForGroup(group, IqbProfile.MA);
  });
  // Execute only one of the two test: the previous oder this, not both together

  it('choose profile for an area from a group', () => {
    cy.visit('/');
    selectProfileForAreaFromGroup(IqbProfile.DE, area, group);
    cy.visit('/');
    selectProfileForAreaFromGroup(IqbProfile.MA, mathArea, group);
  });

  it('choose a profile for an area from workspace', () => {
    cy.visit('/');
    cy.contains(area).click();
    selectProfileForArea(IqbProfile.DE);
    cy.visit('/');
    cy.contains(mathArea).click();
    selectProfileForArea(IqbProfile.MA);
  });

  it('create a new Unit in an area', () => {
    cy.visit('/');
    cy.visitWs(mathArea);
    addUnit('M1_001');
  });

  it('create more than one Unit in an area', () => {
    cy.visit('/');
    cy.visitWs(area);
    addUnit('D1_001');
    cy.visit('/');
    cy.visitWs(area);
    addUnit('D1_002');
  });

  it('add metadata', () => {
    cy.visitWs(mathArea);
    cy.contains('M1_001').should('exist').click();
    getStructure('uMA', false);
    getItem('iMA', false);
    cy.contains('Speichern').click();
  });

  it('add metadata with more than one element', () => {
    cy.visitWs(area);
    cy.contains('D1_001').should('exist').click();
    getStructure('uDE', false);
    getItem('iDE', false);
    getItem('iDE', true);
    cy.contains('Speichern').click();
  });

  it('delete the data', () => {
    cy.visitWs(area);
    deleteUnit2('D1_001');
    deleteUnit2('D1_002');
    cy.visit('/');
    cy.visitWs(mathArea);
    deleteUnit2('M1_001');
    cy.visit('/');
    deleteGroup(group);
    cy.visit('/');
  });
});
