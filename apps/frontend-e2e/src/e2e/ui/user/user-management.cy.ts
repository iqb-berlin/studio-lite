import {
  addFirstUser,
  changePassword,
  updatePersonalData,
  createNewUser,
  deleteFirstUser,
  deleteUser,
  login,
  logout,
  loginWithUser
} from '../../../support/util';
import { newUser, UserData } from '../../../support/testData';

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

  it('logs in with valid credentials', () => {
    login(newUser.username, newUser.password);
  });

  it('hides admin settings for normal users', () => {
    cy.findAdminSettings().should('not.exist');
  });

  it('updates personal data (name, email)', () => {
    const newData: UserData = {
      username: newUser.username,
      password: newUser.password,
      lastName: 'Muller',
      firstName: 'Adam',
      email: 'adam.muller@iqb.hu-berlin.de'
    };
    updatePersonalData(newData);
  });

  it('changes password successfully', () => {
    changePassword('newpass', newUser.password);
    loginWithUser(newUser.username, 'newpass');
    changePassword(newUser.password, 'newpass');
  });

  it('logs out successfully', () => {
    logout();
  });

  it('rejects login with invalid credentials', () => {
    cy.login(newUser.username, 'nopass');
    cy.translate(Cypress.env('locale')).then(json => {
      cy.clickButtonWithResponseCheck(json.home.login, [401], '/api/login', 'POST', 'loginFail');
    });
  });
});
