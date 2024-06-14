import { adminData } from '../config/userdata';

export function addFirstUser() {
  cy.visit('/');
  cy.login(adminData.user_name, adminData.user_pass);
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
  cy.get('mat-table')
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

export function grantRemovePrivilege(user:string, ws: string, rights:string):void {
  cy.get('mat-table')
    .contains(`${ws}`)
    .should('exist')
    .click();
  if (rights === 'read') {
    cy.get(`[data-cy="access-rights"]:contains(${user} (${user}))`)
      .prev()
      .within(() => {
        cy.get('mat-checkbox').eq(0).click();
      });
  } else {
    cy.get(`[data-cy="access-rights"]:contains(${user} (${user}))`)
      .prev()
      .within(() => {
        cy.get('mat-checkbox').eq(1).click();
      });
  }
  cy.get('mat-icon:contains("save")')
    .eq(1)
    .should('exist')
    .click();
}

export function deleteFirstUser() {
  cy.visit('/');
  deleteUser(adminData.user_name);
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
  cy.dialogButtonToContinue('Abmelden', 304, '/assets/IQB-LogoA.png', 'GET', 'abmelden');
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

// export function visitWs(ws: string):void {
//   cy.get(`a:contains("${ws}")`).click();
// }

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
  // cy.get('mat-dialog-actions > button > span.mdc-button__label:contains("Speichern")').click();
  // cy.wait(100);
  cy.buttonToContinue('Speichern', 201, '/api/workspace/*/units', 'POST', 'addUnit');
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
  // cy.get('mat-dialog-actions > button > span.mdc-button__label:contains("Speichern")').click();
  // cy.wait(100);
}

export function addUnitFromExisting(ws:string, shortname:string, name:string, group: string,
  newshortname:string, newname:string, newgroup: string):void {
  // select the group and the ws
  cy.get('mat-select')
    .click();

  cy.get(`mat-option:contains("${ws}")`).click();
  // const search_text = `${shortname}: ${name}`;
  cy.get(`mat-cell:contains("${shortname} - ${name}")`).prev().click();
  clickButtonToAccept('Fortsetzen');
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
      cy.wait(100);
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
  cy.get('mat-dialog-actions > button > span.mdc-button__label:contains("Speichern")').click();
  cy.wait(100);
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

export function clickArbitraryPoint() {
  cy.document().then((doc: Document) => {
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: 800, // X-coordinate where you want to click
      clientY: 400 // Y-coordinate where you want to click
    });
    doc.dispatchEvent(event);
  });
}
export function visitLoginPage():void {
  cy.visit(<string>Cypress.config().baseUrl);
}

export function clickButtonToAccept(text: string):void {
  // Combining waits
  cy.get('button')
    .contains(text)
    .should('exist')
    .click();
  cy.wait(400);
  cy.get('button')
    .contains(text)
    .should('not.exist');
}
