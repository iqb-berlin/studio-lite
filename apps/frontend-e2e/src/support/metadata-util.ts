import { response } from 'express';
import { clickButtonToAccept, login } from './util';
import { adminData } from './config/userdata';
import { iqbProfil, registryProfile } from './config/iqbProfil';

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
  cy.get(`span:contains(${iqbProfil.MA})`)
    .contains('Aufgabe')
    .click();
  cy.get('mat-select').eq(1).click();
  cy.get(`span:contains(${iqbProfil.MA})`)
    .contains('Item')
    .click();
  clickButtonToAccept('Speichern');
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

export const getStructure = (profile: string):Map<string, string> => {
  const unitMap = new Map<string, string>();
  cy.request({
    method: 'GET',
    url: registryProfile.get(profile)
    // eslint-disable-next-line @typescript-eslint/no-shadow
  }).then(response => {
    expect(response).property('status').to.equal(200);
    const body = JSON.parse(response.body);
    cy.log(typeof body);

    // for (const group of body.groups) {
    //   for (const entry of group.entries) {
    //     unitMap.set(entry.label[0].value, entry.type);
    //   }
    // }

    body.groups.forEach(group => group.entries.forEach(entry => unitMap.set(entry.label[0].value, entry.type)));
    // cy.log(response.body);
    cy.log(body.groups[0].entries[0].label[0].value);
    cy.log(body.groups[0].entries[0].type);
    // eslint-disable-next-line no-restricted-syntax
    for (const key of unitMap.keys()) {
      cy.log(key);
    }
    // TODO
    return unitMap;
    // cy.log(unitMap.keys().next());
  });
  return unitMap;
};

export const getItemStructure = (profil:string) => {
};
