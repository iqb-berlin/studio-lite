import {
  clickButtonToAccept, login, logout, visitLoginPage
} from '../../../support/util';
import { adminData } from '../../../support/config/userdata';
import { checkProfil } from '../../../support/metadata-util';

describe('Load metadata profile', () => {
  beforeEach(() => {
    cy.viewport(1600, 900);
    visitLoginPage();
  });
  afterEach(logout);

  it.skip('should be possible load a metadata profile from General administration', () => {
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
    checkProfil(searchProfile);
    clickButtonToAccept('Speichern');
  });

  it('should be possible load a metadata profile from Group administration', () => {
    const searchProfile:string = 'Französisch';
    login(adminData.user_name, adminData.user_pass);
    cy.get(`div:contains("${searchProfile}")`)
      .should('exist')
      .click();
    cy.get('span:contains("Einstellungen")')
      .click();
    checkProfil(searchProfile);
    clickButtonToAccept('Speichern');
  });

  it.skip('should be possible load all metadata profile', () => {
    const searchProfiles:string[] = ['Englisch', 'Französisch', 'Deutsch', 'Mathematik'];
    login(adminData.user_name, adminData.user_pass);
    cy.get('mat-icon:contains("settings")')
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
      checkProfil(searchProfile);
    });
    clickButtonToAccept('Speichern');
  });
});
