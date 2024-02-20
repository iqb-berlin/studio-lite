import {
  createNewUser,
  grantRemovePrivilegeOn,
  clickButtonToAccept,
  login,
  logout,
  visitLoginPage,
  createGroupArea,
  addModule,
  deleteGroupArea
} from '../../support/util';
import { adminData } from '../../support/config/userdata';

describe('Admin Management', () => {
  beforeEach(visitLoginPage);

  it('should be able to find admin user setting button', () => {
    login(adminData.user_name, adminData.user_pass);
    cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
      .should('exist')
      .click();
    visitLoginPage();
    logout();
  });

  it('user with admin credentials can add new user', () => {
    login(adminData.user_name, adminData.user_pass);
    createNewUser('newuser', 'newpass');
    visitLoginPage();
    logout();
  });

  it('user with admin credentials can delete a user', () => {
    login(adminData.user_name, adminData.user_pass);
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
    visitLoginPage();
    logout();
  });

  it('user with admin credentials can create a Bereichsgruppe', () => {
    login(adminData.user_name, adminData.user_pass);
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
    visitLoginPage();
    logout();
  });

  it('prepare the Context', () => {
    login(adminData.user_name, adminData.user_pass);
    const areaGroups = ['Mathematik Primär und Sek I',
      'Deutsch Primär und Sek I',
      'Französisch Sek I',
      'Englisch Sek I'];
    areaGroups.forEach(area => {
      createGroupArea(area);
      visitLoginPage();
    });
    logout();
  });

  it('remove the Context', () => {
    login(adminData.user_name, adminData.user_pass);
    const areaGroups = ['Mathematik Primär und Sek I',
      'Deutsch Primär und Sek I',
      'Französisch Sek I',
      'Englisch Sek I'];
    areaGroups.forEach(area => {
      deleteGroupArea(area);
      visitLoginPage();
    });
    logout();
  });

  it('user with admin credentials can grand access to a Bereichsgruppe', () => {
    login(adminData.user_name, adminData.user_pass);
    grantRemovePrivilegeOn('user', 'Mathematik Primär Bereichsgruppe');
    visitLoginPage();
    logout();
  });

  it('user with admin credentials can Module hochladen', () => {
    login(adminData.user_name, adminData.user_pass);
    addModule();
    visitLoginPage();
    logout();
  });
});
