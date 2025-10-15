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
  deleteUser, goToWsMenu,
  grantRemovePrivilegeAtWs,
  importExercise
} from '../../../support/util';
import {
  AccessLevel,
  modules,
  resource,
  UserData
} from '../../../support/testData';

export function createBasicSpecCy() {
  describe('Create test base:', () => {
    const group1:string = 'Grundgruppe';
    const ws1:string = 'Grundarbeitsbereich';
    const newUser: UserData = {
      username: 'normaluser',
      password: '5678'
    };
    it('creates the first user', () => {
      addFirstUser();
    });

    it('admin can add new user', () => {
      createNewUser(newUser);
    });

    it('admin can create a group (Bereichsgruppe)', () => {
      cy.visit('/');
      createGroup(group1);
    });

    it('admin can create a workspace (Arbeitsbereich) within its Bereichsgruppe', () => {
      cy.visit('/');
      createWs(ws1, group1);
      grantRemovePrivilegeAtWs([Cypress.env('username')], 'Grundarbeitsbereich', [AccessLevel.Admin]);
    });

    it('admin can Modules upload',
      () => {
        cy.visit('/');
        addModules(modules);
      });

    it('admin can upload the resource package',
      () => {
        cy.visit('/');
        addResourcePackage(resource);
      });
  });
}

export function createExercisesSpec() {
  describe('Creates exercises:', () => {
    const ws1:string = 'Grundarbeitsbereich';
    it('admin add exercises', () => {
      cy.visit('/');
      cy.visitWs(ws1);
      cy.pause();
      importExercise('test_studio_units_download.zip');
      cy.pause();
    });
    it('admin add review', () => {
      goToWsMenu();
      cy.get('span:contains("Aufgabenfolgen")').click();
      cy.get('studio-lite-add-review-button').within(() => {
        cy.contains('button', 'add').click();
        cy.contains('input[placeholder="Name der Aufgabenfolge"]').type('Review1');
        cy.clickButton('Speichern');
      });
      cy.get('');
    });
  });
}

export function deleteBasicSpecCy() {
  describe('Delete test base:', () => {
    const group1:string = 'Grundgruppe';
    const newUser: UserData = {
      username: 'normaluser',
      password: '5678'
    };
    it('admin can deletes groups', () => {
      cy.visit('/');
      deleteGroup(group1);
    });

    it('admin can delete a user', () => {
      cy.visit('/');
      deleteUser(newUser.username);
    });

    it('admin deletes Modules', () => {
      cy.visit('/');
      deleteModule();
    });

    it('admin deletes package resource', () => {
      cy.visit('/');
      deleteResource();
    });

    it('deletes first user', () => {
      deleteFirstUser();
    });
  });
}
