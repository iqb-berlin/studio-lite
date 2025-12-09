import {
  addFirstUser,
  createGroup,
  createWs,
  deleteFirstUser,
  deleteGroup,
  grantRemovePrivilegeAtWs
} from '../../../support/util';
import { selectProfileForGroupFromAdmin } from '../../../support/metadata/metadata-util';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import { AccessLevel } from '../../../support/testData';

describe('UI Metadata Management from administration', () => {
  const area = 'Deutsch II';
  const mathArea = 'Mathematik II';
  const group = 'Bista II';
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
    // cy.resetDb();
  });

  it('prepares context', () => {
    cy.findAdminSettings().click();
    createGroup(group);
    createWs(area, group);
    grantRemovePrivilegeAtWs([Cypress.env('username')], area, [AccessLevel.Admin]);
    createWs(mathArea, group);
    grantRemovePrivilegeAtWs([Cypress.env('username')], mathArea, [AccessLevel.Admin]);
  });
  it('chooses profiles for a Group from the administration settings ', () => {
    selectProfileForGroupFromAdmin(group, IqbProfile.DE);
    selectProfileForGroupFromAdmin(group, IqbProfile.MA);
  });

  it('deletes the data', () => {
    deleteGroup(group);
  });
});
