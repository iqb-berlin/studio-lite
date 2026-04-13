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
  clickIndexTabWsgAdmin, importExercise
} from '../../../support/helpers';

describe('Workspace Group Administration', () => {
  const groupAdminUser = testUsers.groupAdmin;
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
    cy.resetDb();
  });

  it('sets up test workspace and users', () => {
    createNewUser(newUser);
    createNewUser(groupAdminUser);
    createGroup(group1);
    createWs(ws1, group1);
    grantRemovePrivilegeAtWs([newUser.username, Cypress.expose('username')],
      ws1,
      [AccessLevel.Basic, AccessLevel.Admin]);
    createWs(ws2, group1);
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

  it('restricts workspace to read-only for users with basic access', () => {
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

  it('allows group admin to manage workspace privileges', () => {
    cy.findAdminGroupSettings(group1).click();
    cy.get('[data-cy="wsg-admin-routes-workspaces"]').click();
    grantRemovePrivilegeAtWs([newUser.username, groupAdminUser.username],
      ws1,
      [AccessLevel.Basic, AccessLevel.Admin]);
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
    cy.pause();
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
