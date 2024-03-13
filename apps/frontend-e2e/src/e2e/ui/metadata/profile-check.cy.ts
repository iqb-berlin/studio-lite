import {
  clickButtonToAccept, createGroupArea, createNewUser, deleteGroupArea, deleteUser, login, logout, visitLoginPage
} from '../../../support/util';
import { adminData, userData } from '../../../support/config/userdata';
import { checkProfile } from '../../../support/metadata-util';

describe('Load metadata profile', () => {
  beforeEach(() => {
    cy.viewport(1600, 900);
    visitLoginPage();
  });
  afterEach(() => {
    visitLoginPage();
    logout();
  });

  it('user admin prepare the Context', () => {
    login(adminData.user_name, adminData.user_pass);
    createNewUser(userData.user_name, userData.user_pass);
    visitLoginPage();
    const areaGroups = ['Mathematik Primär und Sek I',
      'Deutsch Primär und Sek I',
      'Französisch Sek I',
      'Englisch Sek I'];
    areaGroups.forEach(area => {
      createGroupArea(area);
      visitLoginPage();
    });
  });

  it('should be possible load a metadata profile from General administration', () => {
    const searchProfile:string = 'Deutsch';
    login(adminData.user_name, adminData.user_pass);
    cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
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
  });

  it('should be possible load all metadata profile', () => {
    const searchProfiles:string[] = ['Englisch', 'Französisch', 'Deutsch', 'Mathematik'];
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
  });

  it('remove the Context', () => {
    cy.pause();
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
  });
});
