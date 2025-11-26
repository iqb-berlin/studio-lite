import {
  addFirstUser,
  addModules,
  addResourcePackage,
  createGroup,
  createNewUser,
  createWs,
  deleteFirstUser,
  deleteGroup,
  deleteModule,
  deleteResource,
  deleteUser,
  deleteUsers,
  grantRemovePrivilegeAtWs
} from '../../support/util';
import {
  AccessLevel, anotherUser,
  modules,
  newUser,
  resource
} from '../../support/testData';

describe('UI Administration Management', () => {
  const group1:string = 'Mathematik Primär Bereichsgruppe';
  const ws1:string = 'Mathematik I';
  before(() => addFirstUser());
  after(() => deleteFirstUser());

  it('user with admin credentials has admin setting button', () => {
    cy.findAdminSettings().click();
  });

  it('user with admin credentials can add new user', () => {
    createNewUser(newUser);
  });

  it('user with admin credentials can delete a user', () => {
    deleteUser(newUser.username);
  });

  it('user admin creates two users and select them to delete together', () => {
    createNewUser(newUser);
    createNewUser(anotherUser);
    deleteUsers([newUser.username, anotherUser.username]);
  });

  it('user with admin credentials can create a group (Bereichsgruppe)', () => {
    createGroup(group1);
  });

  it('user with admin credentials can create a workspace(Arbeitsbereich) within its Bereichsgruppe', () => {
    createWs(ws1, group1);
    grantRemovePrivilegeAtWs([Cypress.env('username')], 'Mathematik I', [AccessLevel.Basic]);
  });

  it('user with admin credentials can Modules upload',
    { defaultCommandTimeout: 100000 },
    () => {
      addModules(modules);
    });

  it('user with admin credentials can upload the resource package',
    { defaultCommandTimeout: 200000 },
    () => {
      addResourcePackage(resource);
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
