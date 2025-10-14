import {
  addFirstUser,
  addModules,
  addResourcePackage,
  createGroup,
  createNewUser,
  createWs,
  deleteGroup,
  deleteModule,
  deleteResource,
  deleteUser,
  findAdminSettings,
  grantRemovePrivilegeAtWs,
  importExercise
} from '../../../support/util';
import {
  AccessLevel,
  modules,
  resource,
  UserData
} from '../../../support/testData';

export function createBasicSpecCytog() {
  describe('Create test base:', () => {
    const group1:string = 'Mathematik Primär Bereichsgruppe';
    const ws1:string = 'Mathematik I';
    const newUser: UserData = {
      username: 'normaluser',
      password: '5678'
    };
    it('a. Create the first user', () => {
      cy.log('dentro');
      addFirstUser();
    });
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
  });
}

export function createExercisesSpec() {
  describe('Creates exercises:', () => {
    const ws1:string = 'Grundarbeitsbereich';
    it('h. Admin add exercises', () => {
      cy.visit('/');
      cy.visitWs(ws1);
      importExercise('test_studio_units_download.zip');
    });
  });
}

export function deleteBasicSpecCy() {
  describe('Deletes test base:', () => {
    const group1:string = 'Grundgruppe';
    it('h. Admin can delete modules', () => {
      cy.visit('/');
      deleteModule();
    });

    it('i. Admin can delete package resource', () => {
      cy.visit('/');
      deleteResource();
    });

    it('j. user with admin credentials can deletes groups', () => {
      cy.visit('/');
      deleteGroup(group1);
    });
  });
}
