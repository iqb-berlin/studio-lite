/// <reference types="cypress" />
import {
  addFirstUser,
  createNewUser,
  deleteFirstUser,
  deleteUser,
  login,
  createGroup, createWs, grantRemovePrivilege, deleteGroup, clickSave, logout, makeAdminOfGroup
} from '../../support/util';
import { AccessLevel, UserData } from '../../support/testData';

describe('UI Group admin workspace check', () => {
  const group1:string = 'Mathematik Primär Bereichsgruppe';
  const ws1:string = 'Mathematik I';
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
    createGroup(group1);
    cy.visit('/');
    createWs(ws1, group1);
    grantRemovePrivilege([newUser.username, Cypress.env('username')],
      ws1,
      [AccessLevel.Developer, AccessLevel.Admin]);
    clickSave();
  });

  it('checks that group-admin has Setting wheel exists for the admin', () => {
    cy.get('studio-lite-wrapped-icon')
      .contains('mat-icon', 'settings')
      .should('exist');
  });

  it('should be possible make users as admin of a workspace group ', () => {
    makeAdminOfGroup(group1, [Cypress.env('username')]);
  });

  it('checks that normal user has no admin setting button. ', () => {
    logout();
    login(newUser.username, newUser.password);
    cy.get('studio-lite-user-workspaces-groups')
      .contains('mat-icon', 'settings')
      .should('not.exist');
  });

  it('checks that workspace admin has setting button for the workspace', () => {
    logout();
    login(Cypress.env('username'), Cypress.env('password'));
    cy.get('studio-lite-user-workspaces-groups')
      .contains('mat-icon', 'settings')
      .should('exist');
  });

  it('deletes the group, and user', () => {
    cy.pause();
    deleteGroup(group1);
    cy.visit('/');
    deleteUser('normaluser');
  });
});
