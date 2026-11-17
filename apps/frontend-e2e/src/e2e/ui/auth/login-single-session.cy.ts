import { addFirstUser, logout } from '../../../support/helpers';
import { sessionIdOf } from '../../../support/util-api';

/**
 * One attempt is one login. A second call used to leave behind a second session nobody could
 * reach (#1617); it now lands in the same session, but still adds a refresh token nobody holds.
 * A login whose answer never arrives must not leave a session behind either (#2151).
 *
 * This has to run in a browser: pressing Enter in a text field submits the form by way of
 * the HTML implicit submission, which jsdom does not implement. A unit test therefore sees
 * one call where the browser made two, which is exactly how the doubling stayed unnoticed.
 */
describe('Login form', () => {
  before(() => {
    addFirstUser();
  });

  const enterCredentials = (): void => {
    cy.get('[data-cy="home-user-name"]').should('exist').clear().type(Cypress.expose('username'));
    cy.get('[data-cy="home-password"]').should('exist').clear().type(Cypress.expose('password'));
  };

  let logins = 0;

  beforeEach(() => {
    logins = 0;
    cy.intercept('POST', '/api/login', req => {
      logins += 1;
      req.continue();
    }).as('loginRequest');
    cy.visit('/');
    logout();
  });

  it('should send one login when Enter submits the form', () => {
    cy.get('[data-cy="home-user-name"]').should('exist').clear().type(Cypress.expose('username'));
    cy.get('[data-cy="home-password"]').should('exist').clear()
      .type(`${Cypress.expose('password')}{enter}`);

    cy.wait('@loginRequest');
    cy.get('[data-cy="goto-user-menu"]').should('exist');
    cy.then(() => {
      expect(logins).to.equal(1);
    });
  });

  it('should send one login when the button is clicked twice', () => {
    enterCredentials();
    cy.get('[data-cy="home-submit-button"]').dblclick();

    cy.wait('@loginRequest');
    cy.get('[data-cy="goto-user-menu"]').should('exist');
    cy.then(() => {
      expect(logins).to.equal(1);
    });
  });

  // The server has opened the session of a login whose answer the page never receives, because it
  // reloads first. The login after the reload must continue that session, not open a second one
  // that nobody can reach (#2151). Compared by the session ids rather than by counting the
  // account's sessions: the logout before each test is not waited for.
  it('should leave no session behind when the page reloads during the login (#2151)', () => {
    let lostSessionId = '';
    cy.intercept({ method: 'POST', url: '/api/login', times: 1 }, req => {
      req.continue(res => {
        lostSessionId = sessionIdOf(res.body.accessToken);
        // Held back until the page has reloaded, so that the answer never arrives.
        res.setDelay(5000);
      });
    });
    enterCredentials();
    cy.get('[data-cy="home-submit-button"]').click();
    cy.wrap(null).should(() => {
      expect(lostSessionId).not.to.equal('');
    });
    cy.reload();

    enterCredentials();
    cy.get('[data-cy="home-submit-button"]').click();
    cy.get('[data-cy="goto-user-menu"]').should('exist');

    cy.window().then(win => {
      expect(sessionIdOf(win.localStorage.getItem('id_token') ?? '')).to.equal(lostSessionId);
    });
  });
});
