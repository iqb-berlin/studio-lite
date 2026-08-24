import { newUser, UserData } from '../../../support/testData';
import {
  addFirstUser,
  changePassword,
  clearUserFilter,
  createNewUser,
  deleteFirstUser,
  deleteUser,
  filterUsers,
  goToAdminUsers,
  login,
  loginWithUser,
  logout,
  selectUserRow,
  updatePersonalData
} from '../../../support/helpers';

describe('UI User Management', () => {
  before(() => {
    addFirstUser();
    createNewUser(newUser);
    logout();
  });

  after(() => {
    login(Cypress.expose('username'), Cypress.expose('password'));
    deleteUser(newUser.username);
    deleteFirstUser();
  });

  // ─── Self-service (logged in as normal user) ─────────────────────────────────

  describe('User options', () => {
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
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.clickButtonWithResponseCheck(json.home.login, [401], '/api/login', 'POST', 'loginFail');
      });
    });
  });

  // ─── Admin view of the user table ─────────────────────────────────────────────

  describe('Administrative User Management', () => {
    beforeEach(() => {
      login(Cypress.expose('username'), Cypress.expose('password'));
      goToAdminUsers();
    });

    afterEach(() => {
      logout();
    });

    it('displays the users table and filters by name', () => {
      cy.get('mat-table').should('be.visible');
      filterUsers(newUser.username);
      cy.get('mat-row').should('have.length.at.least', 1);
      cy.get('mat-row').should('contain', newUser.username);
    });

    it('clears the filter and shows all users again', () => {
      filterUsers(newUser.username);
      clearUserFilter();
      cy.contains('mat-row', Cypress.expose('username')).should('be.visible');
      cy.contains('mat-row', newUser.username).should('be.visible');
    });

    it('shows access rights when a user is selected', () => {
      selectUserRow(newUser.username);
      cy.translate(Cypress.expose('locale')).then(json => {
        const expectedHeader = json['access-rights']['for-user'].replace('{{user}}', newUser.username);
        cy.get('.object-header').should('contain', expectedHeader);
      });
    });

    it('toggles edit user dialog', () => {
      selectUserRow(newUser.username);
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.get('button:contains("edit")').click();
        cy.get('mat-dialog-container').should('be.visible');
        cy.get('h1').should('contain', json.admin['edit-user']);
        cy.get('button').contains(json.cancel).click();
      });
    });
  });
});
