import { AccessLevel, standardUser } from '../../../support/testData';
import {
  addFirstUser,
  createNewUser,
  deleteFirstUser,
  deleteUser,
  loginWithUser
} from '../../../support/helpers';

// A link to a unit in a workspace one has no access to, as it is passed around by mail (#1694).
// Until #1705/#1713 the API answered with 401, the frontend took that for an expired login,
// refreshed, got 401 again -- and logged the user out.
describe('A unit link into a workspace without access', () => {
  const group = { id: '', name: 'NoAccessGroup' };
  const ws = { id: '', name: 'NoAccessWorkspace' };
  const unit = { shortname: 'NOACCESS1', name: 'Ohne Zugriff', group: '' };
  let adminToken = '';
  let groupId = '';
  let wsId = '';
  let unitId = '';

  before(() => {
    addFirstUser();
    createNewUser(standardUser);
    cy.window().then(win => {
      adminToken = win.localStorage.getItem('id_token') || '';
      cy.getUserIdAPI(adminToken).then(authData => {
        cy.createGroupAPI(group, adminToken).then(createdGroup => {
          groupId = String(createdGroup.body);
          cy.createWsAPI(groupId, ws, adminToken).then(createdWs => {
            wsId = String(createdWs.body);
            // the administrator becomes a member only to create the unit the link points to
            cy.updateUsersOfWsAPI(wsId, AccessLevel.Admin, String(authData.body.userId), adminToken)
              .its('status').should('equal', 200);
            cy.createUnitAPI(wsId, unit, adminToken).then(createdUnit => {
              expect(createdUnit.status).to.equal(201);
              unitId = String(createdUnit.body);
            });
          });
        });
      });
    });
  });

  after(() => {
    loginWithUser(Cypress.expose('username'), Cypress.expose('password'));
    // the token of this login: the one from before() may have ended with it
    cy.window().then(win => {
      cy.deleteGroupsAPI([groupId], win.localStorage.getItem('id_token') || '')
        .its('status').should('equal', 200);
    });
    deleteUser(standardUser.username);
    deleteFirstUser();
  });

  it('keeps the user logged in and says that the access is missing', () => {
    loginWithUser(standardUser.username, standardUser.password);
    cy.intercept('GET', `/api/workspaces/${wsId}/**`).as('workspaceRequest');
    // Opened afresh, as a link from outside is: a change of the hash alone would keep the page.
    cy.visit(`/#/a/${wsId}/${unitId}/preview`);
    cy.reload();
    cy.wait('@workspaceRequest');

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('.error-container').should('contain', json['app-http-error']['403']);
    });
    cy.get('[data-cy="goto-user-menu"]').should('exist');
    cy.window().then(win => {
      expect(win.localStorage.getItem('id_token')).not.to.equal(null);
      expect(win.localStorage.getItem('refresh_token')).not.to.equal(null);
    });
  });

  // The login switches error messages off so that a failed attempt is reported once, and nothing
  // reloads the page afterwards. Until #1724 they stayed off: the API answered 403, and the page
  // said nothing at all.
  it('says that the access is missing in the page the login happened in', () => {
    loginWithUser(standardUser.username, standardUser.password);
    cy.get('[data-cy="goto-user-menu"]').should('exist');
    cy.intercept('GET', `/api/workspaces/${wsId}/**`).as('workspaceRequest');
    // only the hash changes, so the page of the login stays
    cy.window().then(win => {
      win.location.hash = `#/a/${wsId}/${unitId}/preview`;
    });
    cy.wait('@workspaceRequest').its('response.statusCode').should('equal', 403);

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('.error-container').should('contain', json['app-http-error']['403']);
    });
  });
});
