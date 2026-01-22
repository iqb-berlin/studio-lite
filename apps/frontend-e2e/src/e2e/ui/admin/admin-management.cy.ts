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
} from '../../../support/util';
import {
  AccessLevel,
  anotherUser,
  modules,
  newUser,
  resource,
  testGroups,
  testWorkspaces
} from '../../../support/testData';

describe('UI Administration Management', () => {
  const group1 = testGroups.admin;
  const ws1 = testWorkspaces.admin.math1;
  before(() => addFirstUser());
  after(() => {
    deleteFirstUser();
    // cy.resetDb();
  });

  it('displays admin settings button for admin users', () => {
    cy.findAdminSettings().click();
  });

  it('creates a new user', () => {
    createNewUser(newUser);
  });

  it('deletes a user', () => {
    deleteUser(newUser.username);
  });

  it('deletes multiple users at once', () => {
    createNewUser(newUser);
    createNewUser(anotherUser);
    deleteUsers([newUser.username, anotherUser.username]);
  });

  it('creates a workspace group', () => {
    createGroup(group1);
  });

  it('creates a workspace within a group', () => {
    createWs(ws1, group1);
    grantRemovePrivilegeAtWs([Cypress.env('username')], 'Mathematik I', [AccessLevel.Basic]);
  });

  it('uploads Verona modules',
    { defaultCommandTimeout: 100000 },
    () => {
      addModules(modules);
    });

  it('uploads a resource package',
    { defaultCommandTimeout: 200000 },
    () => {
      addResourcePackage(resource);
    });

  it('deletes Verona modules', () => {
    deleteModule();
  });

  it('deletes a resource package', () => {
    deleteResource();
  });

  it('deletes a workspace group', () => {
    deleteGroup(group1);
  });
});
