import {
  createNewUser,
  grantRemovePrivilegeOnGroup,
  clickButtonToAccept,
  login,
  logout,
  visitLoginPage,
  createGroupArea,
  deleteGroupArea, deleteUser, createAreaForGroupFromAdmin, grantRemovePrivilegeOnArea
} from '../../support/util';
import { adminData, userData } from '../../support/config/userdata';

describe('Admin Management', () => {
  beforeEach(visitLoginPage);

  afterEach(() => {
    visitLoginPage();
    logout();
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

  it('should be able to find admin user setting button', () => {
    login(adminData.user_name, adminData.user_pass);
    cy.get('button[ng-reflect-message="Allgemeine Systemverwaltung"]')
      .should('exist')
      .click();
  });

  it('prepare the Context', () => {
    login(adminData.user_name, adminData.user_pass);
    createNewUser(userData.user_name, userData.user_pass);
    visitLoginPage();
    const areaGroups = ['Mathematik Primär und Sek I',
      'Deutsch Primär und Sek I',
      'Französisch Sek I',
      'Englisch Sek I'];
    areaGroups.forEach(area => {
      createGroupArea(area);
      visitLoginPage();
    });
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
    login(adminData.user_name, adminData.user_pass);
    const areaGroups = ['Mathematik Primär und Sek I',
      'Deutsch Primär und Sek I',
      'Französisch Sek I',
      'Englisch Sek I',
      'Mathematik Primär Bereichsgruppe'
    ];
    areaGroups.forEach(area => {
      deleteGroupArea(area);
      visitLoginPage();
    });
    deleteUser(userData.user_name);
  });
  // it('user with admin credentials can Module hochladen', () => {
  //   login(adminData.user_name, adminData.user_pass);
  //   addModule();
  // });
});
