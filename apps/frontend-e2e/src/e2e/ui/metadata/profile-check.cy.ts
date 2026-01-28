import { checkMultipleProfiles, checkProfile } from '../../../support/metadata/metadata-util';
import { newUser, testGroups } from '../../../support/testData';
import {
  addFirstUser,
  clickIndexTabAdmin,
  clickIndexTabWsgAdmin,
  createGroup,
  createNewUser,
  deleteFirstUser,
  deleteGroup,
  deleteUser
} from '../../../support/helpers';

describe('Metadata Profile Management', () => {
  const groups = [testGroups.metadata.math, testGroups.metadata.german];
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
    // cy.resetDb();
  });

  it('sets up groups and users', () => {
    createNewUser(newUser);
    groups.forEach(area => {
      createGroup(area);
    });
    // cy.wait(200);
  });

  it('loads metadata profile from admin settings', () => {
    const searchProfile: string = 'Deutsch';
    clickIndexTabAdmin('workspace-groups');
    cy.get('mat-table')
      .contains(groups[1])
      .click();
    cy.get('[data-cy="workspaces-groups-menu-edit"]').click();
    checkProfile(searchProfile);
    cy.get('[data-cy="admin-edit-workspace-group-settings-save-button"]').click();
  });

  it('loads and reverts metadata profile from group admin', () => {
    const searchProfile: string = 'Deutsch';
    cy.visit('/');
    cy.get(`div>div>div:contains("${searchProfile}")`)
      .next()
      .click();
    clickIndexTabWsgAdmin('settings');
    checkProfile(searchProfile);
    cy.get('[data-cy="wsg-admin-settings-save-button"]').click();
  });

  it('loads multiple metadata profiles', () => {
    const searchProfiles: string[] = ['Englisch', 'Mathematik'];
    cy.findAdminSettings().click();
    clickIndexTabAdmin('workspace-groups');
    cy.get('mat-table')
      .contains(groups[0])
      .click();
    cy.get('mat-icon')
      .contains('settings')
      .click();
    checkMultipleProfiles(searchProfiles);
    cy.get('[data-cy="admin-edit-workspace-group-settings-save-button"]').click();
  });

  it('cleans up test data', () => {
    deleteUser(newUser.username);
    groups.forEach(group => {
      deleteGroup(group);
    });
  });
});
