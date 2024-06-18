/// <reference types="cypress" />
import {
  addFirstUser,
  createGroup,
  createNewUser,
  deleteFirstUser,
  deleteGroup,
  deleteUser
} from '../../../support/util/util';
import { userData } from '../../../support/config/userdata';
import { checkMultipleProfiles, checkProfile } from '../../../support/util/metadata/metadata-util';

describe('Load metadata profile', () => {
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
  });
  beforeEach(() => {
    cy.visit('/');
  });

  it('user admin prepare the Context', () => {
    createNewUser(userData.user_name, userData.user_pass);
    cy.visit('/');
    const areaGroups = ['Mathematik Primär und Sek I',
      'Deutsch Primär und Sek I',
      'Französisch Sek I',
      'Englisch Sek I'];
    areaGroups.forEach(area => {
      createGroup(area);
      cy.visit('/');
    });
  });

  it('should be possible load a metadata profile from administration settings', () => {
    const searchProfile:string = 'Deutsch';
    cy.get('[data-cy="goto-admin"]').click();
    cy.get('span:contains("Bereichsgruppen")')
      .eq(0)
      .click();
    cy.get('mat-table')
      .contains('Mathematik')
      .click();
    cy.get('mat-icon')
      .contains('settings')
      .click();

    checkProfile(searchProfile);
    //  cy.pause();
    cy.dialogButtonToContinue('Speichern', 200, '/api/admin/workspace-groups/', 'PATCH', 'setProfile');
  });

  it('should be possible load a metadata profile from workspace', () => {
    const searchProfile:string = 'Französisch';
    cy.get(`div>div>div:contains("${searchProfile}")`)
      .next()
      .click();
    cy.get('span:contains("Einstellungen")')
      .eq(0)
      .click();
    checkProfile(searchProfile);
  });

  // rewrite TODO
  it('should be possible load more metadata profile', () => {
    const searchProfiles:string[] = ['Englisch', 'Mathematik'];
    cy.get('[data-cy="goto-admin"]').click();
    cy.get('span:contains("Bereichsgruppen")')
      .eq(0)
      .click();
    cy.get('mat-table')
      .contains('Mathematik')
      .click();
    cy.get('mat-icon')
      .contains('settings')
      .click();
    // searchProfiles.forEach(searchProfile => {
    checkMultipleProfiles(searchProfiles);
    // });
    cy.dialogButtonToContinue('Speichern', 200, '/api/admin/workspace-groups/', 'PATCH', 'setProfile');
  });

  it('remove the Context', () => {
    deleteUser(userData.user_name);
    cy.visit('/');
    const areaGroups = ['Mathematik Primär und Sek I',
      'Deutsch Primär und Sek I',
      'Französisch Sek I',
      'Englisch Sek I'
    ];
    areaGroups.forEach(area => {
      deleteGroup(area);
      cy.visit('/');
    });
  });
});
