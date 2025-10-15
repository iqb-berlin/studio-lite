import {
  AccessLevel,
  modules,
  resource,
  UserData
} from '../../support/testData';
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
  getUnitNames,
  goToWsMenu,
  grantRemovePrivilegeAtWs,
  importExercise
} from '../../support/util';

describe('Review:', () => {
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

  describe('Creates exercises:', () => {
    const ws1:string = 'Grundarbeitsbereich';
    const reviewName: string = 'Review1';
    it('admin add exercises', () => {
      cy.visit('/');
      cy.visitWs(ws1);
      importExercise('test2_studio_units_download.zip');
      const unitNames = getUnitNames();
      cy.log(unitNames.toString());
      console.log(unitNames.toString());
    });
    it('admin add review', () => {
      goToWsMenu();
      cy.get('span:contains("Aufgabenfolgen")').click();
      cy.get('studio-lite-add-review-button').within(() => {
        cy.contains('button', 'add').click();
      });
      cy.contains('mat-dialog-container', 'Neue Aufgabenfolge')
        .find('input[placeholder="Name der Aufgabenfolge"]').type(reviewName);
      cy.contains('mat-dialog-container', 'Neue Aufgabenfolge')
        .find('button:contains("Speichern")').click();
    });
    it('adds Units for the is review', () => {
      cy.contains(reviewName).should('exist').click();
    });
    it('checks that review is present', () => {
      cy.get('studio-lite-select-unit-list').within(() => {
        cy.get('mat-cell:contains("Neu1")').prev().click();
        cy.get('mat-cell:contains("Neu2")').prev().click();
      });
      cy.get('studio-lite-save-changes').within(() => {
        cy.clickButton('Speichern');
      });
      cy.clickButton('Schließen');
    });

    it('checks that Review is at home page', () => {
      cy.visit('/');
      cy.get('studio-lite-review-table').within(() => {
        cy.get(`mat-cell:contains("${reviewName}")`).should('exist');
      });
    });

    it('checks that the detail button works', () => {
      cy.get('studio-lite-review-table').within(() => {
        cy.get(`mat-cell:contains("${ws1}")`).should('not.exist');
        cy.get('mat-icon:contains("table_chart")').click();
        cy.get(`mat-cell:contains("${ws1}")`).should('exist');
      });
    });

    it.skip('checks that we can start the review', () => {
      cy.get(`mat-cell:contains("${reviewName}")`).click();
      cy.get('Review einer Aufgabenfolge').should('exist');
    });

    it.skip('nav-bar', () => {
      cy.get('studio-lite-unit-nav')
        .contains('mat-selection-list mat-list-option:contains("1")')
        .should('exist');
      cy.get('studio-lite-unit-nav')
        .contains('mat-selection-list mat-list-option:contains("2")')
        .should('exist');
    });

    it.skip('nav-bar', () => {
      cy.get('studio-lite-unit-nav')
        .contains('mat-selection-list mat-list-option:contains("1")').click();
      cy.get('studio-lite-unit-nav').contains('a', 'chveron_right').click();
    });
  });

  describe('Delete test base:', () => {
    const group1:string = 'Grundgruppe';
    const newUser: UserData = {
      username: 'normaluser',
      password: '5678'
    };
    it('admin can deletes groups', () => {
      cy.pause();
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
});
