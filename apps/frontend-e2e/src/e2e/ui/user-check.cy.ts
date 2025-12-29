import {
  addFirstUser,
  changePassword,
  updatePersonalData,
  createNewUser,
  deleteFirstUser,
  deleteUser,
  login,
  logout
} from '../../support/util';
import { newUser, UserData } from '../../support/testData';

describe('UI User Management', () => {
  before(() => {
    addFirstUser();
    createNewUser(newUser);
    logout();
  });
  after(() => {
    login(Cypress.env('username'), Cypress.env('password'));
    deleteUser('normaluser');
    deleteFirstUser();
    // cy.resetDb();
  });

  it('should be possible login with credentials', () => {
    login(newUser.username, newUser.password);
  });

  it('should not be able to find admin user setting button', () => {
    cy.findAdminSettings().should('not.exist');
  });

  it('should be able to modify personal data', () => {
    const newData:UserData = {
      username: newUser.username,
      password: newUser.password,
      lastName: 'Muller',
      firstName: 'Adam',
      email: 'adam.muller@iqb.hu-berlin.de'
    };
    updatePersonalData(newData);
  });

  it('should be possible to change the password', () => {
    changePassword('newpass', newUser.password);
    logout();
    login(newUser.username, 'newpass');
    changePassword(newUser.password, 'newpass');
  });

  it('should be able to log out', () => {
    logout();
  });

  it('should not be able to login with incorrect credentials', () => {
    cy.login(newUser.username, 'nopass');
    // Anmelden
    cy.translate('de').then(json => {
      cy.clickButtonWithResponseCheck(json.home.login, [401], '/api/login', 'POST', 'loginFail');
    });
  });
});
