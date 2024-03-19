import {
  createNewUser,
  grantRemovePrivilegeOnGroup,
  clickButtonToAccept,
  login,
  logout,
  visitLoginPage,
  createGroupArea,
  deleteGroupArea, createAreaForGroupFromAdmin, grantRemovePrivilegeOnArea, addModule
} from '../../support/util';
import { adminData } from '../../support/config/userdata';

describe('Admin Management', () => {
  beforeEach(visitLoginPage);

  afterEach(() => {
    visitLoginPage();
    logout();
  });
  it.skip('Create the superadmin', () => {
    cy.get('input[placeholder="Anmeldename"]')
      .should('exist')
      .clear()
      .type(adminData.user_name);
    cy.get('input[placeholder="Kennwort"]')
      .should('exist')
      .clear()
      .type(adminData.user_pass);
    clickButtonToAccept('Weiter');
  });

  it('user with admin credentials can add new user', () => {
    login(adminData.user_name, adminData.user_pass);
    createNewUser('newuser', 'newpass');
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
  });

  it('should be able to find admin user setting button', () => {
    login(adminData.user_name, adminData.user_pass);
    cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
      .should('exist')
      .click();
  });

  it('user with admin credentials can create a Bereichsgruppe', () => {
    login(adminData.user_name, adminData.user_pass);
    createGroupArea('Mathematik Primär Bereichsgruppe');
  });

  it('user can create a Arbeitsbereich within its Bereichsgruppe', () => {
    login(adminData.user_name, adminData.user_pass);
    createAreaForGroupFromAdmin('Mathematik I', 'Mathematik Primär Bereichsgruppe');
    grantRemovePrivilegeOnArea(adminData.user_name, 'Mathematik I');
  });

  it('user with admin credentials can grand access to a Bereichsgruppe', () => {
    login(adminData.user_name, adminData.user_pass);
    grantRemovePrivilegeOnGroup(adminData.user_name, 'Mathematik Primär Bereichsgruppe');
  });

  it('remove the Context', () => {
    cy.pause();
    login(adminData.user_name, adminData.user_pass);
    deleteGroupArea('Mathematik Primär Bereichsgruppe');
    visitLoginPage();
  });
  it.skip('user with admin credentials can Module hochladen', () => {
    login(adminData.user_name, adminData.user_pass);
    addModule();
  });
});
