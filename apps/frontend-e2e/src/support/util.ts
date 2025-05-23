import { AccessLevel, UnitData, UserData } from './testData';
import Chainable = Cypress.Chainable;

export function addFirstUser() {
  cy.visit('/');
  cy.login(Cypress.env('username'), Cypress.env('password'));
  cy.buttonToContinue('Weiter', [201], '/api/init-login', 'POST', 'responseLogin');
}

export function createNewUser(newUser: UserData):void {
  cy.visit('/');
  findAdminSettings().click();
  cy.get('mat-icon').contains('add').click();
  cy.get('input[placeholder="Login-Name"]')
    .should('exist')
    .clear()
    .type(`${newUser.username}`);
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
    .type(`${newUser.password}`);
  cy.buttonToContinue('Anlegen', [201], '/api/admin/users', 'POST', 'addUser');
}

export function deleteUser(user: string):void {
  // cy.get('[data-cy="goto-admin"]').click();
  findAdminSettings().click();
  cy.get('mat-cell')
    .contains(`${user}`)
    .should('exist')
    .click();
  cy.get('mat-icon')
    .contains('delete')
    .click();
  cy.buttonToContinue('Löschen', [200], '/api/admin/users*', 'DELETE', 'deleteUser');
  // cy.clickButton('Löschen');
}

export function createGroup(group:string):void {
  // cy.get('[data-cy="goto-admin"]').click();
  findAdminSettings().click();
  cy.get('span:contains("Bereichsgruppen")')
    .eq(0)
    .click();
  cy.get('mat-icon').contains('add').click();
  cy.get('input[placeholder="Name"]')
    .type(group);
  cy.buttonToContinue('Anlegen', [201], '/api/admin/workspace-groups', 'POST', 'createWsGroup');
}

export function findWorkspaceGroupSettings(group:string): Chainable {
  return cy.get('studio-lite-user-workspaces-groups')
    .get(`div>div>div>div:contains("${group}")`)
    .parent()
    .contains('mat-icon', 'settings');
}

export function findAdminSettings(): Chainable {
  // return cy.get('div>studio-lite-area-little>div:contains("Arbeitsbereich wählen")')
  //   .parent().parent()
  //   .contains('studio-lite-wrapped-icon', 'settings');
  return cy.get('div')
    .contains('studio-lite-wrapped-icon', 'settings');
}

export function createWs(ws:string, group:string):void {
  findWorkspaceGroupSettings(group).click();
  cy.get('span:contains("Arbeitsbereiche")')
    .eq(0)
    .click();
  cy.get('mat-icon')
    .contains('add')
    .click();
  cy.get('input[placeholder="Bitte Namen eingeben"]')
    .type(ws);
  cy.buttonToContinue('Anlegen', [201], '/api/group-admin/workspaces*', 'POST', 'createWs');
  // cy.clickButton('Anlegen');
}

export function clickIndexTab(name:string):void {
  cy.get(`span:contains(${name})`).eq(0).click();
}

export function addStatus(statusName:string, position:number) {
  cy.contains('button', 'Status hinzufügen').click();
  cy.get('div.state').eq(position).find('input[type="text"]').click()
    .type(statusName);
}

export function grantRemovePrivilegeAtWs(users:string[], ws: string, rights:AccessLevel[]):void {
  cy.get('mat-table')
    .contains(`${ws}`)
    .should('exist')
    .click();
  users.forEach((user, index) => {
    switch (rights[index]) {
      case AccessLevel.Basic: {
        cy.get(`[data-cy="access-rights"]:contains( (${user}))`)
          .prev()
          .within(() => {
            cy.get('mat-checkbox').eq(0).click();
          });
        break;
      }
      case AccessLevel.Developer: {
        cy.get(`[data-cy="access-rights"]:contains( (${user}))`)
          .prev()
          .within(() => {
            cy.get('mat-checkbox').eq(1).click();
          });
        break;
      }
      default: {
        cy.get(`[data-cy="access-rights"]:contains( (${user}))`)
          .prev()
          .within(() => {
            cy.get('mat-checkbox').eq(2).click();
          });
        break;
      }
    }
  });
  clickSaveButtonRight();
}
export function grantRemovePrivilegeAtUser(user:string, wss: string[], rights:AccessLevel[]):void {
  cy.get('mat-table')
    .contains(`${user}`)
    .should('exist')
    .click();
  wss.forEach((ws, index) => {
    switch (rights[index]) {
      case AccessLevel.Basic: {
        cy.get(`div>div>div>div>div:contains(${ws})`)
          .prev()
          .within(() => {
            cy.get('mat-checkbox').eq(0).click();
          });
        break;
      }
      case AccessLevel.Developer: {
        cy.get(`div>div>div>div>div:contains(${ws})`)
          .prev()
          .within(() => {
            cy.get('mat-checkbox').eq(1).click();
          });
        break;
      }
      default: {
        cy.get(`div>div>div>div>div:contains(${ws})`)
          .prev()
          .within(() => {
            cy.get('mat-checkbox').eq(2).click();
          });
        break;
      }
    }
  });
  clickSaveButtonRight();
}

