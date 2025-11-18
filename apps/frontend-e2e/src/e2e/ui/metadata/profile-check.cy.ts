import {
  addFirstUser,
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
  });

  it('user admin prepares the Context', () => {
    createNewUser(newUser);
    cy.visit('/');
    groups.forEach(area => {
      createGroup(area);
      cy.visit('/');
    });
    cy.wait(100);
  });

  it('should be possible load a metadata profile from administration settings', () => {
    const searchProfile:string = 'Deutsch';
    cy.findAdminSettings().click();
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
    // cy.clickButtonWithResponseCheck('Speichern', 200, '/api/admin/workspace-groups/', 'PATCH', 'setProfile');
    cy.clickButton('Speichern');
  });

  it('should be possible load a metadata profile from workspace', () => {
    const searchProfile:string = 'Deutsch';
    cy.visit('/');
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
    cy.findAdminSettings().click();
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
    // cy.clickButtonWithResponseCheck('Speichern', 200, '/api/admin/workspace-groups/', 'PATCH', 'setProfile');
    cy.clickButton('Speichern');
  });

  it('removes the Context', () => {
    cy.visit('/');
    deleteUser(newUser.username);
    cy.visit('/');
    groups.forEach(group => {
      deleteGroup(group);
      cy.visit('/');
    });
  });
});
