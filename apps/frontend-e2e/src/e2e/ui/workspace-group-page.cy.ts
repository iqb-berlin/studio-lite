/// <reference types="cypress" />
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
  findWorkspaceGroupSettings, grantRemovePrivilegeAtUser
} from '../../support/util';
import { AccessLevel, UserData } from '../../support/testData';

describe('UI Group admin workspace check', () => {
  const group1:string = 'Mathematik Primär Bereichsgruppe';
  const ws1:string = 'Mathematik I';
  const ws2:string = 'Deutsch I';
  const groupAdminUser: UserData = {
    username: 'groupadminuser',
    password: '1111'
  };
  const newUser: UserData = {
    username: 'normaluser',
    password: '5678'
  };
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
  });
  beforeEach(() => {
    cy.visit('/');
  });

  it('prepares the context', () => {
    createNewUser(newUser);
    cy.visit('/');
    createNewUser(groupAdminUser);
    cy.visit('/');
    createGroup(group1);
    cy.visit('/');
    createWs(ws1, group1);
    grantRemovePrivilegeAtWs([newUser.username, Cypress.env('username')],
      ws1,
      [AccessLevel.Basic, AccessLevel.Admin]);
    cy.visit('/');
    createWs(ws2, group1);
  });

  it('should make user as admin of a workspace group ', () => {
    makeAdminOfGroup(group1, [Cypress.env('username'), groupAdminUser.username]);
  });

  it('checks that tabs (Nutzer:innen, Arbeitsbereiche and Einstellungen) are present ', () => {
    findWorkspaceGroupSettings(group1).click();
    cy.get('span:contains("Nutzer:innen")')
      .should('exist');
    cy.get('span:contains("Arbeitsbereiche")')
      .should('exist');
    cy.get('span:contains("Einstellungen")')
      .should('exist');
  });

  it('checks that normal user has no workspace group admin setting button ', () => {
    logout();
    login(newUser.username, newUser.password);
    findWorkspaceGroupSettings(group1).should('not.exist');
  });

  it('checks that workspace is only read ', () => {
    cy.contains(ws1).click();
    cy.get('studio-lite-units-area')
      .find('div>div>div:contains("Schreibgeschützt")')
      .should('exist');
    cy.get('studio-lite-add-unit-button>button')
      .should('have.attr', 'disabled');
  });

  it('checks that workspace admin has setting button for the workspace ', () => {
    logout();
    login(groupAdminUser.username, groupAdminUser.password);
    findWorkspaceGroupSettings(group1).should('exist');
  });

  it('checks that workspace admin can remove privileges in workspace within the group ', () => {
    findWorkspaceGroupSettings(group1).click();
    cy.get('span:contains("Arbeitsbereiche")')
      .eq(0)
      .click();
    grantRemovePrivilegeAtWs([newUser.username, groupAdminUser.username],
      ws1,
      [AccessLevel.Basic, AccessLevel.Admin]);
  });

  it('checks that workspace admin can remove privileges in workspace from tab-index user ', () => {
    findWorkspaceGroupSettings(group1).click();
    cy.get('span:contains("Nutzer:innen")')
      .eq(0)
      .click();
    grantRemovePrivilegeAtUser(newUser.username, [ws1, ws2], [AccessLevel.Basic, AccessLevel.Developer]);
  });

  it('checks that workspace is editable for the group admin user ', () => {
    cy.contains(ws1).click();
    cy.get('studio-lite-units-area')
      .find('div>div>div:contains("Schreibgeschützt")')
      .should('not.exist');
    cy.get('studio-lite-add-unit-button>button')
      .should('not.have.attr', 'disabled');
  });

  it('deletes the group, and users', () => {
    logout();
    login(Cypress.env('username'), Cypress.env('password'));
    findWorkspaceGroupSettings(group1).should('exist');
    deleteGroup(group1);
    cy.visit('/');
    deleteUser('normaluser');
    cy.visit('/');
    deleteUser('groupadminuser');
  });
});
