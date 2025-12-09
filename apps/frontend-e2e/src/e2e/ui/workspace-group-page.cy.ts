import {
  addFirstUser,
  createNewUser,
  deleteFirstUser,
  deleteUser,
  login,
  createGroup,
  createWs,
  grantRemovePrivilegeAtWs,
  deleteGroup,
  logout,
  makeAdminOfGroup,
  grantRemovePrivilegeAtUser
} from '../../support/util';
import { AccessLevel, newUser, UserData } from '../../support/testData';

describe('UI Group admin workspace check', () => {
  const group1:string = 'Mathematik Primär Bereichsgruppe';
  const ws1:string = 'Mathematik I';
  const ws2:string = 'Deutsch I';
  const groupAdminUser: UserData = {
    username: 'groupadminuser',
    password: '1111'
  };
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
    // cy.resetDb();
  });

  it('prepares the context', () => {
    createNewUser(newUser);
    createNewUser(groupAdminUser);
    createGroup(group1);
    createWs(ws1, group1);
    grantRemovePrivilegeAtWs([newUser.username, Cypress.env('username')],
      ws1,
      [AccessLevel.Basic, AccessLevel.Admin]);
    createWs(ws2, group1);
  });

  it('should make user as admin of a workspace group ', () => {
    makeAdminOfGroup(group1, [Cypress.env('username'), groupAdminUser.username]);
  });

  it('checks that tabs (Nutzer:innen, Arbeitsbereiche, Augaben and Einstellungen) are present ', () => {
    cy.findAdminGroupSettings(group1).click();
    cy.get('[data-cy="wsg-admin-routes-users"]').should('exist');
    cy.get('[data-cy="wsg-admin-routes-workspaces"]').should('exist');
    cy.get('[data-cy="wsg-admin-routes-units"]').should('exist');
    cy.get('[data-cy="wsg-admin-routes-settings"]').should('exist');
  });

  it('checks that normal user has no workspace group admin setting button ', () => {
    logout();
    login(newUser.username, newUser.password);
    cy.findAdminGroupSettings(group1).should('not.exist');
  });

  it('checks that workspace is only read ', () => {
    cy.contains(ws1).click();
    // Schreibgeschützt
    cy.get('[data-cy="units-area-no-access-level"]').should('exist');
    cy.get('studio-lite-add-unit-button>button')
      .should('have.attr', 'disabled');
  });

  it('checks that workspace admin has setting button for the workspace ', () => {
    logout();
    login(groupAdminUser.username, groupAdminUser.password);
    cy.findAdminGroupSettings(group1).should('exist');
  });

  it('checks that workspace admin can remove privileges in workspace within the group ', () => {
    cy.findAdminGroupSettings(group1).click();
    cy.get('[data-cy="wsg-admin-routes-workspaces"]').click();
    grantRemovePrivilegeAtWs([newUser.username, groupAdminUser.username],
      ws1,
      [AccessLevel.Basic, AccessLevel.Admin]);
  });

  it('checks that workspace admin can remove privileges in workspace from tab-index user ', () => {
    cy.findAdminGroupSettings(group1).click();
    cy.get('[data-cy="wsg-admin-routes-users"]').click();
    grantRemovePrivilegeAtUser(newUser.username, [ws1, ws2], [AccessLevel.Basic, AccessLevel.Developer]);
  });

  it('checks that workspace is editable for the group admin user ', () => {
    cy.visitWs(ws1);
    cy.get('[data-cy="units-area-no-access-level"]').should('not.exist');
    cy.get('studio-lite-add-unit-button>button')
      .should('not.have.attr', 'disabled');
  });

  it('deletes the group, and users', () => {
    logout();
    cy.wait(200);
    login(Cypress.env('username'), Cypress.env('password'));
    cy.findAdminGroupSettings(group1).should('exist');
    deleteGroup(group1);
    deleteUser('normaluser');
    deleteUser('groupadminuser');
  });
});
