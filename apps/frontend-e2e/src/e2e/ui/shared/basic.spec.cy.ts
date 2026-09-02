import {
  AccessLevel,
  baseGroup,
  modules,
  standardUser,
  resource,
  primaryWorkspace,
  secondaryWorkspace
} from '../../../support/testData';
import {
  addFirstUser,
  addModules,
  addResourcePackage,
  createGroup,
  createNewUser,
  deleteFirstUser,
  deleteGroup,
  deleteAllModules,
  deleteResource,
  deleteUser
} from '../../../support/helpers';
import {
  createWs,
  grantRemovePrivilegeAtWs
} from '../../../support/helpers/group-admin';

export function createBasicSpecCy() {
  describe('Create test base:', () => {
    // creates the first user
    addFirstUser();

    // admin can add new user
    createNewUser(standardUser);

    // admin can create a group (Bereichsgruppe)
    createGroup(baseGroup);

    // admin can create a workspace (Arbeitsbereich) within its Bereichsgruppe
    createWs(primaryWorkspace, baseGroup);
    grantRemovePrivilegeAtWs([Cypress.expose('username'), standardUser.username],
      primaryWorkspace,
      [AccessLevel.Admin, AccessLevel.Developer]);
    createWs(secondaryWorkspace, baseGroup);
    grantRemovePrivilegeAtWs(
      [Cypress.expose('username'), standardUser.username],
      secondaryWorkspace,
      [AccessLevel.Admin, AccessLevel.Developer]
    );
    // admin can Modules upload',
    addModules(modules);

    // admin can upload the resource package',
    addResourcePackage(resource);
  });
}

export function deleteBasicSpecCy() {
  describe('Delete test base:', () => {
    // admin can deletes groups
    deleteGroup(baseGroup);

    // admin can delete a user
    deleteUser(standardUser.username);

    // admin deletes Modules
    deleteAllModules();

    // admin deletes package resource
    deleteResource();

    // deletes first user
    deleteFirstUser();
  });
}
