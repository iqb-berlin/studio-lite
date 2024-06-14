/// <reference types="cypress" />
import {
  addFirstUser,
  addUnit,
  createWs,
  createGroup, deleteFirstUser, deleteGroup, deleteUnit,
  grantRemovePrivilege,
  login, logout, visitWs,
  visitLoginPage
} from '../../../support/util/util';
import { adminData } from '../../../support/config/userdata';
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

  beforeEach(() => {
    cy.viewport(1600, 900);
    visitLoginPage();
  });
  afterEach(() => {
    visitLoginPage();
  });

  it('prepare context', () => {
    addFirstUser();
    visitLoginPage();
    login(adminData.user_name, adminData.user_pass);
    createGroup(group);
    visitLoginPage();
    createWs(area, group);
    grantRemovePrivilege(adminData.user_name, area, 'write');
    visitLoginPage();
    createWs(mathArea, group);
    grantRemovePrivilege(adminData.user_name, mathArea, 'write');
  });

  it('choose profiles from the group ', () => {
    visitLoginPage();
    selectProfileForGroup(group, IqbProfile.DE);
    visitLoginPage();
    selectProfileForGroup(group, IqbProfile.MA);
  });
  // Execute only one of the two test: the previous oder this, not both together

  it('choose profile for an area from a group', () => {
    visitLoginPage();
    selectProfileForAreaFromGroup(IqbProfile.DE, area, group);
    visitLoginPage();
    selectProfileForAreaFromGroup(IqbProfile.MA, mathArea, group);
  });

  it('choose a profile for an area from workspace', () => {
    visitLoginPage();
    cy.contains(area).click();
    selectProfileForArea(IqbProfile.DE);
    visitLoginPage();
    cy.contains(mathArea).click();
    selectProfileForArea(IqbProfile.MA);
  });

  it('create a new Unit in an area', () => {
    visitLoginPage();
    visitWs(mathArea);
    addUnit('M1_001');
  });

  it('create more than one Unit in an area', () => {
    visitLoginPage();
    visitWs(area);
    addUnit('D1_001');
    visitLoginPage();
    visitWs(area);
    addUnit('D1_002');
  });

  it('add metadata', () => {
    visitWs(mathArea);
    cy.contains('M1_001').should('exist').click();
    getStructure('uMA', false);
    getItem('iMA', false);
    cy.contains('Speichern').click();
  });

  it('add metadata with more than one element', () => {
    visitWs(area);
    cy.contains('D1_001').should('exist').click();
    getStructure('uDE', false);
    getItem('iDE', false);
    getItem('iDE', true);
    cy.contains('Speichern').click();
  });

  it('delete the data', () => {
    visitWs(area);
    deleteUnit('D1_001');
    deleteUnit('D1_002');
    visitLoginPage();
    visitWs(mathArea);
    deleteUnit('M1_001');
    visitLoginPage();
    deleteGroup(group);
    visitLoginPage();
    deleteFirstUser();
    visitLoginPage();
    logout();
  });
});
