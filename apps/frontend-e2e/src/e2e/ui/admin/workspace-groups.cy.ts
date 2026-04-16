import {
  AccessLevel,
  group1,
  newUser,
  testUsers,
  ws1,
  ws2
} from '../../../support/testData';
import {
  addFirstUser,
  createGroup,
  createNewUser,
  createWs,
  deleteFirstUser,
  deleteGroup,
  deleteUser,
  grantRemovePrivilegeAtUser,
  grantRemovePrivilegeAtWs,
  login,
  logout,
  makeAdminOfGroup,
  clickIndexTabWsgAdmin, importExercise, selectListUnits
} from '../../../support/helpers';

describe('Workspace Group Administration', () => {
  const groupAdminUser = testUsers.groupAdmin;
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
  });

  it('sets up test workspace and users', () => {
    createNewUser(newUser);
    createNewUser(groupAdminUser);
    createGroup(group1);
    createWs(ws1, group1);
    grantRemovePrivilegeAtWs(
      [newUser.username, groupAdminUser.username, Cypress.expose('username')],
      ws1,
      [AccessLevel.Basic, AccessLevel.Admin, AccessLevel.Admin]
    );
    createWs(ws2, group1);
    grantRemovePrivilegeAtWs(
      [newUser.username, groupAdminUser.username, Cypress.expose('username')],
      ws2,
      [AccessLevel.Basic, AccessLevel.Admin, AccessLevel.Admin]
    );
  });

  it('imports units from zip file', () => {
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
    cy.contains('M6_AK0011').should('exist');
  });

  it('assigns group admin role to user', () => {
    makeAdminOfGroup(group1, [Cypress.expose('username'), groupAdminUser.username]);
  });

  it('displays all admin tabs (users, workspaces, units, settings)', () => {
    cy.findAdminGroupSettings(group1).click();
    cy.get('[data-cy="wsg-admin-routes-users"]').should('exist');
    cy.get('[data-cy="wsg-admin-routes-workspaces"]').should('exist');
    cy.get('[data-cy="wsg-admin-routes-units"]').should('exist');
    cy.get('[data-cy="wsg-admin-routes-settings"]').should('exist');
  });

  it('hides group admin settings for normal users', () => {
    logout();
    login(newUser.username, newUser.password);
    cy.findAdminGroupSettings(group1).should('not.exist');
  });

  it('checks that workspace ws1 is read-only for user', () => {
    cy.contains(ws1).click();
    cy.get('[data-cy="units-area-no-access-level"]').should('exist');
    cy.get('studio-lite-add-unit-button>button')
      .should('have.attr', 'disabled');
  });

  it('displays group settings button for group admins', () => {
    logout();
    login(groupAdminUser.username, groupAdminUser.password);
    cy.findAdminGroupSettings(group1).should('exist');
  });

  it('configures ws2 as a drop-box for ws1', () => {
    cy.findAdminGroupSettings(group1).click();
    clickIndexTabWsgAdmin('workspaces');
    cy.get('mat-row').contains(ws1).click();
    // Click the select-drop-box button (folder_special icon)
    cy.get('button[mat-button]')
      .find('mat-icon')
      .contains('folder_special')
      .click();
    cy.get('mat-dialog-container').should('be.visible');
    cy.get('mat-select').click();
    cy.get('mat-option').contains(ws2).click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('mat-dialog-container').find('button').contains(json.save).click();
    });
    // Verify check_circle icon appears in the row
    cy.get('mat-row')
      .contains(ws1)
      .parent()
      .find('mat-icon')
      .contains('check_circle')
      .should('exist');
  });

  it('submits a unit from ws1 to its drop-box ws2', () => {
    cy.visitWs(ws1);
    cy.get('[data-cy="workspace-edit-unit-menu"]').click();
    cy.get('[data-cy="workspace-edit-unit-submit-units"]').click();
    cy.get('mat-dialog-container').should('be.visible');
    // Select unit M6_AK0011
    cy.get('mat-dialog-container').should('be.visible');
    // Select unit M6_AK0011
    selectListUnits(['M6_AK0011']);
    // cy.get('mat-dialog-container')
    //   .contains('mat-row', 'M6_AK0011')
    //   .find('mat-checkbox')
    //   .click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('[data-cy="workspace-select-unit-button"]')
        .contains(json.workspace['submit-units'])
        .click();
    });
    // Verify successful submission
    cy.get('mat-row')
      .contains('M6_AK0011', { timeout: 10000 })
      .should('not.exist');

    // Verify it arrived in ws2
    cy.visitWs(ws2);
    cy.get('mat-row').contains('M6_AK0011').should('exist');
  });

  it('returns a unit from the drop-box ws2 back to ws1', () => {
    cy.visitWs(ws2);
    cy.get('[data-cy="workspace-edit-unit-menu"]').click();
    cy.get('[data-cy="workspace-edit-unit-return-submitted-units"]').click();
    cy.get('mat-dialog-container').should('be.visible');
    // Select unit M6_AK0011
    selectListUnits(['M6_AK0011']);
    // cy.get('mat-dialog-container')
    //   .contains('mat-row', 'M6_AK0011')
    //   .find('mat-checkbox')
    //   .click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('[data-cy="workspace-select-unit-button"]')
        .contains(json.workspace['return-submitted-units'])
        .click();
    });

    // Verify it is back in ws1
    cy.visitWs(ws1);
    cy.get('mat-row').contains('M6_AK0011').should('exist');
  });

  it('allows group admin to manage workspace privileges', () => {
    cy.findAdminGroupSettings(group1).click();
    cy.get('[data-cy="wsg-admin-routes-workspaces"]').click();
    grantRemovePrivilegeAtWs(
      [newUser.username],
      ws1,
      [AccessLevel.Admin]
    );
  });

  it('allows group admin to manage user privileges from users tab', () => {
    cy.findAdminGroupSettings(group1).click();
    cy.get('[data-cy="wsg-admin-routes-users"]').click();
    grantRemovePrivilegeAtUser(newUser.username, [ws1, ws2], [AccessLevel.Basic, AccessLevel.Developer]);
  });

  it('displays the units table and filters by name', () => {
    cy.findAdminGroupSettings(group1).click();
    clickIndexTabWsgAdmin('units');
    cy.get('table').should('be.visible');
    cy.get('studio-lite-search-filter').should('exist');
  });

  it('displays the unit items table and filters by name', () => {
    clickIndexTabWsgAdmin('unit-items');
    cy.get('table').should('be.visible');
    cy.get('studio-lite-search-filter').should('exist');
  });

  it('displays the roles matrix dialog from the users tab', () => {
    clickIndexTabWsgAdmin('users');
    // Select a user first to show the right panel and roles header
    cy.get('mat-row').contains(newUser.username).click();
    cy.get('studio-lite-roles-header').should('be.visible');
    cy.get('studio-lite-roles-header').find('button.help').click();
    cy.get('mat-dialog-container').should('be.visible');

    cy.get('mat-dialog-container').find('studio-lite-roles-matrix').should('exist');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('mat-dialog-container').find('button').contains(json.dialogs.close).click();
    });
  });

  it('displays the settings tab', () => {
    clickIndexTabWsgAdmin('settings');
    cy.get('studio-lite-unit-rich-note-tags-config').should('exist');
  });

  it('enables workspace editing for group admins', () => {
    cy.visitWs(ws1);
    cy.get('[data-cy="units-area-no-access-level"]').should('not.exist');
    cy.get('studio-lite-add-unit-button>button')
      .should('not.have.attr', 'disabled');
  });

  it('cleans up test data', () => {
    logout();
    login(Cypress.expose('username'), Cypress.expose('password'));
    deleteGroup(group1);
    deleteUser('normaluser');
    cy.findAdminSettings().click();
    deleteUser('groupadminuser');
  });
});
