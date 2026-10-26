import { standardUser, UserData } from '../../../support/testData';
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
  logout,
  selectUserRow,
  updatePersonalData
} from '../../../support/helpers';

describe('UI User Management', () => {
  before(() => {
    addFirstUser();
    createNewUser(standardUser);
    logout();
  });

  after(() => {
    login(Cypress.expose('username'), Cypress.expose('password'));
    deleteUser(standardUser.username);
    deleteFirstUser();
  });

  // ─── Self-service (logged in as normal user) ─────────────────────────────────

  describe('User options', () => {
    it('logs in with valid credentials', () => {
      login(standardUser.username, standardUser.password);
    });

    it('hides admin settings for normal users', () => {
      cy.findAdminSettings().should('not.exist');
    });

    it('updates personal data (name, email)', () => {
      const newData: UserData = {
        username: standardUser.username,
        password: standardUser.password,
        lastName: 'Muller',
        firstName: 'Adam',
        email: 'adam.muller@iqb.hu-berlin.de'
      };
      updatePersonalData(newData);
    });

    // A changed password ends every session of the account, this one included, and the frontend
    // logs out (#1901).
    it('changes password successfully and asks to log in again', () => {
      changePassword('newpass', standardUser.password);
      cy.get('[data-cy="goto-user-menu"]').should('not.exist');
      cy.get('[data-cy="home-user-name"]').should('be.visible');
      login(standardUser.username, 'newpass');
      changePassword(standardUser.password, 'newpass');
      cy.get('[data-cy="goto-user-menu"]').should('not.exist');
      login(standardUser.username, standardUser.password);
    });

    it('logs out successfully', () => {
      logout();
    });

    it('rejects login with invalid credentials', () => {
      cy.login(standardUser.username, 'nopass');
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
      filterUsers(standardUser.username);
      cy.get('mat-row').should('have.length.at.least', 1);
      cy.get('mat-row').should('contain', standardUser.username);
    });

    it('clears the filter and shows all users again', () => {
      filterUsers(standardUser.username);
      clearUserFilter();
      cy.contains('mat-row', Cypress.expose('username')).should('be.visible');
      cy.contains('mat-row', standardUser.username).should('be.visible');
    });

    it('shows access rights when a user is selected', () => {
      selectUserRow(standardUser.username);
      cy.translate(Cypress.expose('locale')).then(json => {
        const expectedHeader = json['access-rights']['for-user'].replace('{{user}}', standardUser.username);
        cy.get('.object-header').should('contain', expectedHeader);
      });
    });

    it('toggles edit user dialog', () => {
      selectUserRow(standardUser.username);
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.get('button:contains("edit")').click();
        cy.get('mat-dialog-container').should('be.visible');
        cy.get('h1').should('contain', json.admin['edit-user']);
        cy.get('button').contains(json.cancel).click();
      });
    });
  });
});
