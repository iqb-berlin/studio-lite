import {
  addFirstUser,
  addUnit,
  createAreaForGroupFromAdmin,
  createGroupArea, deleteFirstUser, deleteGroupArea, deleteUnit,
  grantRemovePrivilegeOnArea,
  login, logout, visitArea,
  visitLoginPage
} from 'apps/frontend-e2e/src/support/util';
import { adminData } from '../../../support/config/userdata';
import {
  getItem,
  getStructure,
  selectProfileForArea,
  selectProfileForAreaFromGroup,
  selectProfileForGroupFromAdmin, selectProfileForGroup
} from '../../../support/metadata-util';
import { IqbProfile } from '../../../support/config/iqbProfile';

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
    createGroupArea(group);
    visitLoginPage();
    createAreaForGroupFromAdmin(area, group);
    grantRemovePrivilegeOnArea(adminData.user_name, area);
    visitLoginPage();
    createAreaForGroupFromAdmin(mathArea, group);
    grantRemovePrivilegeOnArea(adminData.user_name, mathArea);
  });
  it('choose profiles from the administration ', () => {
    visitLoginPage();
    selectProfileForGroupFromAdmin(group, IqbProfile.DE);
    visitLoginPage();
    selectProfileForGroupFromAdmin(group, IqbProfile.MA);
  });

  it.skip('choose profiles from the group ', () => {
    visitLoginPage();
    selectProfileForGroup(group, IqbProfile.DE);
    visitLoginPage();
    selectProfileForGroup(group, IqbProfile.MA);
  });
  // Execute only one of the two test: the previous oder this, not both together
  it('choose a profil for an area from a group', () => {
    visitLoginPage();
    selectProfileForAreaFromGroup(IqbProfile.DE, area, group);
    visitLoginPage();
    selectProfileForAreaFromGroup(IqbProfile.MA, mathArea, group);
  });

  it.skip('choose a profile for an area', () => {
    visitLoginPage();
    cy.contains(area).click();
    selectProfileForArea(IqbProfile.DE);
    visitLoginPage();
    cy.contains(mathArea).click();
    selectProfileForArea(IqbProfile.MA);
  });

  it('create a new Unit in an area', () => {
    visitLoginPage();
    visitArea(mathArea);
    addUnit('M1_001');
  });

  it('create more than one Unit in an area', () => {
    visitLoginPage();
    visitArea(area);
    addUnit('D1_001');
    visitLoginPage();
    visitArea(area);
    addUnit('D1_002');
  });

  it('add metadata', () => {
    visitArea(mathArea);
    cy.contains('M1_001').should('exist').click();
    getStructure('uMA', false);
    getItem('iMA', false);
    cy.contains('Speichern').click();
  });

  it('add metadata with more than one element', () => {
    visitArea(area);
    cy.contains('D1_001').should('exist').click();
    getStructure('uDE', false);
    getItem('iDE', false);
    getItem('iDE', true);
    cy.contains('Speichern').click();
  });

  it('delete the data', () => {
    visitArea(area);
    deleteUnit('D1_001');
    deleteUnit('D1_002');
    visitLoginPage();
    visitArea(mathArea);
    deleteUnit('M1_001');
    visitLoginPage();
    deleteGroupArea(group);
    visitLoginPage();
    deleteFirstUser();
    logout();
  });
});
