import {
  AccessLevel,
  newUser,
  testGroups,
  testUsers,
  testWorkspaces
} from '../../../support/testData';
import {
  addFirstUser,
  createGroup,
  createNewUser,
  createWs,
  deleteFirstUser,
  deleteGroup,
  deleteUsers,
  grantRemovePrivilegeAtUser,
  grantRemovePrivilegeAtWs,
  login,
  logout,
  makeAdminOfGroup
} from '../../../support/helpers';

describe('Workspace Group Administration', () => {
  const group1 = testGroups.admin;
  const ws1 = testWorkspaces.admin.math1;
  const ws2 = testWorkspaces.admin.german1;
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
    grantRemovePrivilegeAtWs([newUser.username, Cypress.env('username')],
      ws1,
      [AccessLevel.Basic, AccessLevel.Admin]);
    createWs(ws2, group1);
  });

  it('assigns group admin role to user', () => {
    makeAdminOfGroup(group1, [Cypress.env('username'), groupAdminUser.username]);
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

  it('restricts workspace to read-only for users without access', () => {
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

  it('enables workspace editing for group admins', () => {
    cy.visitWs(ws1);
    cy.get('[data-cy="units-area-no-access-level"]').should('not.exist');
    cy.get('studio-lite-add-unit-button>button')
      .should('not.have.attr', 'disabled');
  });

  it('cleans up test data', () => {
    logout();
    login(Cypress.env('username'), Cypress.env('password'));
    deleteGroup(group1);
    deleteUsers(['normaluser', 'groupadminuser']);
  });
});
