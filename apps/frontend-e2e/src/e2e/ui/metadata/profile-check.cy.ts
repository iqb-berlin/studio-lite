import {
  addFirstUser,
  clickButtonToAccept,
  createGroupArea,
  createNewUser,
  deleteFirstUser,
  deleteGroupArea,
  deleteUser,
  login,
  logout,
  visitLoginPage
} from '../../../support/util';
import { adminData, userData } from '../../../support/config/userdata';
import { checkProfile } from '../../../support/metadata-util';

describe('Load metadata profile', () => {
  beforeEach(() => {
    cy.viewport(1600, 900);
    visitLoginPage();
  });

  it('user admin prepare the Context', () => {
    addFirstUser();
    login(adminData.user_name, adminData.user_pass);
    createNewUser(userData.user_name, userData.user_pass);
    visitLoginPage();
    const areaGroups = ['Mathematik Primär und Sek I',
      'Deutsch Primär und Sek I',
      'Französisch Sek I',
      'Englisch Sek I'];
    areaGroups.forEach(area => {
      createGroupArea(area);
      cy.wait(400);
      visitLoginPage();
    });
    logout();
  });

  it('should be possible load a metadata profile from General administration', () => {
    const searchProfile:string = 'Deutsch';
    login(adminData.user_name, adminData.user_pass);
    cy.get('mat-icon:contains("setting")')
      .eq(0)
      .should('exist')
      .click();
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
    clickButtonToAccept('Speichern');
    visitLoginPage();
    logout();
  });

  it('should be possible load a metadata profile from Group administration', () => {
    const searchProfile:string = 'Französisch';
    login(adminData.user_name, adminData.user_pass);
    cy.get(`div>div>div:contains("${searchProfile}")`)
      .next()
      .click();
    cy.get('span:contains("Einstellungen")')
      .eq(0)
      .click();
    checkProfile(searchProfile);
    visitLoginPage();
    logout();
  });

  it.skip('should be possible load more metadata profile', () => {
    const searchProfiles:string[] = ['Englisch', 'Französisch'];
    login(adminData.user_name, adminData.user_pass);
    cy.get('mat-icon:contains("settings")')
      .eq(0)
      .should('exist')
      .click();
    cy.get('span:contains("Bereichsgruppen")')
      .eq(0)
      .click();
    cy.get('mat-table')
      .contains('Mathematik')
      .click();
    cy.get('mat-icon')
      .contains('settings')
      .click();
    searchProfiles.forEach(searchProfile => {
      checkProfile(searchProfile);
    });
    clickButtonToAccept('Speichern');
    visitLoginPage();
    logout();
  });

  it.only('remove the Context', () => {
    login(adminData.user_name, adminData.user_pass);
    deleteUser(userData.user_name);
    visitLoginPage();
    const areaGroups = ['Mathematik Primär und Sek I',
      'Deutsch Primär und Sek I',
      'Französisch Sek I',
      'Englisch Sek I'
    ];
    areaGroups.forEach(area => {
      deleteGroupArea(area);
      visitLoginPage();
    });
    visitLoginPage();
    deleteFirstUser();
    visitLoginPage();
    logout();
  });
});
