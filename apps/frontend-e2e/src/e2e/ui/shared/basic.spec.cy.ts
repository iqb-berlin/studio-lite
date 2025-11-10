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
    cy.visit('/');
    createGroup(group1);

    // admin can create a workspace (Arbeitsbereich) within its Bereichsgruppe
    cy.visit('/');
    createWs(ws1, group1);
    grantRemovePrivilegeAtWs([Cypress.env('username')], 'Grundarbeitsbereich', [AccessLevel.Admin]);

    // admin can Modules upload',
    cy.visit('/');
    addModules(modules);

    // admin can upload the resource package',
    cy.visit('/');
    addResourcePackage(resource);
  });
}

export function createExercisesSpec() {
}

export function deleteBasicSpecCy() {
  describe('Delete test base:', () => {
    // admin can deletes groups
    cy.visit('/');
    deleteGroup(group1);

    // admin can delete a user
    cy.visit('/');
    deleteUser(newUser.username);

    // admin deletes Modules
    cy.visit('/');
    deleteModule();

    // admin deletes package resource
    cy.visit('/');
    deleteResource();

    // deletes first user
    deleteFirstUser();
  });
}
