/// <reference types="cypress" />
import {
  addFirstUser,
  createNewUser,
  deleteFirstUser,
  deleteUser,
  login,
  createGroup,
  createWs,
  grantRemovePrivilege,
  deleteGroup,
  clickSaveButtonRight,
  logout,
  makeAdminOfGroup,
  findWorkspaceGroupSettings
} from '../../support/util';
import { AccessLevel, UserData } from '../../support/testData';

describe('UI Group admin workspace check', () => {
  const group1:string = 'Mathematik Primär Bereichsgruppe';
  const ws1:string = 'Mathematik I';
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
    grantRemovePrivilege([newUser.username, Cypress.env('username')],
      ws1,
      [AccessLevel.Developer, AccessLevel.Admin]);
    clickSaveButtonRight();
  });

  it('should make user as admin of a workspace group ', () => {
    makeAdminOfGroup(group1, [Cypress.env('username'), groupAdminUser.username]);
    clickSaveButtonRight();
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
    grantRemovePrivilege([newUser.username, groupAdminUser.username],
      ws1,
      [AccessLevel.Basic, AccessLevel.Admin]);
  });

  it('deletes the group, and user', () => {
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
