import Chainable = Cypress.Chainable;
import { adminData, userData } from './config/userdata';

export const visitLoginPage = (): Chainable => cy.url()
  .then(url => {
    cy.visit(<string>Cypress.config().baseUrl);
  });

export const insertCredentials = (username: string, password = ''): void => {
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
};
export const loginAdmin = ():void => {
  insertCredentials(userData.user_name, userData.user_pass);
  cy.intercept('/api/login').as('asLogin');
  clickButtonToAccept('Weiter');
  cy.wait('@asLogin');
  cy.get(`li.ng-star-inserted:contains:"${userData.user_name}"`).should('exist');
};
export const clickButtonToAccept = (text: string):Chainable => cy.url()
  .then(url => {
    cy.get('button')
      .contains(text)
      .should('exist')
      .click();
  });

export const logout = () => {
  // TODO selector
  cy.get('.mat-mdc-menu-trigger > .mdc-button__label > studio-lite-wrapped-icon > .center-icon > .mat-icon').click();
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

export const prepareAdminTest = ():void => {
  insertCredentials(adminData.user_name, adminData.user_pass);
  clickButtonToAccept('Weiter');
  cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
    .should('exist')
    .click();
  cy.get('mat-icon').contains('add').click();
  cy.get('input[placeholder="Login-Name"]')
    .should('exist')
    .clear()
    .type('bbb');
  cy.get('input[placeholder="Kennwort"]')
    .should('exist')
    .clear()
    .type('ccc');
  clickButtonToAccept('Anlegen');
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
export const grantPrivilegeOn = (user:string, group: string):void => {
  insertCredentials(adminData.user_name, adminData.user_pass);
  clickButtonToAccept('Weiter');
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
