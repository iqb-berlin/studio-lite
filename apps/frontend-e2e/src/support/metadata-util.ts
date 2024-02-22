import { clickButtonToAccept, login } from './util';
import { adminData } from './config/userdata';
import { iqbProfil } from './config/iqbProfil';

export const selectProfilForGroupFromAdmin = (group:string, profil:iqbProfil) => {
  cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
    .should('exist')
    .click();
  cy.get('span:contains("Bereichsgruppen")')
    .eq(0)
    .click();
  cy.get('mat-table')
    .contains(group)
    .click();
  cy.get('mat-icon')
    .contains('settings')
    .click();
  checkProfil(profil);
  clickButtonToAccept('Speichern');
};

export const selectProfilForArea = (profil:iqbProfil) => {
  cy.get('mat-icon:contains("menu")')
    .click();
  cy.get('span:contains("Einstellungen")')
    .click();
  cy.get('svg').eq(2).click();
  cy.get('mat-option>span').contains(profil).click();
  cy.get('svg').eq(3).click();
  cy.get('mat-option>span').contains(profil).click();
  cy.get('mat-dialog-actions > button > span.mdc-button__label:contains("Speichern")').click();
};

export const selectProfilForAreaFromGroup = (profil:iqbProfil, area:string, group:string) => {
  cy.get(`div>div>div>div:contains("${group}")`)
    .eq(0)
    .next()
    .click();
  cy.get('span:contains("Arbeitsbereiche")')
    .eq(0)
    .click();
  cy.get('mat-table')
    .contains(area)
    .click();
  cy.get('mat-icon')
    .contains('settings')
    .click();
  cy.get('mat-select').eq(0).click();
  cy.get(`span:contains(${iqbProfil.mathematikPrimar})`)
    .contains('Aufgabe')
    .click();
  cy.get('mat-select').eq(1).click();
  cy.get(`span:contains(${iqbProfil.mathematikPrimar})`)
    .contains('Item')
    .click();
  clickButtonToAccept('Speichern');
};

export const readStructure = ():void => {

};

export const checkProfil = (profil: string):void => {
  cy.get('mat-panel-title')
    .contains(profil)
    .parent()
    .next()
    .click();
  cy.get('label:contains("Aufgabe")')
    .contains(profil)
    .prev()
    .click();
  cy.get('label:contains("Item")')
    .contains(profil)
    .prev()
    .click();
};