export function makeAdminOfGroup(group:string, admins: string[]):void {
  findAdminSettings().click();
  cy.get('span:contains("Bereichsgruppen")')
    .eq(0)
    .click();
  cy.get(`mat-row:contains("${group}")`)
    .click();
  admins.forEach(user => {
    cy.get(`mat-checkbox:contains((${user}))`)
      .find('label')
      .click();
  });
  clickSaveButtonRight();
}

export function clickSaveButtonRight() {
  cy.get('mat-icon:contains("save")').then($elements => {
    if ($elements.length === 1) {
      cy.get('mat-icon:contains("save")').click();
    } else {
      cy.get('mat-icon:contains("save")').eq(1).click();
    }
  });
}
export function deleteFirstUser() {
  cy.visit('/');
  deleteUser(Cypress.env('username'));
  cy.visit('/');
  logout();
}

export function login(username: string, password = '') {
  cy.login(username, password);
  cy.buttonToContinue('Weiter', [201], '/api/login', 'POST', 'responseLogin');
}

export function addModules(filenames:string[], type:string):void {
  findAdminSettings().click();
  cy.get(`span:contains("${type}")`)
    .eq(0)
    .click();
  filenames.forEach(filename => {
    cy.loadModule(filename, filename);
  });
}

export function setVeronaWs(ws:string):void {
  cy.visitWs(ws);
  goToWsMenu();
  clickButton('Einstellungen');
  cy.contains('div', 'Voreingestellter Editor').find('svg').click();
  cy.get('mat-option>span').contains('Aspect').click();
  cy.contains('div', 'Voreingestellter Player').find('svg').click();
  cy.get('mat-option>span').contains('Aspect').click();
  cy.contains('div', 'Voreingestellter Schemer').find('svg').click();
  cy.get('mat-option>span').contains('Schemer').click();
  cy.get('mat-dialog-actions > button > span.mdc-button__label:contains("Speichern")').click();
}

export function clickButton(name:string):void {
  cy.contains('button', name).click();
}

export function deleteModule():void {
  findAdminSettings().click();
  cy.get('span:contains("Module")')
    .eq(0)
    .click();
  cy.selectModule('IQB-Schemer');
  cy.selectModule('IQB-Player');
  cy.selectModule('IQB-Editor');
  cy.get('div > mat-icon')
    .contains('delete')
    .click();
  cy.buttonToContinue('Löschen', [200], '/api/verona-modules', 'GET', 'deleteModule');
}

export function deleteResource():void {
  // cy.get('[data-cy="goto-admin"]').click();
  findAdminSettings().click();
  cy.get('span:contains("Pakete")')
    .eq(0)
    .click();
  cy.get('mat-cell:contains("GeoGebra")')
    .parent()
    .prev()
    .click();
  cy.get('mat-checkbox').eq(1).click(); // clicks the checkbox
  cy.get('div > mat-icon')
    .contains('delete')
    .click();
}

export function deleteGroup(group: string):void {
  // cy.get('[data-cy="goto-admin"]').click();
  findAdminSettings().click();
  cy.get('span:contains("Bereichsgruppen")')
    .eq(0)
    .click();
  cy.get('mat-table')
    .contains(group)
    .click();
  cy.get('mat-icon')
    .contains('delete')
    .click();
  cy.buttonToContinue('Löschen', [200], '/api/admin/workspace-groups*', 'DELETE', 'deleteGroup');
  // cy.clickButton('Löschen');
}

export function logout() {
  // cy.get('[data-cy="goto-user-menu"]').click();
  cy.get('studio-lite-user-menu')
    .click();
  cy.get('span:contains("Abmelden")')
    .should('exist')
    .click();
  cy.get('mat-dialog-actions button')
    .contains('Abmelden')
    .should('exist')
    .click();
}

export function changePassword(newPass:string, oldPass:string):void {
  // cy.get('[data-cy="goto-user-menu"]').click();
  cy.get('studio-lite-user-menu')
    .click();
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
  cy.buttonToContinue('Speichern', [200], '/api/password', 'PATCH', 'updatePass');
}

export function updatePersonalData():void {
  // cy.get('[data-cy="goto-user-menu"]').click();
  cy.get('studio-lite-user-menu')
    .click();
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
  cy.buttonToContinue('Speichern', [200], '/api/my-data', 'PATCH', 'updateData');
}

export function selectUnit(unitName:string) {
  cy.contains(unitName).should('exist').click();
}

export function deleteUnit(shortname:string):void {
  cy.get('mat-icon:contains("delete")')
    .click();
  cy.get('mat-dialog-container input[placeholder="Suchbegriff"]')
    .should('exist')
    .click()
    .type(shortname);
  cy.get(`mat-cell:contains("${shortname}")`).prev().click();
  cy.buttonToContinue('Löschen', [200], '/api/workspaces/*/units*', 'DELETE', 'deleteUnit');
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
  cy.dialogButtonToContinue('Speichern', [201], '/api/workspaces/*/units', 'POST', 'addUnit');
}

