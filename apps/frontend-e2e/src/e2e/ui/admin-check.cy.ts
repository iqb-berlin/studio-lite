/// <reference types="cypress" />
import {
  addFirstUser, addModules,
  createGroup,
  createNewUser,
  createWs,
  deleteFirstUser,
  deleteGroup, deleteModule, deleteResource,
  deleteUser,
  grantRemovePrivilege
} from '../../support/util';
import { AccessLevel, UserData } from '../../support/testData';

describe('UI Administration Management', () => {
  // eslint-disable-next-line max-len
  const modules:string[] = ['iqb-schemer-2.5.3.html', 'iqb-editor-aspect-2.9.1.html', 'iqb-player-aspect-2.9.1.html'];
  const group1:string = 'Mathematik Primär Bereichsgruppe';
  const ws1:string = 'Mathematik I';
  const resource = 'GeoGebra.itcr.zip';
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

  it('user with admin credentials can Modules upload', () => {
    addModules(modules, 'Module');
  });

  it('user with admin credentials can upload the resource package', () => {
    addModules([resource], 'Pakete');
  });

  it('user with admin credentials deletes Modules', () => {
    deleteModule();
  });

  it('user with admin credentials deletes package resource', () => {
    deleteResource();
  });

  it('user with admin credentials can deletes groups', () => {
    deleteGroup(group1);
  });
});
