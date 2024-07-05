import { AccessLevel } from './testData';

export function addFirstUser() {
  cy.visit('/');
  cy.login(Cypress.env('username'), Cypress.env('password'));
  cy.buttonToContinue('Weiter', 201, '/api/init-login', 'POST', 'responseLogin');
}

export function createNewUser(name: string, pass: string):void {
  cy.visit('/');
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
  cy.buttonToContinue('Anlegen', 201, '/api/admin/users', 'POST', 'addUser');
}

export function deleteUser(user: string):void {
  cy.get('[data-cy="goto-admin"]').click();
  cy.get('mat-cell')
    .contains(`${user}`)
    .should('exist')
    .click();
  cy.get('mat-icon')
    .contains('delete')
    .click();
  cy.buttonToContinue('Löschen', 200, '/api/admin/users/*', 'DELETE', 'deleteUser');
}

export function createGroup(group:string):void {
  cy.get('[data-cy="goto-admin"]').click();
  cy.get('span:contains("Bereichsgruppen")')
    .eq(0)
    .click();
  cy.get('mat-icon').contains('add').click();
  cy.get('input[placeholder="Name"]')
    .type(group);
  cy.buttonToContinue('Anlegen', 201, '/api/admin/workspace-groups', 'POST', 'createWsGroup');
}

export function createWs(ws:string, group:string):void {
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
    .type(ws);
  cy.buttonToContinue('Anlegen', 201, '/api/admin/workspaces/*', 'POST', 'createWs');
}

export function grantRemovePrivilege(user:string, ws: string, rights:AccessLevel):void {
  cy.get('mat-table')
    .contains(`${ws}`)
    .should('exist')
    .click();
  switch (rights) {
    case AccessLevel.Basic: {
      cy.get(`[data-cy="access-rights"]:contains(${user} (${user}))`)
        .prev()
        .within(() => {
          cy.get('mat-checkbox').eq(0).click();
        });
      break;
    }
    case AccessLevel.Developer: {
      cy.get(`[data-cy="access-rights"]:contains(${user} (${user}))`)
        .prev()
        .within(() => {
          cy.get('mat-checkbox').eq(1).click();
        });
      break;
    }
    case AccessLevel.Manager: {
      cy.get(`[data-cy="access-rights"]:contains(${user} (${user}))`)
        .prev()
        .within(() => {
          cy.get('mat-checkbox').eq(2).click();
        });
      break;
    }
    default: {
      cy.get(`[data-cy="access-rights"]:contains(${user} (${user}))`)
        .prev()
        .within(() => {
          cy.get('mat-checkbox').eq(3).click();
        });
      break;
    }
  }
  cy.get('mat-icon:contains("save")')
    .eq(1)
    .should('exist')
    .click();
}

export function deleteFirstUser() {
  cy.visit('/');
  deleteUser(Cypress.env('username'));
  cy.visit('/');
  logout();
}

export function login(username: string, password = '') {
  cy.login(username, password);
  cy.buttonToContinue('Weiter', 201, '/api/login', 'POST', 'responseLogin');
}

export function addModule():void {
  cy.get('[data-cy="goto-admin"]').click();
  cy.get('span:contains("Module")')
    .eq(0)
    .click();
  cy.loadModule('../frontend-e2e/src/fixtures/iqb-schemer-1.5.0.html', 'iqb-schemer@1.5');
  cy.loadModule('../frontend-e2e/src/fixtures/iqb-player-aspect-2.4.10-alpha.html', 'iqb-player-aspect@2.4.10');
  cy.loadModule('../frontend-e2e/src/fixtures/iqb-editor-aspect-2.4.9-alpha.html', 'iqb-editor-aspect@2.4.9');
}

export function deleteModule():void {
  cy.get('[data-cy="goto-admin"]').click();
  cy.get('span:contains("Module")')
    .eq(0)
    .click();
  cy.selectModule('IQB-Schemer');
  cy.selectModule('IQB-Player');
  cy.selectModule('IQB-Editor');
  cy.get('div > mat-icon')
    .contains('delete')
    .click();
  cy.buttonToContinue('Löschen', 200, '/api/verona-modules', 'GET', 'deleteModule');
}

export function deleteGroup(wsName: string):void {
  cy.get('[data-cy="goto-admin"]').click();
  cy.get('span:contains("Bereichsgruppen")')
    .eq(0)
    .click();
  cy.get('mat-table')
    .contains(wsName)
    .click();
  cy.get('mat-icon')
    .contains('delete')
    .click();
  cy.buttonToContinue('Löschen', 200, '/api/admin/workspace-groups/*', 'DELETE', 'deleteGroup');
}

export function logout() {
  cy.get('[data-cy="goto-user-menu"]').click();
  cy.get('span:contains("Abmelden")')
    .should('exist')
    .click();
  cy.get('mat-dialog-actions button')
    .contains('Abmelden')
    .should('exist')
    .click();
}