export function addUnitPred(unit:UnitData):void {
  cy.get('[data-cy="workspace-add-units"]')
    .click();
  cy.get('button > span:contains("Neue Aufgabe")')
    .should('exist')
    .click();
  cy.get('input[placeholder="Kurzname"]')
    .should('exist')
    .clear()
    .type(unit.shortname);
  cy.get('input[placeholder="Name"]')
    .should('exist')
    .clear()
    .type(unit.name);
  cy.get('body').then($body => {
    if ($body.find('input[placeholder="Neue Gruppe"]').length > 0) {
      cy.get('input[placeholder="Neue Gruppe"]')
        .clear()
        .type(unit.group);
    } else {
      cy.get('mat-dialog-content').find('svg')
        .click();
      cy.get('body').then($body1 => {
        if ($body1.find(`mat-option:contains("${unit.group}")`).length > 0) {
          cy.get(`mat-option:contains("${unit.group}")`)
            .click();
        } else {
          cy.get('.cdk-overlay-transparent-backdrop').click();
          cy.get('[data-cy="workspace-add-new-group"]')
            .click();
          cy.get('input[placeholder="Neue Gruppe"]')
            .clear()
            .type(unit.group);
        }
      });
    }
  });
  cy.dialogButtonToContinue('Speichern', [201], '/api/workspaces/*/units', 'POST', 'addUnit');
}

export function addUnitFromExisting(ws:string, unit1:UnitData, newUnit:UnitData):void {
  // select the group and the ws
  cy.get('[data-cy="workspace-add-units"]')
    .click();
  cy.get('button > span:contains("Neu von vorhandener Aufgabe")')
    .click();
  cy.get('mat-select')
    .click();
  cy.get(`mat-option:contains("${ws}")`).click();
  cy.get(`mat-cell:contains("${unit1.shortname}")`).prev().click();
  cy.clickButton('Fortsetzen');
  cy.get('input[placeholder="Kurzname"]')
    .should('exist')
    .clear()
    .type(newUnit.shortname);
  cy.get('input[placeholder="Name"]')
    .should('exist')
    .clear()
    .type(newUnit.name);
  cy.get('body').then($body => {
    if ($body.find('input[placeholder="Neue Gruppe"]').length > 0) {
      cy.get('input[placeholder="Neue Gruppe"]')
        .clear()
        .type(newUnit.group);
    } else {
      cy.get('mat-dialog-content').find('svg')
        .click();
      cy.get('body').then($body1 => {
        if ($body1.find(`mat-option:contains("${unit1.group}")`).length > 0) {
          cy.get(`mat-option:contains("${unit1.group}")`)
            .click();
        } else {
          cy.get('.cdk-overlay-transparent-backdrop').click();
          cy.get('[data-cy="workspace-add-new-group"]')
            .click();
          cy.get('input[placeholder="Neue Gruppe"]')
            .clear()
            .type(newUnit.group);
        }
      });
    }
  });
  cy.dialogButtonToContinue('Speichern', [201], '/api/workspaces/*/units', 'POST', 'createUnitFromExisting');
}

export function goToWsMenu():void {
  cy.get('mat-icon:contains("menu")')
    .click();
}

export function moveUnit(wsorigin:string, wsdestination:string, unit:UnitData):void {
  cy.visit('/');
  cy.visitWs(wsorigin);
  cy.get('mat-icon:contains("menu")')
    .click();
  cy.get('span:contains("Verschieben")')
    .click();
  cy.get('mat-select')
    .click();
  cy.get(`mat-option:contains("${wsdestination}")`).click();
  cy.get(`mat-cell:contains("${unit.shortname}")`).prev().click();
  cy.buttonToContinue('Verschieben', [200], '/api/workspaces/*/units/workspace-id', 'PATCH', 'createUnitFromExisting');
  // cy.clickButton('Verschieben');
}

export function importExercise(filename: string): void {
  const path:string = `../frontend-e2e/src/fixtures/${filename}`;
  cy.get('[data-cy="workspace-add-units"]')
    .click();
  cy.get('input[type=file]')
    .selectFile(path, {
      action: 'select',
      force: true
    });
}

// workspace menu options
export function selectFromMenu(option: string): void {
  cy.get('mat-icon:contains("menu")')
    .click();
  cy.get(`span:contains("${option}")`)
    .click();
}

export function focusOnMenu(hoverString: string, option: string): void {
  cy.get('mat-icon:contains("menu")')
    .click();
  cy.get(`span:contains("${hoverString}")`)
    .click();
  cy.contains('button', option)
    .find('mat-icon')
    .click();
}

export function selectListUnits(unitNames: string[]): void {
  unitNames.forEach(name => {
    cy.get(`mat-cell:contains("${name}")`).prev().click();
  });
}

export function createItem(itemId: string) {
  cy.get('.add-button > .mdc-button__label').click();
  cy.clickButton('Bestätigen');
  cy.get('mat-expansion-panel:contains("ohne ID")').click();
  cy.get('mat-label:contains("Item ID *")').eq(-1).type(itemId);
}

export function assignVariableToItem(variableName: string) {
  cy.get('mat-select:contains("Variable auswählen")').eq(-1).find('svg').click();
  cy.get(`mat-option:contains("${variableName}")`).click();
}
