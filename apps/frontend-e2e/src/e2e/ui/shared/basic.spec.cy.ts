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
  goToWsMenu,
  grantRemovePrivilegeAtWs,
  importExercise,
  selectCheckBox
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
    const review:string = 'Review1';
    it('admin add exercises', () => {
      cy.visit('/');
      cy.visitWs(ws1);
      importExercise('test_studio_units_download.zip');
    });

    it('admin add review', () => {
      goToWsMenu();
      cy.get('span:contains("Aufgabenfolgen")').click();
      cy.get('studio-lite-add-review-button').within(() => {
        cy.contains('button', 'add').click();
      });
      cy.get('input[placeholder="Name der Aufgabenfolge"]')
        .should('exist')
        .clear()
        .type(review);

      cy.get('.mat-mdc-dialog-component-host > .mat-mdc-dialog-actions').within(() => {
        cy.clickButton('Speichern');
      });

      selectCheckBox('M6_AK0011');
      selectCheckBox('M6_AK0012');

      cy.get('studio-lite-save-changes').within(() => {
        cy.clickButton('Speichern');
      });
      cy.clickButton('Schließen');
    });

    it('admin checks the review exist', () => {
      cy.visit('/');
      cy.get('studio-lite-user-reviews-area').within(() => {
        cy.get(review).should('exist');
      });
    });

    it('admin opens the review', () => {
      cy.visit('/');
      cy.get('studio-lite-user-reviews-area').within(() => {
        cy.get(review).click();
      });
      cy.pause();
      // Headers should exit
      cy.get('.start-data').should('exist');
      cy.pause();
      // unit nav bar should exit
      cy.get('studio-lite-unit-nav').within(() => {
        cy.get('i:contains("chevron_left")').should('exist');
      });
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
