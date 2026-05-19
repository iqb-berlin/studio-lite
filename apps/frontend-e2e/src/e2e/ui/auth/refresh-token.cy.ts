import { newUser } from '../../../support/testData';
import {
  addFirstUser,
  createNewUser,
  deleteFirstUser,
  deleteUser,
  login,
  loginWithUser,
  clickIndexTabAdmin
} from '../../../support/helpers';

describe('Token Refresh UI Logic', () => {
  before(() => {
    addFirstUser();
    cy.findAdminSettings().click();
    createNewUser(newUser);
  });

  after(() => {
    deleteFirstUser();
  });

  it('successfully refreshes the token and retries the failed request', () => {
    const newAccessToken = 'new-access-token-123';
    const newRefreshToken = 'new-refresh-token-456';
    loginWithUser(newUser.username, newUser.password);
    // 1. Intercept the initial data fetch to return 401
    // Using a counter to only return 401 once, so the retry can succeed
    let authDataCallCount = 0;
    cy.intercept('GET', '/api/auth-data', req => {
      authDataCallCount += 1;
      if (authDataCallCount === 1) {
        req.reply({
          statusCode: 401,
          body: { message: 'Unauthorized' }
        });
      } else {
        req.reply({
          statusCode: 200,
          body: { name: newUser.username, isAdmin: false }
        });
      }
    }).as('authDataFetch');

    // 2. Mock the refresh call to return new tokens
    cy.intercept('POST', '/api/refresh', {
      statusCode: 200,
      body: { accessToken: newAccessToken, refreshToken: newRefreshToken }
    }).as('refreshRequest');

    // 3. Visit the dashboard which triggers /api/auth-data
    cy.visit('/');

    // 4. Verify the flow
    cy.wait('@authDataFetch'); // First call fails with 401
    cy.wait('@refreshRequest'); // Interceptor catches 401 and calls refresh
    cy.wait('@authDataFetch'); // Original request is retried and succeeds

    // 5. Verify tokens in localStorage are updated
    cy.window().then(win => {
      expect(win.localStorage.getItem('id_token')).to.equal(newAccessToken);
      expect(win.localStorage.getItem('refresh_token')).to.equal(newRefreshToken);
    });
  });

  it('logs out and redirects to home if token refresh fails', () => {
    login(newUser.username, newUser.password);
    // 1. Intercept an API call to return 401
    cy.intercept('GET', '/api/auth-data', {
      statusCode: 401,
      body: { message: 'Unauthorized' }
    }).as('authDataFail');

    // 2. Intercept refresh call to return an error (e.g., refresh token expired)
    cy.intercept('POST', '/api/refresh', {
      statusCode: 403,
      body: { message: 'Refresh token expired' }
    }).as('refreshError');

    // 3. Visit page
    cy.visit('/');

    // 4. Verify redirection to home/login
    cy.wait('@authDataFail');
    cy.wait('@refreshError');
    cy.url().should('include', '/home');

    // 5. Verify localStorage is cleared
    cy.window().then(win => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(win.localStorage.getItem('id_token')).to.be.null;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(win.localStorage.getItem('refresh_token')).to.be.null;
    });
  });

  it('only calls the refresh endpoint once for multiple concurrent 401 requests', () => {
    login(newUser.username, newUser.password);
    // 1. Mock multiple concurrent requests to return 401
    cy.intercept('GET', '/api/auth-data', {
      statusCode: 401,
      body: { message: 'Unauthorized' }
    }).as('req1');

    cy.intercept('GET', '/api/my-data', {
      statusCode: 401,
      body: { message: 'Unauthorized' }
    }).as('req2');

    // 2. Mock refresh specifically
    cy.intercept('POST', '/api/refresh', {
      delay: 500, // Add delay to ensure concurrent requests are pending
      statusCode: 200,
      body: { accessToken: 'concurrent-at', refreshToken: 'concurrent-rt' }
    }).as('singleRefresh');

    // 3. Navigate/Reload to trigger both requests
    cy.visit('/');

    // 4. Wait for the refresh call
    cy.wait('@singleRefresh');

    // 5. Assert that only one refresh call was made despite multiple 401s
    cy.get('@singleRefresh.all').should('have.length', 1);
  });

  it('correctly displays user activity status based on thresholds', () => {
    login(Cypress.expose('username'), Cypress.expose('password'));

    // We mock the users endpoint to simulate the different activity states
    const now = new Date().getTime();
    // ACTIVE_THRESHOLD_MS is 30 min. We set active to 5 min ago.
    const activeDate = new Date(now - (5 * 60 * 1000)).toISOString();
    // PASSIVE_THRESHOLD_MS is 7 days. We set passive to 4 hours ago.
    const passiveDate = new Date(now - (4 * 60 * 60 * 1000)).toISOString();
    // inactive is when isLoggedIn is false OR no sessions
    const inactiveDate = new Date(now - (10 * 24 * 60 * 60 * 1000)).toISOString();

    cy.intercept('GET', '/api/group-admin/users*', {
      statusCode: 200,
      body: [
        {
          id: 101,
          name: 'activeUser',
          isLoggedIn: true,
          lastActivity: activeDate,
          isAdmin: false,
          email: '',
          description: '',
          sessions: [
            {
              sessionId: 's1',
              lastActivity: activeDate,
              activityStatus: 'active'
            }
          ]
        },
        {
          id: 102,
          name: 'passiveUser',
          isLoggedIn: true,
          lastActivity: passiveDate,
          isAdmin: false,
          email: '',
          description: '',
          sessions: [
            {
              sessionId: 's2',
              lastActivity: passiveDate,
              activityStatus: 'passive'
            }
          ]
        },
        {
          id: 103,
          name: 'inactiveUser',
          isLoggedIn: false,
          lastActivity: inactiveDate,
          isAdmin: false,
          email: '',
          description: '',
          sessions: []
        }
      ]
    }).as('getUsersFull');

    // Go to admin users
    cy.findAdminSettings().click();
    clickIndexTabAdmin('users');

    // In admin navigation, wait for users to load
    cy.wait('@getUsersFull');

    // Wait for the table to render and verify active/passive/inactive dots
    cy.get('mat-row').contains('mat-cell', 'activeUser')
      .parent()
      .find('.active-dot')
      .should('exist');
    cy.get('mat-row').contains('mat-cell', 'passiveUser')
      .parent()
      .find('.passive-dot')
      .should('exist');
    cy.get('mat-row').contains('mat-cell', 'inactiveUser')
      .parent()
      .find('.inactive-dot')
      .should('exist');
  });

  it('deletes user', () => {
    cy.findAdminSettings().click();
    deleteUser(newUser.username);
  });
});
