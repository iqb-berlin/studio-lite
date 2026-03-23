import { selectProfileForGroupFromAdmin } from '../../../support/metadata/metadata-util';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import { AccessLevel, testWorkspaces } from '../../../support/testData';
import {
  addFirstUser,
  createGroup,
  createWs,
  deleteFirstUser,
  deleteGroup,
  grantRemovePrivilegeAtWs
} from '../../../support/helpers';

describe('Metadata Profile Management from Admin', () => {
  const area = 'Deutsch II';
  const mathArea = testWorkspaces.metadata.math2;
  const group = 'Bista II';
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
    cy.resetDb();
  });

  it('sets up workspaces in group', () => {
    createGroup(group);
    createWs(area, group);
    grantRemovePrivilegeAtWs([Cypress.env('username')], area, [AccessLevel.Admin]);
    createWs(mathArea, group);
    grantRemovePrivilegeAtWs([Cypress.env('username')], mathArea, [AccessLevel.Admin]);
  });
  it('assigns metadata profiles to group from admin settings', () => {
    selectProfileForGroupFromAdmin(group, IqbProfile.DE);
    selectProfileForGroupFromAdmin(group, IqbProfile.MA);
  });

  it('cleans up test data', () => {
    deleteGroup(group);
  });
});
