import {
  addFirstUser, addModules, addResourcePackage,
  createGroup,
  createNewUser,
  createWs,
  deleteFirstUser,
  deleteGroup, deleteModule, deleteResource,
  deleteUser, findAdminSettings,
  grantRemovePrivilegeAtWs
} from '../../support/util';
import { AccessLevel, modules, UserData } from '../../support/testData';

describe('UI Administration Management', () => {
  // eslint-disable-next-line max-len
  const group1:string = 'Mathematik Primär Bereichsgruppe';
  const ws1:string = 'Mathematik I';
  const resource = 'GeoGebra.itcr.zip';
  const newUser: UserData = {
    username: 'normaluser',
    password: '5678'
  };
  before(() => addFirstUser());
  after(() => deleteFirstUser());

  it('user with admin credentials has admin setting button', () => {
    findAdminSettings();
  });

  it('user with admin credentials can add new user', () => {
    cy.visit('/');
    createNewUser(newUser);
  });

  it('user with admin credentials can delete a user', () => {
    cy.visit('/');
    deleteUser(newUser.username);
  });

  it('user with admin credentials can create a group (Bereichsgruppe)', () => {
    cy.visit('/');
    createGroup(group1);
  });

  it('user with admin credentials can create a workspace(Arbeitsbereich) within its Bereichsgruppe', () => {
    cy.visit('/');
    createWs(ws1, group1);
    grantRemovePrivilegeAtWs([Cypress.env('username')], 'Mathematik I', [AccessLevel.Basic]);
  });

  it('user with admin credentials can Modules upload',
    { defaultCommandTimeout: 100000 },
    () => {
      cy.visit('/');
      addModules(modules);
    });

  it('user with admin credentials can upload the resource package',
    { defaultCommandTimeout: 200000 },
    () => {
      cy.visit('/');
      addResourcePackage(resource);
    });

  it('user with admin credentials deletes Modules', () => {
    cy.visit('/');
    deleteModule();
  });

  it('user with admin credentials deletes package resource', () => {
    cy.visit('/');
    deleteResource();
  });

  it('user with admin credentials can deletes groups', () => {
    cy.visit('/');
    deleteGroup(group1);
  });
});
