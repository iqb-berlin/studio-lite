import {
  addFirstUser,
  createAreaForGroupFromAdmin,
  createGroupArea, deleteFirstUser, deleteGroupArea,
  grantRemovePrivilegeOnArea,
  login, logout,
  visitLoginPage
} from 'apps/frontend-e2e/src/support/util';
import { adminData } from '../../../support/config/userdata';
import {
  selectProfileForArea,
  selectProfileForGroupFromAdmin
} from '../../../support/metadata-util';
import { IqbProfile } from '../../../support/config/iqbProfile';

/* This test is written to probe that we can set the metadata profile
* from administration, and we can add choose the profile from the group.
* They are alternative tests to "choose profiles from the group" and
* "choose a profil for an area from a group" from insert-record.cy.ts */

describe('Metadata Management from administration', () => {
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
  it.skip('choose a profile for an area', () => {
    visitLoginPage();
    cy.contains(area).click();
    selectProfileForArea(IqbProfile.DE);
    visitLoginPage();
    cy.contains(mathArea).click();
    selectProfileForArea(IqbProfile.MA);
  });
  it('delete the data', () => {
    visitLoginPage();
    deleteGroupArea(group);
    visitLoginPage();
    deleteFirstUser();
    visitLoginPage();
    logout();
  });
});
