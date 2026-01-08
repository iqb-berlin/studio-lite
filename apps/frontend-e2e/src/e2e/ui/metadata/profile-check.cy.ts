import {
  addFirstUser,
  clickIndexTabAdmin,
  clickIndexTabWsgAdmin,
  createGroup,
  createNewUser,
  deleteFirstUser,
  deleteGroup,
  deleteUser
} from '../../../support/util';
import { checkMultipleProfiles, checkProfile } from '../../../support/metadata/metadata-util';
import { newUser } from '../../../support/testData';

describe('Load metadata profile', () => {
  const groups = ['Mathematik Primär und Sek I',
    'Deutsch Primär und Sek I'];
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
    // cy.resetDb();
  });

  it('user admin prepares the Context', () => {
    createNewUser(newUser);
    groups.forEach(area => {
      createGroup(area);
    });
    cy.wait(200);
  });

  it('should be possible load a metadata profile from administration settings', () => {
    const searchProfile:string = 'Deutsch';
    clickIndexTabAdmin('workspace-groups');
    cy.get('mat-table')
      .contains(groups[1])
      .click();
    cy.get('[data-cy="workspaces-groups-menu-edit"]').click();
    checkProfile(searchProfile);
    cy.get('[data-cy="admin-edit-workspace-group-settings-save-button"]').click();
  });

  it('should be possible load a metadata profile from wsg-admin and revert it', () => {
    const searchProfile:string = 'Deutsch';
    cy.visit('/');
    cy.get(`div>div>div:contains("${searchProfile}")`)
      .next()
      .click();
    clickIndexTabWsgAdmin('settings');
    checkProfile(searchProfile);
    cy.get('[data-cy="wsg-admin-settings-save-button"]').click();
  });

  it('should be possible load more metadata profile', () => {
    const searchProfiles:string[] = ['Englisch', 'Mathematik'];
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

  it('removes the Context', () => {
    deleteUser(newUser.username);
    groups.forEach(group => {
      deleteGroup(group);
    });
  });
});
