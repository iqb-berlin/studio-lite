import Chainable = Cypress.Chainable;
import { adminData, userData } from './config/userdata';

export const visitLoginPage = (): Chainable => cy.url()
  .then(() => {
    cy.visit(<string>Cypress.config().baseUrl);
  });

export const login = (username: string, password = ''): void => {
  // cy.get("#mat-input-0") gut
  cy.get('input[placeholder="Anmeldename"]')
    .should('exist')
    .clear()
    .type(username);
  if (password) {
    // cy.get("#mat-input-1") gut
    cy.get('input[placeholder="Kennwort"]')
      .should('exist')
      .clear()
      .type(password);
  }
  cy.intercept('POST', '/api/login').as('responseLogin');
  clickButtonToAccept('Weiter');
  cy.wait('@responseLogin').its('response.statusCode').should('eq', 201);
  // cy.get(`li.ng-star-inserted:contains:"${userData.user_name}"`).should('exist');
};

export const createGroupArea = (areaName:string):void => {
  cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
    .should('exist')
    .click();
  cy.get('span:contains("Bereichsgruppen")')
    .eq(0)
    .click();
  cy.get('mat-icon').contains('add').click();
  cy.get('input[placeholder="Name"]')
    .type(areaName);
  clickButtonToAccept('Anlegen');
};

export const deleteGroupArea = (areaName:string):void => {
  cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
    .should('exist')
    .click();
  cy.get('span:contains("Bereichsgruppen")')
    .eq(0)
    .click();
  cy.get('mat-table')
    .contains(areaName)
    .click();
  cy.get('mat-icon')
    .contains('delete')
    .click();
  clickButtonToAccept('Löschen');
};

export const clickButtonToAccept = (text: string):Chainable => cy.url()
  .then(() => {
    cy.get('button')
      .contains(text)
      .should('exist')
      .click();
  });

export const logout = () => {
  cy.get('mat-icon:contains("account_box")')
    .click();
  cy.get('span:contains("Abmelden")')
    .should('exist')
    .click();
  // TODO  dont use systematically wait
  cy.wait(400);
  clickButtonToAccept('Abmelden');
};

export const changePassword = (newPass:string, oldPass:string):void => {
  cy.get('.mat-mdc-menu-trigger > .mdc-button__label > studio-lite-wrapped-icon > .center-icon > .mat-icon').click();
  cy.get('span:contains("Kennwort ändern")')
    .should('exist')
    .click();
  // TODO  dont use systematically wait
  cy.wait(400);
  cy.get('mat-label:contains("Altes Kennwort")')
    .should('exist')
    .type(oldPass);
  cy.get('mat-label:contains("Neues Kennwort")')
    .eq(0)
    .should('exist')
    .type(newPass);
  cy.get('mat-label:contains("Neues Kennwort (Wiederholung)")')
    .should('exist')
    .type(newPass);
  clickButtonToAccept('Speichern');
};

export const createNewUser = (name: string, pass: string):void => {
  cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
    .should('exist')
    .click();
  cy.get('mat-icon').contains('add').click();
  cy.get('input[placeholder="Login-Name"]')
    .should('exist')
    .clear()
    .type(`${name}`);
  cy.get('input[placeholder="Nachname"]')
    .should('exist')
    .clear()
    .type('Nachname');
  cy.get('input[placeholder="Vorname"]')
    .should('exist')
    .clear()
    .type('Vorname');
  cy.get('input[placeholder="Kennwort"]')
    .should('exist')
    .clear()
    .type(`${pass}`);
  clickButtonToAccept('Anlegen');
};
export const grantRemovePrivilegeOn = (user:string, group: string):void => {
  cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
    .should('exist')
    .click();
  cy.get('span:contains("Bereichsgruppen")')
    .eq(0)
    .click();
  cy.get('mat-table')
    .contains(`${group}`)
    .should('exist')
    .click();
  cy.get(`label:contains(${user})`).prev().click();
  cy.get('studio-lite-wrapped-icon[ng-reflect-icon="save"]').click();
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

export const addModule = ():void => {
  cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
    .should('exist')
    .click();
  cy.get('span:contains("Module")')
    .eq(0)
    .click();
  cy.get('mat-icon:contains("cloud_upload")')
    .should('exist')
    .click();
  // TODO
  // cy.selectFile('./../fixtures/iqb-editor-aspect-2.4.0-beta.1.html');
  // cy.fixture('iqb-editor-aspect-2.4.0-beta.1.html').selectFile('@myFixture');
};
