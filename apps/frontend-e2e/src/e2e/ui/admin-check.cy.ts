import {
  createNewUser,
  grantRemovePrivilegeOnGroup,
  clickButtonToAccept,
  login,
  logout,
  visitLoginPage,
  createGroupArea,
  deleteGroupArea, createAreaForGroupFromAdmin, grantRemovePrivilegeOnArea, addFirstUser, deleteFirstUser, addModule
} from '../../support/util';
import { adminData } from '../../support/config/userdata';

describe('Admin Management', () => {
  beforeEach(() => {
    cy.viewport(1600, 900);
    visitLoginPage();
  });

  it('user with admin credentials can add new user', () => {
    addFirstUser();
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
    cy.get('mat-icon').contains('delete').click();
    clickButtonToAccept('Löschen');
    visitLoginPage();
    logout();
  });

  it('should be able to find admin user setting button', () => {
    login(adminData.user_name, adminData.user_pass);
    cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
      .should('exist')
      .click();
    visitLoginPage();
    logout();
  });

  it('user with admin credentials can create a Bereichsgruppe', () => {
    login(adminData.user_name, adminData.user_pass);
    createGroupArea('Mathematik Primär Bereichsgruppe');
    visitLoginPage();
    logout();
  });

  it('user can create a Arbeitsbereich within its Bereichsgruppe', () => {
    login(adminData.user_name, adminData.user_pass);
    createAreaForGroupFromAdmin('Mathematik I', 'Mathematik Primär Bereichsgruppe');
    grantRemovePrivilegeOnArea(adminData.user_name, 'Mathematik I');
    visitLoginPage();
    logout();
  });

  it('user with admin credentials can grand access to a Bereichsgruppe', () => {
    login(adminData.user_name, adminData.user_pass);
    grantRemovePrivilegeOnGroup(adminData.user_name, 'Mathematik Primär Bereichsgruppe');
    visitLoginPage();
    logout();
  });

  it('remove the Context', () => {
    login(adminData.user_name, adminData.user_pass);
    deleteGroupArea('Mathematik Primär Bereichsgruppe');
    visitLoginPage();
    deleteFirstUser();
    visitLoginPage();
    logout();
  });
  it.skip('user with admin credentials can Module hochladen', () => {
    login(adminData.user_name, adminData.user_pass);
    // TODO
    addModule();
  });
  visitLoginPage();
  logout();
});
