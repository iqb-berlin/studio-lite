import {
  AccessLevel,
  group1,
  newUser,
  ws1
} from '../../support/testData';
import {
  clickIndexTabWsgAdmin,
  getButtonReview,
  goToWsMenu,
  grantRemovePrivilegeAtWs,
  importExercise,
  login,
  logout,
  selectCheckBox
} from '../../support/util';
import { createBasicSpecCy, deleteBasicSpecCy } from './shared/basic.spec.cy';

describe('Review:', () => {
  before(() => {
    createBasicSpecCy();
  });

  after(() => {
    deleteBasicSpecCy();
  });

  const review:string = 'Review1';
  it('should import units', () => {
    cy.visit('/');
    cy.visitWs(ws1);
    importExercise('test_studio_units_download.zip');
  });

  it('should add a review', () => {
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

  it('should check that review exists', () => {
    cy.visit('/');

    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.get(`a:contains("${review}")`).should('exist');
    });
  });

  it('should open a review and assert that nav bar exists', () => {
    cy.visit('/');
    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.get(`a:contains("${review}")`).click();
    });

    // Headers should exit
    cy.get('.start-data').should('exist');

    // unit nav bar should exit
    cy.get('studio-lite-unit-nav').within(() => {
      cy.get('i:contains("chevron_left")').should('exist');
      cy.get('i:contains("chevron_right")').should('exist');
      // go to the next page
      cy.get('.mat-mdc-list-item:contains("1")').should('exist');
      // cy.contains('.mat-mdc-list-item', '1').click();
    });
  });

  it('should other user access to the review', () => {
    cy.visit('/');
    cy.findAdminGroupSettings(group1).click();
    clickIndexTabWsgAdmin('workspaces');
    grantRemovePrivilegeAtWs([newUser.username], ws1, [AccessLevel.Basic]);
    cy.visit('/');
    logout();
    login(newUser.username, newUser.password);
    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.get(`a:contains("${review}")`).should('exist');
    });
    logout();
    login(Cypress.env('username'), Cypress.env('password'));
  });

  it('should export a review', () => {
    cy.visit('/');
    cy.visitWs(ws1);
    goToWsMenu();
    getButtonReview(review, 'get_app');
    cy.clickButton('Herunterladen');
    cy.clickButton('Schließen');
  });

  it('should print a review', () => {
    cy.visit('/');
    cy.visitWs(ws1);
    goToWsMenu();
    getButtonReview(review, 'print');
    cy.clickButton('Drucken');
    cy.clickButton('Schließen');
  });

  it('should modify a review', () => {
    cy.visit('/');
    cy.visitWs(ws1);
    goToWsMenu();
    cy.get('span:contains("Aufgabenfolgen")').click();
    cy.contains('mat-row', review).click();
    selectCheckBox('M6_AK0013');
    cy.get('studio-lite-save-changes').within(() => {
      cy.clickButton('Speichern');
    });
    cy.clickButton('Schließen');
  });

  it('should check that the review was modified', () => {
    cy.visit('/');
    cy.get('studio-lite-user-reviews-area').within(() => {
      cy.get(`a:contains("${review}")`).click();
    });
    // unit nav bar should exit
    cy.get('studio-lite-unit-nav').within(() => {
      cy.get('i:contains("chevron_left")').should('exist');
      cy.get('i:contains("chevron_right")').should('exist');
      // checks that the review is updated
      cy.reload();
      cy.wait(100);
      cy.get('.mat-mdc-list-item:contains("3")').should('exist');
    });
  });

  it('should delete the review', () => {
    cy.visit('/');
    cy.visitWs(ws1);
    goToWsMenu();
    getButtonReview(review, 'delete');
    cy.clickButton('Löschen');
    cy.clickButton('Schließen');
  });
});
