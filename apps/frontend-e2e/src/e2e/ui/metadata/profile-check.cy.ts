import { checkMultipleProfiles } from '../../../support/metadata/metadata-util';
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
  });

  it('sets up groups and users', () => {
    createNewUser(newUser);
    groups.forEach(area => {
      createGroup(area);
    });
    // cy.wait(200);
  });

  it('loads metadata profile from admin settings', () => {
    const searchProfiles: string[] = [
      'IQB Deutsch Primar - Aufgabe',
      'IQB Deutsch Primar - Item'
    ];
    clickIndexTabAdmin('workspace-groups');
    cy.get('mat-table')
      .contains(groups[1])
      .click();
    cy.get('[data-cy="workspaces-groups-menu-edit"]').click();
    checkMultipleProfiles(searchProfiles);
    cy.get('[data-cy="admin-edit-workspace-group-settings-save-button"]').click();
  });

  it('loads and reverts metadata profile from group admin', () => {
    const searchProfiles: string[] = [
      'IQB Deutsch Primar - Aufgabe',
      'IQB Deutsch Primar - Item'
    ];
    cy.visit('/');
    cy.get(`div>div>div:contains("${testGroups.metadata.german}")`)
      .next()
      .click();
    clickIndexTabWsgAdmin('settings');
    checkMultipleProfiles(searchProfiles);
    cy.get('[data-cy="wsg-admin-settings-save-button"]').click();
  });

  it('loads multiple metadata profiles', () => {
    const searchProfiles: string[] = [
      'IQB Mathematik Primar - Aufgabe',
      'IQB Mathematik Primar - Item',
      'IQB Deutsch Primar - Aufgabe',
      'IQB Deutsch Primar - Item'
    ];
    cy.findAdminSettings().click();
    clickIndexTabAdmin('workspace-groups');
    cy.get('mat-table')
      .contains(testGroups.metadata.math)
      .click();
    cy.get('mat-icon')
      .contains('settings')
      .click();
    checkMultipleProfiles(searchProfiles);
    cy.get('[data-cy="admin-edit-workspace-group-settings-save-button"]').click();
  });

  it('cleans up test data', () => {
    deleteUser(newUser.username);
    deleteGroup(groups[0]);
    deleteGroup(groups[1]);
  });
});
