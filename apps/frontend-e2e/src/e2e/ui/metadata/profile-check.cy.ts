import { checkMultipleProfiles } from '../../../support/metadata/metadata-util';
import { standardUser, metadataMathGroup, metadataGermanGroup } from '../../../support/testData';
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
  const groups = [metadataMathGroup, metadataGermanGroup];
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
  });

  it('sets up groups and users', () => {
    createNewUser(standardUser);
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
    // Each profile once, as its checkbox: no panel title repeating its name (#1549)
    cy.get('[data-cy="shared-profiles-select-profile-title"]').should('not.exist');
    searchProfiles.forEach(profile => {
      cy.get('[data-cy="shared-profiles-select-profile"]')
        .filter(`:contains(${profile})`)
        .should('have.length', 1);
    });
    cy.get('[data-cy="admin-edit-workspace-group-settings-save-button"]').click();
  });

  it('loads and reverts metadata profile from group admin', () => {
    const searchProfiles: string[] = [
      'IQB Deutsch Primar - Aufgabe',
      'IQB Deutsch Primar - Item'
    ];
    cy.visit('/');
    cy.get(`div>div>div:contains("${metadataGermanGroup}")`)
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
      .contains(metadataMathGroup)
      .click();
    cy.get('mat-icon')
      .contains('settings')
      .click();
    checkMultipleProfiles(searchProfiles);
    cy.get('[data-cy="admin-edit-workspace-group-settings-save-button"]').click();
  });

  it('cleans up test data', () => {
    deleteUser(standardUser.username);
    deleteGroup(groups[0]);
    deleteGroup(groups[1]);
  });
});