export function changePassword(newPass:string, oldPass:string):void {
  cy.get('[data-cy="goto-user-menu"]').click();
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
  cy.buttonToContinue('Speichern', 200, '/api/password', 'PATCH', 'updatePass');
}

export function updatePersonalData():void {
  cy.get('[data-cy="goto-user-menu"]').click();
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
  cy.buttonToContinue('Speichern', 200, '/api/my-data', 'PATCH', 'updateData');
}

export function deleteUnit(kurzname: string, name: string):void {
  cy.get('mat-icon:contains("delete")')
    .click();
  cy.get('mat-dialog-container input[placeholder="Suchbegriff"]')
    .should('exist')
    .click()
    .type(kurzname);
  cy.get(`mat-cell:contains("${kurzname} - ${name}")`).prev().click();
  cy.buttonToContinue('Löschen', 200, '/api/workspace/*/*', 'DELETE', 'deleteUnit');
}

export function deleteUnit2(kurzname: string):void {
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
  cy.dialogButtonToContinue('Speichern', 201, '/api/workspace/*/units', 'POST', 'addUnit');
}

export function addUnitPred(shortname:string, name:string, group: string):void {
  cy.get('[data-cy="workspace-add-units"]')
    .click();
  cy.get('button > span:contains("Neue Aufgabe")')
    .should('exist')
    .click();
  cy.get('input[placeholder="Kurzname"]')
    .should('exist')
    .clear()
    .type(shortname);
  cy.get('input[placeholder="Name"]')
    .should('exist')
    .clear()
    .type(name);
  cy.get('body').then($body => {
    if ($body.find('input[placeholder="Neue Gruppe"]').length > 0) {
      cy.get('input[placeholder="Neue Gruppe"]')
        .clear()
        .type(group);
    } else {
      cy.get('svg')
        .click();
      cy.get('body').then($body1 => {
        if ($body1.find(`mat-option:contains("${group}")`).length > 0) {
          cy.get(`mat-option:contains("${group}")`)
            .click();
        } else {
          cy.get('.cdk-overlay-transparent-backdrop').click();
          cy.get('[data-cy="workspace-add-new-group"]')
            .click();
          cy.get('input[placeholder="Neue Gruppe"]')
            .clear()
            .type(group);
        }
      });
    }
  });
  cy.dialogButtonToContinue('Speichern', 201, '/api/workspace/*/units', 'POST', 'addUnit');
}

export function addUnitFromExisting(ws:string, shortname:string, name:string, group: string,
  newshortname:string, newname:string, newgroup: string):void {
  // select the group and the ws
  cy.get('[data-cy="workspace-add-units"]')
    .click();
  cy.get('button > span:contains("Neu von vorhandener Aufgabe")')
    .click();
  cy.get('mat-select')
    .click();
  cy.get(`mat-option:contains("${ws}")`).click();
  cy.get(`mat-cell:contains("${shortname} - ${name}")`).prev().click();
  cy.clickButton('Fortsetzen');
  cy.get('input[placeholder="Kurzname"]')
    .should('exist')
    .clear()
    .type(newshortname);
  cy.get('input[placeholder="Name"]')
    .should('exist')
    .clear()
    .type(newname);
  cy.get('body').then($body => {
    if ($body.find('input[placeholder="Neue Gruppe"]').length > 0) {
      cy.get('input[placeholder="Neue Gruppe"]')
        .clear()
        .type(newgroup);
    } else {
      cy.get('svg')
        .click();
      cy.get('body').then($body1 => {
        if ($body1.find(`mat-option:contains("${group}")`).length > 0) {
          cy.get(`mat-option:contains("${group}")`)
            .click();
        } else {
          cy.get('.cdk-overlay-transparent-backdrop').click();
          cy.get('[data-cy="workspace-add-new-group"]')
            .click();
          cy.get('input[placeholder="Neue Gruppe"]')
            .clear()
            .type(newgroup);
        }
      });
    }
  });
  cy.dialogButtonToContinue('Speichern', 201, '/api/workspace/*/units', 'POST', 'createUnitFromExisting');
}

export function moveUnit(wsorigin:string, wsdestination:string, shortname:string, name:string):void {
  cy.visit('/');
  cy.visitWs(wsorigin);
  cy.get('mat-icon:contains("menu")')
    .click();
  cy.get('span:contains("Verschieben")')
    .click();
  cy.get('mat-select')
    .click();
  cy.get(`mat-option:contains("${wsdestination}")`).click();
  cy.get(`mat-cell:contains("${shortname} - ${name}")`).prev().click();
  cy.buttonToContinue('Verschieben', 200, '/api/workspace/*/*/moveto/*', 'PATCH', 'createUnitFromExisting');
}
export function importExercise(): void {
  cy.get('[data-cy="workspace-add-units"]')
    .click();
  cy.get('input[type=file]')
    .selectFile('../frontend-e2e/src/fixtures/test_studio_units_download.zip', {
      action: 'select',
      force: true
    });
  cy.contains('M6_AK0011')
    .should('exist');
}
