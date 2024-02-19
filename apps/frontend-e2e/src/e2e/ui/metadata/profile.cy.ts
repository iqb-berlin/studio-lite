import { clickButtonToAccept, insertCredentials, visitLoginPage } from '../../../support/util';
import { adminData } from '../../../support/config/userdata';

describe('Load metadata profile', () => {
  beforeEach(() => {
    cy.viewport(1600, 900);
    visitLoginPage();
  });
  it('should be possible load a metadata profile', () => {
    const searchProfile:string = 'Mathematik';
    insertCredentials(adminData.user_name, adminData.user_pass);
    clickButtonToAccept('Weiter');
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
    cy.get('mat-panel-title')
      .contains(searchProfile)
      .parent()
      .next()
      .click();
    cy.get('label')
      .contains('Aufgabe')
      .contains(searchProfile)
      .prev()
      .click();
    cy.get('label')
      .contains('Item')
      .contains(searchProfile)
      .prev()
      .click();
    clickButtonToAccept('Speichern');
  });
  it.skip('should be possible load all metadata profile', () => {
    const searchProfiles:string[] = ['Englisch', 'Französisch', 'Deutsch', 'Mathematik'];
    insertCredentials(adminData.user_name, adminData.user_pass);
    clickButtonToAccept('Weiter');
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
    searchProfiles.forEach(searchProfile => {
      cy.get('mat-panel-title')
        .contains(searchProfile)
        .parent()
        .next()
        .click();
      cy.get('label')
        .contains(searchProfile)
        .eq(0)
        .prev()
        .click();
      cy.get('label')
        .contains(searchProfile)
        .eq(1)
        .prev()
        .click();
    });
    clickButtonToAccept('Speichern');
  });
});
