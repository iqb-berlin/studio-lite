import { AccessLevel } from '../../../support/testData';
import { addFirstUser, deleteFirstUser, FIRST_WORKSPACE_REQUEST_TIMEOUT } from '../../../support/helpers';

// The save button appears only once the workspace data has told the user's access level. Opened
// directly, a unit can have its properties loaded before that (#1290).
describe('The save button of a unit opened directly', () => {
  const group = { id: '', name: 'SaveButtonGroup' };
  const ws = { id: '', name: 'SaveButtonWorkspace' };
  const unit = { shortname: 'SAVEBTN1', name: 'Speicherknopf', group: '' };
  let token = '';
  let userId = 0;
  let groupId = '';
  let wsId = '';
  let unitId = '';

  before(() => {
    addFirstUser();
    cy.window().then(win => {
      token = win.localStorage.getItem('id_token') || '';
      cy.getUserIdAPI(token).then(authData => {
        userId = authData.body.userId;
        cy.createGroupAPI(group, token).then(createdGroup => {
          groupId = String(createdGroup.body);
          cy.createWsAPI(groupId, ws, token).then(createdWs => {
            wsId = String(createdWs.body);
            cy.updateUsersOfWsAPI(wsId, AccessLevel.Admin, String(userId), token)
              .its('status').should('equal', 200);
            cy.createUnitAPI(wsId, unit, token).then(createdUnit => {
              expect(createdUnit.status).to.equal(201);
              unitId = String(createdUnit.body);
            });
          });
        });
      });
    });
  });

  after(() => {
    cy.deleteGroupsAPI([groupId], token).its('status').should('equal', 200);
    deleteFirstUser();
  });

  it('reacts to a change when the workspace data arrives first', () => {
    cy.intercept('GET', `/api/workspaces/${wsId}/users/${userId}`).as('loadWorkspace');
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${unitId}/properties`, req => {
      req.continue(res => { res.setDelay(3000); });
    }).as('loadProps');
    cy.visit(`/#/a/${wsId}/${unitId}/properties`);
    cy.wait('@loadWorkspace', { requestTimeout: FIRST_WORKSPACE_REQUEST_TIMEOUT });
    cy.get('[data-cy="workspace-unit-save-button"]').should('exist');
    cy.wait('@loadProps');
    cy.get('textarea[formcontrolname="description"]').type('Kontrolle');
    cy.get('[data-cy="workspace-unit-save-button"]').should('be.enabled');
  });

  it('reacts to a change when the unit properties arrive first', () => {
    cy.visit(`/#/a/${wsId}/${unitId}/properties`);
    cy.get('[data-cy="workspace-unit-save-button"]').should('exist');
    // the properties need two requests in a row (module list, properties), so the workspace data
    // is held back well beyond that
    cy.intercept('GET', `/api/workspaces/${wsId}/users/${userId}`, req => {
      req.continue(res => { res.setDelay(8000); });
    }).as('loadWorkspace');
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${unitId}/properties`).as('loadProps');
    // opened directly, as by a reload: a second visit to the open app would only change the hash
    cy.reload();
    cy.wait('@loadProps', { requestTimeout: FIRST_WORKSPACE_REQUEST_TIMEOUT });
    cy.get('[data-cy="workspace-unit-save-button"]').should('not.exist');
    cy.wait('@loadWorkspace');
    cy.get('[data-cy="workspace-unit-save-button"]').should('exist');
    cy.get('textarea[formcontrolname="description"]').type('Nachweis');
    cy.get('[data-cy="workspace-unit-save-button"]').should('be.enabled');
  });
});
