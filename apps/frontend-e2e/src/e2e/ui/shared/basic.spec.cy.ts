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
  grantRemovePrivilegeAtWs
} from '../../../support/util';
import {
  AccessLevel,
  group1,
  modules,
  newUser,
  resource,
  ws1
} from '../../../support/testData';

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
      'Grundarbeitsbereich',
      [AccessLevel.Admin, AccessLevel.Developer]);

    // admin can Modules upload',
    addModules(modules);

    // admin can upload the resource package',
    addResourcePackage(resource);
  });
}

export function createExercisesSpec() {
}

export function deleteBasicSpecCy() {
  describe('Delete test base:', () => {
    // admin can deletes groups
    deleteGroup(group1);

    // admin can delete a user
    deleteUser(newUser.username);

    // admin deletes Modules
    deleteModule();

    // admin deletes package resource
    deleteResource();

    // deletes first user
    deleteFirstUser();
  });
}
