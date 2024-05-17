import { adminData } from './config/userdata';

export function addFirstUser() {
  cy.get('input[placeholder="Anmeldename"]')
    .should('exist')
    .clear()
    .type(adminData.user_name);
  cy.get('input[placeholder="Kennwort"]')
    .should('exist')
    .clear()
    .type(adminData.user_pass);
  clickButtonToAccept('Weiter');
  cy.wait(400);
  visitLoginPage();
  // cy.get('mat-icon:contains("account_box")').click();
  cy.get('[data-cy="goto-user-menu"]').click();
  cy.get('span:contains("Abmelden")')
    .should('exist')
    .click();
  cy.wait(400);
  clickButtonToAccept('Abmelden');
}

export function deleteFirstUser() {
  deleteUser(adminData.user_name);
}

export function login(username: string, password = '') {
  cy.get('input[placeholder="Anmeldename"]')
    .should('exist')
    .clear()
    .type(username);
  if (password) {
    cy.get('input[placeholder="Kennwort"]')
      .should('exist')
      .clear()
      .type(password);
  }
  cy.intercept('POST', '/api/login').as('responseLogin');
  clickButtonToAccept('Weiter');
  cy.wait('@responseLogin')
    .its('response.statusCode').should('eq', 201);
}

export function createGroupArea(group:string):void {
  cy.get('[data-cy="goto-admin"]').click();
  cy.get('span:contains("Bereichsgruppen")')
    .eq(0)
    .click();
  cy.get('mat-icon').contains('add').click();
  cy.get('input[placeholder="Name"]')
    .type(group);
  clickButtonToAccept('Anlegen');
}

export function createAreaForGroupFromAdmin(area:string, group:string):void {
  cy.get(`div>div>div>div:contains("${group}")`)
    .eq(0)
    .next()
    .click();
  cy.get('span:contains("Arbeitsbereiche")')
    .eq(0)
    .click();
  cy.get('mat-icon')
    .contains('add')
    .click();
  cy.get('input[placeholder="Bitte Namen eingeben"]')
    .type(area);
  clickButtonToAccept('Anlegen');
}

export function deleteGroupArea(areaName: string):void {
  cy.get('[data-cy="goto-admin"]').click();
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
}

export function logout() {
  cy.get('[data-cy="goto-user-menu"]').click();
  // cy.get('mat-icon:contains("account_box")')
  //   .eq(0)
  //   .should('exist')
  //   .click();
  cy.get('span:contains("Abmelden")')
    .should('exist')
    .click();
  cy.wait(400);
  clickButtonToAccept('Abmelden');
}

export function changePassword(newPass:string, oldPass:string):void {
  cy.get('[data-cy="goto-user-menu"]').click();
  // cy.get('mat-icon:contains("account_box")')
  //   .eq(0)
  //   .should('exist')
  //   .click();
  cy.get('span:contains("Kennwort ändern")')
    .should('exist')
    .click();
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
}

export function updatePersonalData():void {
  cy.get('[data-cy="goto-user-menu"]').click();
  // cy.get('mat-icon:contains("account_box")')
  //   .eq(0)
  //   .should('exist')
  //   .click();
  cy.get('span:contains("Nutzerdaten ändern")')
    .should('exist')
    .click();
  cy.get('input[placeholder="Nachname"]')
    .should('exist')
    .clear()
    .type('Müller');
  cy.get('input[placeholder="Vorname"]')
    .should('exist')
    .clear()
    .type('Adam');
  cy.get('input[placeholder="E-Mail"]')
    .should('exist')
    .clear()
    .type('adam.muller@iqb.hu-berlin.de');
  clickButtonToAccept('Speichern');
}

export function createNewUser(name: string, pass: string):void {
  cy.get('[data-cy="goto-admin"]').click();
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
}

export function deleteUser(user: string):void {
  cy.get('[data-cy="goto-admin"]').click();
  cy.get('mat-table')
    .contains(`${user}`)
    .should('exist')
    .click();
  cy.get('mat-icon')
    .contains('delete')
    .click();
  clickButtonToAccept('Löschen');
}

export function grantRemovePrivilegeOnGroup(user:string, group: string):void {
  cy.get('[data-cy="goto-admin"]').click();
  cy.get('span:contains("Bereichsgruppen")')
    .eq(0)
    .click();
  cy.get('mat-table')
    .contains(`${group}`)
    .should('exist')
    .click();
  cy.get(`label:contains(${user})`).prev().click();
  cy.get('.center-icon > .mat-icon:contains("save")')
    .eq(0)
    .should('exist')
    .click();
}

export function grantRemovePrivilegeOnArea(user:string, area: string):void {
  cy.get('mat-table')
    .contains(`${area}`)
    .should('exist')
    .click();
  cy.get(`label.mdc-label:contains(${user})`).click();
  cy.get('mat-icon:contains("save")')
    .eq(1)
    .should('exist')
    .click();
}

export function visitArea(area: string):void {
  visitLoginPage();
  cy.get(`a:contains("${area}")`).click();
}

export function deleteUnit(kurzname: string):void {
  cy.get('studio-lite-unit-table mat-table mat-row').contains(kurzname).click();
  cy.get('mat-icon:contains("delete")').eq(0)
    .click();
  cy.get('mat-dialog-actions > button > span.mdc-button__label:contains("Löschen")').click();
}

export function addUnit(kurzname: string):void {
  cy.get('mat-icon:contains("add")')
    .click();
  cy.get('button > span:contains("Neue Aufgabe")')
    .should('exist')
    .click();
  cy.get('input[placeholder="Kurzname"]')
    .should('exist')
    .type(kurzname);
  cy.get('mat-dialog-actions > button > span.mdc-button__label:contains("Speichern")').click();
}

export function addModule():void {
  cy.get('[data-cy="goto-admin"]').click();
  cy.get('span:contains("Module")')
    .eq(0)
    .click();
  cy.get('input[type=file]')
    .selectFile('../frontend-e2e/src/fixtures/iqb-schemer-1.5.0.html', {
      action: 'select',
      force: true
    });
  cy.contains('iqb-schemer@1.5')
    .should('exist');
  cy.get('input[type=file]')
    .selectFile('../frontend-e2e/src/fixtures/iqb-player-aspect-2.4.10-alpha.html', {
      action: 'select',
      force: true
    });
  cy.contains('iqb-player-aspect@2.4.10')
    .should('exist');
  cy.get('input[type=file]')
    .selectFile('../frontend-e2e/src/fixtures/iqb-editor-aspect-2.4.9-alpha.html', {
      action: 'select',
      force: true
    });
  cy.contains('iqb-editor-aspect@2.4.9')
    .should('exist');
}

export function deleteModule():void {
  cy.get('[data-cy="goto-admin"]').click();
  cy.get('span:contains("Module")')
    .eq(0)
    .click();
  cy.get('span:contains("IQB-Schemer")')
    .parent()
    .parent()
    .prev()
    .click();
  cy.get('span:contains("IQB-Player")')
    .parent()
    .parent()
    .prev()
    .click();
  cy.get('span:contains("IQB-Editor")')
    .parent()
    .parent()
    .prev()
    .click();
  cy.get('div > mat-icon')
    .contains('delete')
    .click();
  clickButtonToAccept('Löschen');
}

export function visitLoginPage():void {
  cy.visit(<string>Cypress.config().baseUrl);
}

export function clickButtonToAccept(text: string):void {
  cy.get('button')
    .contains(text)
    .should('exist')
    .click();
}
