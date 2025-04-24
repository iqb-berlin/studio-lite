/// <reference types="cypress" />
import {
  addFirstUser,
  createNewUser,
  deleteFirstUser,
  deleteUser,
  login,
  createGroup, createWs, grantRemovePrivilege, deleteGroup, clickSave
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
  //  logout();
  });

  it.skip('should be possible login with credentials', () => {
    login(newUser.username, newUser.password);
    // check that he can not see the button setting for the workspace group
    cy.pause();
  });

  it('deletes the user, group', () => {
    // login(Cypress.env('username'), Cypress.env('password'));
    deleteGroup(group1);
    cy.visit('/');
    deleteUser('normaluser');
  });
});
