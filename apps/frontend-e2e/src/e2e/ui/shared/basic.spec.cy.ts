import {
  AccessLevel,
  group1,
  modules,
  newUser,
  resource,
  ws1,
  ws2
} from '../../../support/testData';
import {
  addFirstUser,
  addModules,
  addResourcePackage,
  createGroup,
  createNewUser,
  createWs,
  deleteFirstUser,
  deleteGroup,
  deleteAllModules,
  deleteResource,
  deleteUser,
  grantRemovePrivilegeAtWs
} from '../../../support/helpers';

export function createBasicSpecCy() {
  describe('Create test base:', () => {
    // creates the first user
    addFirstUser();
    // admin can add new user
    createNewUser(newUser);

    // admin can create a group (Bereichsgruppe)
    createGroup(group1);

    // admin can create a workspace (Arbeitsbereich) within its Bereichsgruppe
    createWs(ws1, group1);
    grantRemovePrivilegeAtWs([Cypress.env('username'), newUser.username],
      ws1,
      [AccessLevel.Admin, AccessLevel.Developer]);
    createWs(ws2, group1);
    grantRemovePrivilegeAtWs(
      [Cypress.env('username'), newUser.username],
      ws2,
      [AccessLevel.Admin, AccessLevel.Developer]
    );
    // admin can Modules upload',
    addModules(modules);

    // admin can upload the resource package',
    addResourcePackage(resource);
  });
}

export function createBasicData() {
  describe('Create test base:', () => {
    // creates the first user
    addFirstUser();
    // admin can create a group (Bereichsgruppe)
    createGroup(group1);

    // admin can create a workspace (Arbeitsbereich) within its Bereichsgruppe
    createWs(ws1, group1);
    grantRemovePrivilegeAtWs([Cypress.env('username')], ws1, [
      AccessLevel.Admin]);
  });
}

export function deleteBasicSpecCy() {
  describe('Delete test base:', () => {
    // admin can deletes groups
    deleteGroup(group1);

    // admin can delete a user
    deleteUser(newUser.username);

    // admin deletes Modules
    deleteAllModules();

    // admin deletes package resource
    deleteResource();

    // deletes first user
    deleteFirstUser();
  });
}

export function deleteBasicData() {
  describe('Delete test base:', () => {
    // admin can deletes groups
    deleteGroup(group1);
    // deletes first user
    deleteFirstUser();
  });
}
