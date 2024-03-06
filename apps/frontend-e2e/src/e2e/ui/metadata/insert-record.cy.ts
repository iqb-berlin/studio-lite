import {
  addUnit,
  createAreaForGroupFromAdmin,
  createGroupArea, deleteGroupArea, deleteUnit,
  grantRemovePrivilegeOnArea,
  login, logout, visitArea,
  visitLoginPage
} from 'apps/frontend-e2e/src/support/util';
import { adminData } from '../../../support/config/userdata';
import {
  getItem,
  getStructure,
  selectProfilForArea,
  selectProfilForAreaFromGroup,
  selectProfilForGroupFromAdmin
} from '../../../support/metadata-util';
import { IqbProfil } from '../../../support/config/iqbProfil';

describe('add metadata with one item', () => {
  const area = 'Deutsch I';
  const math_area = 'Mathematik I'
  const group = 'Bista I';

  beforeEach(() => {
    cy.viewport(1600, 900);
    visitLoginPage();
  });
  afterEach(()=>{
    visitLoginPage()
  });


  it('prepare context', () => {
    visitLoginPage();
    login(adminData.user_name, adminData.user_pass);
    createGroupArea(group);
    visitLoginPage();
    createAreaForGroupFromAdmin(area, group);
    grantRemovePrivilegeOnArea(adminData.user_name, area);
    visitLoginPage();
    createAreaForGroupFromAdmin(math_area, group);
    grantRemovePrivilegeOnArea(adminData.user_name, math_area);
    visitLoginPage();
    selectProfilForGroupFromAdmin(group, IqbProfil.DE);
    visitLoginPage();
    selectProfilForGroupFromAdmin(group, IqbProfil.MA);
  });

  it('select a profil for an area', () => {
    visitLoginPage();
    cy.contains(area).click();
    selectProfilForArea(IqbProfil.DE);
    visitLoginPage();
    cy.contains(math_area).click();
    selectProfilForArea(IqbProfil.MA);
  });

  //Execute only one of the two test: the previous oder this, not both together
  it.skip('choose a profil for an area from a group', () => {
    visitLoginPage();
    selectProfilForAreaFromGroup(IqbProfil.DE, area, group);
    visitLoginPage();
    selectProfilForAreaFromGroup(IqbProfil.MA, area, group);
  });

  it('create a new Unit in an area', () => {
    visitLoginPage();
    visitArea(math_area)
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
    visitArea(math_area);
    cy.contains('M1_001').should('exist').click();
    getStructure('uMA',false);
    getItem('iMA',false);
    cy.contains('Speichern').click();
  });

  it('add metadata with more than one element', () => {
    visitArea(area);
    cy.contains('D1_001').should('exist').click();
    getStructure('uDE',false);
    getItem('iDE', false);
    getItem('iDE',true);
    cy.contains('Speichern').click();
  });

  it('delete the data', () => {
    visitArea(area);
    deleteUnit('D1_001');
    deleteUnit('D1_002');
    visitLoginPage();
    visitArea(math_area);
    deleteUnit('M1_001');
    visitLoginPage();
    deleteGroupArea(group);
    visitLoginPage();
    logout();
  });
});
