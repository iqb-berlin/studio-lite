/// <reference types="cypress" />
import {
  addFirstUser,
  createGroup,
  createNewUser,
  createWs,
  deleteFirstUser,
  deleteGroup,
  deleteUser,
  grantRemovePrivilege
} from '../../support/util';
import { AccessLevel, UserData } from '../../support/testData';

describe('UI Administration Management', () => {
  // const modules:string[] = ['iqb-schemer-2.0.0-beta.html', 'iqb-editor-aspect-2.5.0-beta5.html', 'iqb-player-aspect-2.5.0-beta5.html'];
  const group1:string = 'Mathematik Primär Bereichsgruppe';
  const ws1:string = 'Mathematik I';
  const newUser: UserData = {
    username: 'normaluser',
    password: '5678'
  };
  before(() => addFirstUser());
  after(() => deleteFirstUser());

  beforeEach(() => {
    cy.visit('/');
  });
  it('user with admin credentials can add new user', () => {
    createNewUser(newUser);
  });

  it('user with admin credentials can delete a user', () => {
    deleteUser(newUser.username);
  });

  it('user with admin credentials can create a group (Bereichsgruppe)', () => {
    createGroup(group1);
  });

  it('user with admin credentials can create a workspace(Arbeitsbereich) within its Bereichsgruppe', () => {
    createWs(ws1, group1);
    grantRemovePrivilege(Cypress.env('username'), 'Mathematik I', AccessLevel.Basic);
  });

  // it('user with admin credentials can Modules upload', () => {
  //   addModules(modules);
  // });
  //
  // it('user with admin credentials delete Modules', () => {
  //   deleteModule();
  // });

  it('user with admin credentials can delete groups', () => {
    deleteGroup(group1);
  });
});
