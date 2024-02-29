import { response } from 'express';
import { clickButtonToAccept, login } from './util';
import { adminData } from './config/userdata';
import { IqbProfil, IqbProfilExamples, RegistryProfile} from './config/iqbProfil';

function getCheckBoxByName(name: string, level:number = 1, additionalText: string = '') {
  cy.log(typeof name);
  if (typeof name!=="undefined") {
    cy.get('mat-tree-node>div>span').contains(name).prev().then(($actualElem) => {
            if ($actualElem.is('mat-checkbox')){
              cy.wrap($actualElem).click();
            }else{
              cy.wrap($actualElem).prev().click()
            }
    });
    cy.get('.mat-mdc-dialog-actions').contains('Bestätigen').click();
  }else{
    cy.get('.mat-mdc-dialog-actions').contains('Abbrechen').click();
  }
}

function getTimeNumber(time: string, propName:string, profile:string, moreThanOne:boolean):any {
  if (time.split(':').length!==1) {
    const minAuf = time.split(':')[0];
    const secAuf = time.split(':')[1];
    if (moreThanOne)
      cy.get('div.label.ng-star-inserted')
        .contains(propName)
        .prevUntil('.duration-container > div > mat-form-field > div')
        .find('input')
        .eq(-1).as('aufgabenzeit');
    else
      cy.get('div.label.ng-star-inserted')
        .contains(propName)
        .prevUntil('.duration-container > div > mat-form-field > div')
        .find('input')
        .as('aufgabenzeit');
    if (minAuf !== '00' && typeof minAuf !== 'undefined') {
      cy.get('@aufgabenzeit')
        .eq(0)
        .type(minAuf);
    }
    if (secAuf !== '00' && typeof secAuf !== 'undefined') {
      cy.get('@aufgabenzeit')
        .eq(1)
        .type(secAuf);
    }
  }else{
    cy.get(`mat-label:contains("${propName}")`).type(IqbProfilExamples.get(profile).get(propName));
  }
}


export const selectProfilForGroupFromAdmin = (group:string, profil:IqbProfil) => {
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

export const selectProfilForArea = (profil:IqbProfil) => {
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

export const selectProfilForAreaFromGroup = (profil:IqbProfil, area:string, group:string) => {
  //no funciona
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
  cy.get(`span:contains(${IqbProfil.DE})`)
    .contains('Aufgabe')
    .click();
  cy.get('mat-select').eq(1).click();
  cy.get(`span:contains(${IqbProfil.DE})`)
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

export const getStructure = (profile: string, moreThanOne: boolean): void => {
  cy.request({
    method: 'GET',
    url: RegistryProfile.get(profile)
    // eslint-disable-next-line @typescript-eslint/no-shadow
  }).then(response => {
    let unitMap = new Map<string, string>();
    expect(response).property('status').to.equal(200);
    const body = JSON.parse(response.body);
    body.groups.forEach(group => group.entries.forEach(entry => unitMap.set(entry.label[0].value, entry.type)));
    for (const key of unitMap.keys()) cy.log(key);
    unitMap.forEach((type:string, fieldName:string) => {
      cy.log(IqbProfilExamples.get(profile).get(fieldName));
      if (IqbProfilExamples.get(profile).get(fieldName)!=("undefined"&&"")){
        switch (type) {
          case 'number': {
            getTimeNumber(IqbProfilExamples.get(profile).get(fieldName), fieldName, profile, moreThanOne);
            break;
          }
          case 'vocabulary': {
            if (moreThanOne)
              cy.get(`mat-label:contains("${fieldName}")`).eq(-1).click();
            else
              cy.get(`mat-label:contains("${fieldName}")`).click();
            getCheckBoxByName(IqbProfilExamples.get(profile).get(fieldName));
            break;
          }
          default: {
            if (moreThanOne)
              cy.get(`mat-label:contains("${fieldName}")`).eq(-1).type(IqbProfilExamples.get(profile).get(fieldName));
            else
              cy.get(`mat-label:contains("${fieldName}")`).type(IqbProfilExamples.get(profile).get(fieldName));
            break;
          }
        }
      }
    });
  });
};

export const getItem = (profile:string, moreThanOne: boolean) => {
  cy.get('.add-button > .mdc-button__label').click();
  if (moreThanOne === true){
    cy.get('mat-expansion-panel:contains("ohne ID")').click();
    cy.get('mat-label:contains("Item ID *")').eq(-1).type(IqbProfilExamples.get(profile).get('Item ID'));
    cy.get('mat-label:contains("Wichtung")').eq(-1).type(IqbProfilExamples.get(profile).get('Wichtung'));
    cy.get('mat-label:contains("Notiz")').eq(-1).type(IqbProfilExamples.get(profile).get('Notiz'));
    getStructure(profile, moreThanOne);
  }else {
    cy.get('mat-expansion-panel:contains("ohne ID")').click();
    cy.get('mat-label:contains("Item ID *")').type(IqbProfilExamples.get(profile).get('Item ID'));
    cy.get('mat-label:contains("Wichtung")').type(IqbProfilExamples.get(profile).get('Wichtung'));
    cy.get('mat-label:contains("Notiz")').eq(1).type(IqbProfilExamples.get(profile).get('Notiz'));
    getStructure(profile, moreThanOne);
    //cy.get('span.mat-expansion-indicator').click();
  }
};
