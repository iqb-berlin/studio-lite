import {
  addFirstUser,
  createAreaForGroupFromAdmin,
  createGroupArea, deleteFirstUser, deleteGroupArea,
  grantRemovePrivilegeFromGroup,
  login, logout,
  visitLoginPage
} from '../../../support/util/util';
import { adminData } from '../../../support/config/userdata';
import {
  selectProfileForGroupFromAdmin
} from '../../../support/util/metadata/metadata-util';
import { IqbProfile } from '../../../support/util/metadata/iqbProfile';

/* This test is written to probe that we can set the metadata profile
* from administration, and we can add choose the profile from the group.
* They are alternative tests to "choose profiles from the group" and
* "choose a profil for an area from a group" from insert-record.cy.ts */

describe('Metadata Management from administration', () => {
  const area = 'Deutsch II';
  const mathArea = 'Mathematik II';
  const group = 'Bista II';

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
    grantRemovePrivilegeFromGroup(adminData.user_name, area, 'write');
    visitLoginPage();
    createAreaForGroupFromAdmin(mathArea, group);
    grantRemovePrivilegeFromGroup(adminData.user_name, mathArea, 'write');
  });
  it('choose profiles for a Group from the administration settings ', () => {
    visitLoginPage();
    selectProfileForGroupFromAdmin(group, IqbProfile.DE);
    visitLoginPage();
    selectProfileForGroupFromAdmin(group, IqbProfile.MA);
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
