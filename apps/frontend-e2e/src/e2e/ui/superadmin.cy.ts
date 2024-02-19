import {
  changePassword, createNewUser, grantPrivilegeOn, clickButtonToAccept, insertCredentials, logout, visitLoginPage
} from '../../support/util';
import { adminData } from '../../support/config/userdata';

describe('Usermanagement (user-tab)', () => {
  beforeEach(visitLoginPage);

  it.skip('should be possible login with credentials', () => {
    insertCredentials(adminData.user_name, adminData.user_pass);
    clickButtonToAccept('Weiter');
    logout();
  });

  it.skip('should not be able to login with incorrect credentials', () => {
    insertCredentials(adminData.user_name, 'nopass');
    cy.intercept('POST', '/api/login').as('responseLogin');
    clickButtonToAccept('Weiter');
    cy.wait('@responseLogin').its('response.statusCode').should('eq', 401);
  });

  it.skip('should be able to find admin user setting button', () => {
    insertCredentials(adminData.user_name, adminData.user_pass);
    clickButtonToAccept('Weiter');
    cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
      .should('exist')
      .click();
    visitLoginPage();
    logout();
  });

  it('user with admin credentials can add new user', () => {
    insertCredentials(adminData.user_name, adminData.user_pass);
    cy.intercept('POST', '/api/login').as('responseLogin');
    clickButtonToAccept('Weiter');
    cy.wait('@responseLogin').its('response.statusCode').should('eq', 201);
    createNewUser('newuser', 'newpass');
    visitLoginPage();
    logout();
  });

  it('user with admin credentials can delete a user', () => {
    insertCredentials(adminData.user_name, adminData.user_pass);
    clickButtonToAccept('Weiter');
    cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
      .should('exist')
      .click();
    cy.get('mat-table')
      .contains('newuser')
      .should('exist')
      .click();
    // TODO Check also that the column name ist Login-Name
    // cy.contains('mat-table mat-header-cell', 'Login-Name')
    //   .invoke('index')
    //   .should('be.a', 'number')
    //   .then(columnIndex => {
    //     cy.contains('mat-row mat-cell', 'ccc')
    //       .find('mat-column mat-cell')
    //       .invoke('index')
    //       .eq(columnIndex)
    //       .click();
    //   });
    cy.get('mat-icon').contains('delete').click();
    clickButtonToAccept('Löschen');
  });

  it.skip('user with admin credentials can create a Bereichsgruppe', () => {
    insertCredentials(adminData.user_name, adminData.user_pass);
    clickButtonToAccept('Weiter');
    cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
      .should('exist')
      .click();
    cy.get('span:contains("Bereichsgruppen")')
      .eq(0)
      .click();
    cy.get('mat-icon').contains('add').click();
    cy.get('input[placeholder="Name"]')
      .type('Mathematik Primär Bereichsgruppe');
    clickButtonToAccept('Anlegen');
  });

  it.skip('user with admin credentials can assign a Bereichsgruppe', () => {
    grantPrivilegeOn('user', 'Mathematik Primär Bereichsgruppe');
  });

  it('user with admin credentials can Player hochladen', () => {
    // TODO
  });

  it('user with admin credentials can Editor hochladen', () => {
    // TODO
  });

  it('user with admin credentials can Schemer hochladen', () => {
    // TODO
  });
  it('user should be able to logout', () => {
    logout();
  });
});
