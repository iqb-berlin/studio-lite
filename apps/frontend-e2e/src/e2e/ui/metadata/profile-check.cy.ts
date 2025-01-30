/// <reference types="cypress" />
import {
  addFirstUser,
  createGroup,
  createNewUser,
  deleteFirstUser,
  deleteGroup,
  deleteUser
} from '../../../support/util';
import { checkMultipleProfiles, checkProfile } from '../../../support/metadata/metadata-util';
import { UserData } from '../../../support/testData';

describe('Load metadata profile', () => {
  const groups = ['Mathematik Primär und Sek I',
    'Deutsch Primär und Sek I',
    'Englisch Sek I'];
  const newUser: UserData = {
    username: 'normaluser',
    password: '5678'
  };
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
  });
  beforeEach(() => {
    cy.visit('/');
  });

  it('user admin prepares the Context', () => {
    createNewUser(newUser);
    cy.visit('/');
    groups.forEach(area => {
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
      .contains(groups[0])
      .click();
    cy.get('mat-icon')
      .contains('settings')
      .click();
    checkProfile(searchProfile);
    cy.dialogButtonToContinue('Speichern', 200, '/api/admin/workspace-groups/', 'PATCH', 'setProfile');
  });

  it('should be possible load a metadata profile from workspace', () => {
    const searchProfile:string = 'Deutsch';
    cy.get(`div>div>div:contains("${searchProfile}")`)
      .next()
      .click();
    cy.get('span:contains("Einstellungen")')
      .eq(0)
      .click();
    checkProfile(searchProfile);
  });

  it('should be possible load more metadata profile', () => {
    const searchProfiles:string[] = ['Englisch', 'Mathematik'];
    cy.get('[data-cy="goto-admin"]').click();
    cy.get('span:contains("Bereichsgruppen")')
      .eq(0)
      .click();
    cy.get('mat-table')
      .contains(groups[0])
      .click();
    cy.get('mat-icon')
      .contains('settings')
      .click();
    checkMultipleProfiles(searchProfiles);
    cy.dialogButtonToContinue('Speichern', 200, '/api/admin/workspace-groups/', 'PATCH', 'setProfile');
  });

  it('removes the Context', () => {
    deleteUser(newUser.username);
    cy.visit('/');
    groups.forEach(group => {
      deleteGroup(group);
      cy.visit('/');
    });
  });
});
