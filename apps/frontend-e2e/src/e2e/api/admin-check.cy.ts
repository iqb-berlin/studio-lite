import {
  createNewUser,
  grantRemovePrivilegeFromAdminSettings,
  clickButtonToAccept,
  login,
  logout,
  visitLoginPage,
  createGroupArea,
  deleteGroupArea,
  createAreaForGroupFromAdmin,
  grantRemovePrivilegeFromGroup,
  addFirstUser,
  deleteFirstUser,
  addModule,
  deleteModule
} from '../../support/util/util';
import { adminData } from '../../support/config/userdata';

describe('Admin Management', () => {
  let testIndex = 0;

  beforeEach(() => {
    cy.viewport(1600, 900);
    testIndex += 1;
    visitLoginPage();
    if (testIndex !== 1) {
      login(adminData.user_name, adminData.user_pass);
    }
  });

  afterEach(() => {
    if (testIndex !== 1 && testIndex ! < 10) {
      visitLoginPage();
      logout();
    }
  });

  it('add the first User', () => {
    addFirstUser();
  });

  it('user with admin credentials can add new user', () => {
    createNewUser('newuser', 'newpass');
  });

  it('user with admin credentials can delete a user', () => {
    cy.get('[data-cy="goto-admin"]').click();
    cy.get('mat-table')
      .contains('newuser')
      .should('exist')
      .click();
    cy.get('mat-icon').contains('delete').click();
    clickButtonToAccept('Löschen');
  });

  it('user with admin credentials can create a Bereichsgruppe', () => {
    createGroupArea('Mathematik Primär Bereichsgruppe');
  });

  it('user can create a Arbeitsbereich within its Bereichsgruppe', () => {
    createAreaForGroupFromAdmin('Mathematik I', 'Mathematik Primär Bereichsgruppe');
    grantRemovePrivilegeFromGroup(adminData.user_name, 'Mathematik I', 'read');
  });

  it('user with admin credentials can grand access to a Bereichsgruppe with read permissions', () => {
    grantRemovePrivilegeFromAdminSettings(adminData.user_name, 'Mathematik Primär Bereichsgruppe');
  });
  it('user with admin credentials can Modules upload', () => {
    addModule();
  });

  it('user with admin credentials delete Modules', () => {
    deleteModule();
  });

  it('remove the Context', () => {
    deleteGroupArea('Mathematik Primär Bereichsgruppe');
    visitLoginPage();
    deleteFirstUser();
  });
  /*
  it('should be able to add notice warning and set its duration', () => {
  });
  it('should be able to change the title of the application', () => {
  });
  it('should be able to change the content of te secondary box', () => {
  });
  it('should be able to edit the legal notice and data protection', () => {
  });
  it('should be able to change the apps logo', () => {
  });
  it('should be able to change the background color of the application', () => {
  });
  it('should be able to change the background of the secondary box', () => {
  });
  it('should be able to add the parameter for unit export', () => {
  }); */
});
