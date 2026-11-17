import { AccessLevel, standardUser, UserData } from '../../../support/testData';
import {
  changePassword,
  clearUserFilter,
  filterUsers,
  goToAdminUsers,
  login,
  logout,
  selectUserRow,
  updatePersonalData
} from '../../../support/helpers';

describe('UI User Management', () => {
  // a group the standard user works in without administering it (#2155)
  const memberGroup = { id: '', name: 'Gruppe ohne Adminrecht' };

  before(() => {
    cy.addFirstUserAPI(Cypress.expose('username'), Cypress.expose('password')).then(init => {
      expect(init.status, 'first user').to.equal(201);
      const token = init.body.accessToken;
      cy.createUserAPI(standardUser, token).then(user => {
        expect(user.status, 'standard user').to.equal(201);
        cy.createGroupAPI(memberGroup, token).then(group => {
          memberGroup.id = String(group.body);
          cy.createWsAPI(memberGroup.id, { id: '', name: 'Bereich ohne Adminrecht' }, token).then(ws => {
            cy.updateUsersOfWsAPI(String(ws.body), AccessLevel.Developer, String(user.body), token)
              .its('status').should('equal', 200);
          });
        });
      });
    });
  });

  // ─── Self-service (logged in as normal user) ─────────────────────────────────

  describe('User options', () => {
    it('logs in with valid credentials', () => {
      login(standardUser.username, standardUser.password);
    });

    it('hides admin settings for normal users', () => {
      cy.findAdminSettings().should('not.exist');
    });

    // Typed into the address bar, both pages opened for anyone logged in, and only the API refused
    // what was on them (#2155)
    it('sends a normal user who opens the administration by its address to the start page (#2155)', () => {
      ['#/admin', `#/wsg-admin/${memberGroup.id}`].forEach(page => {
        // loaded afresh, as a typed address is: a change of the hash alone would not reload the page
        cy.window().then(win => win.history.replaceState(null, '', `/${page}`));
        cy.reload();
        cy.location('hash').should('equal', '#/home');
        cy.get('[data-cy="goto-user-menu"]').should('exist');
        cy.get('.error-container').should('not.exist');
      });
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
