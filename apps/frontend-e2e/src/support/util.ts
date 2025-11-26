import { AccessLevel, UnitData, UserData } from './testData';
// import Chainable = Cypress.Chainable;

// export function cy.findAdminSettings().click(); {
//   cy.get('[data-cy="goto-admin"]').click();
// }
//
// export function findAdminGroupSettings(group: string): Chainable {
//   cy.visit('/');
//   return cy.get('studio-lite-user-workspaces-groups')
//     .get(`div>div>div>div:contains("${group}")`)
//     .parent()
//     .contains('mat-icon', 'settings');
// }

// tabName options: wsg-admin.component.ts
export function clickIndexTabWsgAdmin(tabName: string) {
  cy.get(`[data-cy="wsg-admin-routes-${tabName}"]`).click();
}

// tabName options: workspace.routes de,json or unit-data-area
export function clickIndexTabWorkspace(tabName:string):void {
  cy.wait(100);
  cy.get(`[data-cy="workspace-routes-${tabName}"]`).click();
}

// tabName options: admin.component.ts. Current options;
//     'users',
//     'workspace-groups',
//     'workspaces',
//     'units',
//     'v-modules',
//     'settings',
//     'packages'
export function clickIndexTabAdmin(tabName: string) {
  cy.get(`[data-cy="admin-tab-${tabName}"]`).click();
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
// TODO review
export function focusOnMenu(hoverString: string, option: string): void {
  goToWsMenu();
  cy.get(`span:contains("${hoverString}")`)
    .click();
  cy.contains('button', option)
    .find('mat-icon')
    .click();
}

export function selectCheckBox(name: string) {
  // only for review
  cy.get('studio-lite-select-unit-list').within(() => {
    cy.get(`mat-cell:contains("${name}")`)
      .prev()
      .click();
  });
}

function selectCheckboxUser(checkName: string) {
  // cy.get('[data-cy="admin-users-checkbox-login-name"]')
  //   .contains(checkName)
  //   .parent()
  //   .within(() => {
  //     cy.get('mat-checkbox').click();
  //   });
  cy.get(`[data-cy="admin-users-checkbox-user-box-${checkName}"]`).click();
}

export function goToItem(itemId: string) {
  cy.get(`studio-lite-item:contains("${itemId}")`).click();
}

export function addFirstUser() {
  cy.visit('/');
  cy.login(Cypress.env('username'), Cypress.env('password'));
  cy.clickButton('Anmelden');
  // cy.clickButtonWithResponseCheck('Anmelden', [201], '/api/init-login', 'POST', 'responseLogin');
}

export function loginWithUser(username: string, pass: string) {
  cy.visit('/');
  logout();
  login(username, pass);
}

export function addStatus(statusName:string, position:number) {
  cy.contains('button', 'Status hinzufügen').click();
  cy.get('div.state').eq(position).find('input[type="text"]').click()
    .type(statusName);
}

export function addModules(filenames:string[]):void {
  cy.findAdminSettings().click();
  clickIndexTabAdmin('v-modules');
  filenames.forEach(filename => {
    cy.loadModule(filename);
  });
}

export function addResourcePackage(resource: string):void {
  const path:string = `../frontend-e2e/src/fixtures/${resource}`;
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('packages');
  const name = resource.replace(/.itcr.zip/, '');
  cy.get('input[type=file]')
    .selectFile(path, {
      action: 'select',
      force: true
    });
  cy.contains('mat-row', name)
    .should('exist');
}

export function createNewUser(newUser: UserData):void {
  clickIndexTabAdmin('users');
  cy.get('[data-cy="admin-users-menu-add-user"]').click();
  editInput('admin-edit-user-username', newUser.username);
  editInput('admin-edit-user-lastname', newUser.lastName);
  editInput('admin-edit-user-firstname', newUser.firstName);
  editInput('admin-edit-user-email', newUser.email);
  editInput('admin-edit-user-password', newUser.password);
  cy.clickButtonWithResponseCheck('Anlegen', [201], '/api/admin/users', 'POST', 'addUser');
}

export function deleteUser(user: string):void {
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('users');
  selectCheckboxUser(user);
  cy.get('[data-cy="admin-users-menu-delete-users"]').click();
  cy.clickButtonWithResponseCheck('Löschen', [200], '/api/admin/users*', 'DELETE', 'deleteUser');
}

export function deleteUsers(users: string[]):void {
  clickIndexTabAdmin('users');
  users.forEach(user => {
    selectCheckboxUser(user);
  });
  cy.get('[data-cy="admin-users-menu-delete-users"]').click();
  cy.clickButtonWithResponseCheck('Löschen', [200], '/api/admin/users*', 'DELETE', 'deleteUser');
}

export function createGroup(group:string):void {
  clickIndexTabAdmin('workspace-groups');
  cy.get('mat-icon').contains('add').click();
  cy.get('input[placeholder="Name"]')
    .type(group);
  cy.clickButtonWithResponseCheck('Anlegen', [201], '/api/admin/workspace-groups', 'POST', 'createWsGroup');
}

export function createWs(ws:string, group:string):void {
  cy.visit('/');
  cy.findAdminGroupSettings(group).click();
  cy.wait(100);
  clickIndexTabWsgAdmin('workspaces');
  cy.get('mat-icon')
    .contains('add')
    .click();
  cy.get('input[placeholder="Bitte Namen eingeben"]')
    .type(ws);
  cy.clickButtonWithResponseCheck('Anlegen', [201], '/api/group-admin/workspaces*', 'POST', 'createWs');
}

export function grantRemovePrivilegeAtWs(users:string[], ws: string, rights:AccessLevel[]):void {
  cy.get('mat-table')
    .contains(`${ws}`)
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
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('workspace-groups');
  cy.get(`mat-row:contains("${group}")`)
    .click();
  admins.forEach(user => {
    cy.get(`mat-checkbox:contains((${user}))`)
      .find('label')
      .click();
  });
  clickSaveButtonRight();
}

export function deleteFirstUser() {
  cy.visit('/');
  deleteUser(Cypress.env('username'));
  cy.visit('/');
  logout();
}

export function login(username: string, password = '') {
  cy.visit('/');
  cy.login(username, password);
  cy.clickButtonWithResponseCheck('Anmelden', [201], '/api/login', 'POST', 'responseLogin');
}

export function setVeronaWs(ws:string):void {
  cy.visit('/');
  cy.visitWs(ws);
  goToWsMenu();
  cy.clickButton('Einstellungen');
  cy.contains('div', 'Voreingestellter Editor').find('svg').click();
  cy.get('mat-option>span').contains('Aspect').click();
  cy.contains('div', 'Voreingestellter Player').find('svg').click();
  cy.get('mat-option>span').contains('Aspect').click();
  cy.contains('div', 'Voreingestellter Schemer').find('svg').click();
  cy.get('mat-option>span').contains('Schemer').click();
  cy.get('mat-dialog-actions > button > span.mdc-button__label:contains("Speichern")').click();
}

export function deleteModule():void {
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('v-modules');
  cy.selectModule('IQB-Schemer');
  cy.selectModule('IQB-Player');
  cy.selectModule('IQB-Editor');
  cy.get('div > mat-icon')
    .contains('delete')
    .click();
  cy.clickButtonWithResponseCheck('Löschen', [200], '/api/verona-modules', 'GET', 'deleteModule');
}

export function deleteResource():void {
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('packages');
  cy.get('mat-cell:contains("GeoGebra")')
    .parent()
    .prev()
    .click();
  cy.get('mat-checkbox').eq(1).click(); // clicks the checkbox
  cy.get('div > mat-icon')
    .contains('delete')
    .click();
}

export function getButtonReview(reviewName: string, operation: string) {
  cy.get('span:contains("Aufgabenfolgen")').click();
  cy.contains('mat-row', reviewName).click();
  cy.get('studio-lite-review-menu').within(() => {
    cy.contains('mat-icon', operation).click();
  });
}

export function deleteGroup(group: string):void {
  cy.visit('/');
  cy.findAdminSettings().click();
  clickIndexTabAdmin('workspace-groups');
  cy.get('mat-table')
    .contains(group)
    .click();
  cy.get('mat-icon')
    .contains('delete')
    .click();
  cy.clickButtonWithResponseCheck('Löschen', [200], '/api/admin/workspace-groups*', 'DELETE', 'deleteGroup');
}

export function logout() {
  cy.visit('/');
  cy.get('[data-cy="goto-user-menu"]').click();
  cy.get('[data-cy="user-menu-logout"]').click();
  cy.clickDialogButton('Abmelden');
}

export function editInput(data: string, content: string | undefined) {
  if (content != null && content !== '') {
    cy.get(`[data-cy="${data}"]`)
      .should('exist')
      .type(content, { force: true });
  }
}

export function changePassword(newPass:string, oldPass:string):void {
  cy.get('[data-cy="goto-user-menu"]').click();
  cy.get('[data-cy="user-menu-change-password"]').click();
  editInput('change-password-password', oldPass);
  editInput('change-password-new-password', newPass);
  editInput('change-password-new2-password', newPass);
  cy.clickButtonWithResponseCheck('Speichern', [200], '/api/password', 'PATCH', 'updatePass');
}

export function updatePersonalData(newData: UserData):void {
  cy.get('[data-cy="goto-user-menu"]').click();
  cy.get('[data-cy="user-menu-edit-my-data"]').click();
  editInput('edit-my-data-lastname', <string>newData.lastName);
  editInput('edit-my-data-firstname', <string>newData.firstName);
  editInput('edit-my-data-email', <string>newData.email);
  cy.clickButtonWithResponseCheck('Speichern', [200], '/api/my-data', 'PATCH', 'updateData');
}

export function selectUnit(unitName:string) {
  cy.contains(unitName).should('exist').click({ force: true });
}

export function deleteUnit(shortname:string):void {
  cy.get('mat-icon:contains("delete")')
    .click();
  cy.get('mat-dialog-container input[placeholder="Suchbegriff"]')
    .should('exist')
    .click()
    .type(shortname);
  cy.get(`mat-cell:contains("${shortname}")`).prev().click();
  cy.get('mat-dialog-container').within(() => {
    cy.contains('button', 'Löschen').click();
  });
  cy.contains('button', 'Löschen').click();
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
  cy.clickDialogButtonWithResponseCheck('Speichern', [201], '/api/workspaces/*/units', 'POST', 'addUnit');
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
  cy.clickDialogButtonWithResponseCheck('Speichern', [201], '/api/workspaces/*/units', 'POST', 'addUnit');
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
  // eslint-disable-next-line max-len
  cy.clickDialogButtonWithResponseCheck('Speichern', [201], '/api/workspaces/*/units', 'POST', 'createUnitFromExisting');
}

export function goToWsMenu():void {
  cy.get('mat-icon:contains("menu")')
    .click({ force: true });
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
  // eslint-disable-next-line max-len
  cy.clickButtonWithResponseCheck('Verschieben', [200], '/api/workspaces/*/units/workspace-id', 'PATCH', 'createUnitFromExisting');
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

export function selectListUnits(unitNames: string[]): void {
  unitNames.forEach(name => {
    cy.get(`mat-cell:contains("${name}")`).prev().click();
  });
}

export function createItem(itemId: string) {
  cy.get('.add-button > .mdc-button__label').click();
  cy.clickButton('Bestätigen');
  cy.get('mat-expansion-panel:contains("ohne ID")').click();
  cy.get('mat-label:contains("Item ID")').eq(-1).type(itemId);
}

export function assignVariableToItem(variableName: string) {
  cy.get('mat-select[placeholder="Variable auswählen"]').eq(-1).find('svg').click();
  cy.get(`mat-option:contains("${variableName}")`).eq(0).click();
}
