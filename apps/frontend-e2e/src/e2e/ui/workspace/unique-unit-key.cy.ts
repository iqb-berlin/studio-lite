import { AccessLevel } from '../../../support/testData';
import {
  addFirstUser, deleteFirstUser, FIRST_WORKSPACE_REQUEST_TIMEOUT, selectUnit
} from '../../../support/helpers';

// A unit renamed in its properties must not take the key of another unit of the workspace (#1842).
// Creating and copying already refused that. A key that only breaks the format rules stays savable:
// units in use carry such keys and must stay editable.
describe('The key of a unit renamed in its properties', () => {
  const group = { id: '', name: 'UniqueKeyGroup' };
  const ws = { id: '', name: 'UniqueKeyWorkspace' };
  let token = '';
  let groupId = '';
  let wsId = '';
  let firstId = '';
  let secondId = '';

  const keyField = () => cy.get('input[formcontrolname="key"]');
  const saveButton = () => cy.get('[data-cy="workspace-unit-save-button"]');
  // leaves the unit without the unsaved key, so that the next test is not stopped by the leave dialog
  const discardKey = () => {
    cy.get('[data-cy="workspace-unit-discard-button"]').click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.contains('mat-dialog-container button', json.workspace.reject).click();
    });
    saveButton().should('be.disabled');
  };

  before(() => {
    addFirstUser();
    cy.window().then(win => {
      token = win.localStorage.getItem('id_token') || '';
      cy.getUserIdAPI(token).then(authData => {
        cy.createGroupAPI(group, token).then(createdGroup => {
          groupId = String(createdGroup.body);
          cy.createWsAPI(groupId, ws, token).then(createdWs => {
            wsId = String(createdWs.body);
            cy.updateUsersOfWsAPI(wsId, AccessLevel.Admin, String(authData.body.userId), token)
              .its('status').should('equal', 200);
            cy.createUnitAPI(wsId, { shortname: 'FIRST1', name: 'Erste', group: '' }, token)
              .then(created => { firstId = String(created.body); });
            cy.createUnitAPI(wsId, { shortname: 'SECOND1', name: 'Zweite', group: '' }, token)
              .then(created => { secondId = String(created.body); });
          });
        });
      });
    });
  });

  after(() => {
    cy.deleteGroupsAPI([groupId], token).its('status').should('equal', 200);
    deleteFirstUser();
  });

  it('cannot be saved when another unit carries it, opened directly', () => {
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${secondId}/properties`).as('loadProps');
    cy.visit(`/#/a/${wsId}/${secondId}/properties`);
    cy.wait('@loadProps', { requestTimeout: FIRST_WORKSPACE_REQUEST_TIMEOUT });
    cy.contains('FIRST1').should('exist');
    keyField().clear().type('first1').blur();
    cy.get('mat-error').should('be.visible');
    saveButton().should('be.disabled');
    discardKey();
  });

  it('cannot be saved when another unit carries it, reached through the list', () => {
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${firstId}/properties`).as('loadFirst');
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${secondId}/properties`).as('loadSecond');
    cy.visitWs(ws.name);
    selectUnit('FIRST1');
    cy.wait('@loadFirst');
    selectUnit('SECOND1');
    cy.wait('@loadSecond');
    keyField().clear().type('FIRST1').blur();
    cy.get('mat-error').should('be.visible');
    saveButton().should('be.disabled');
    discardKey();
  });

  it('can be saved when it only breaks the format rules', () => {
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${firstId}/properties`).as('loadFirst');
    cy.visitWs(ws.name);
    selectUnit('FIRST1');
    cy.wait('@loadFirst');
    keyField().clear().type('1FIRST').blur();
    cy.get('mat-error').should('be.visible');
    saveButton().should('be.enabled');
    discardKey();
  });

  it('is refused by the server when another unit carries it', () => {
    cy.request({
      method: 'PATCH',
      url: `/api/workspaces/${wsId}/units/${secondId}/properties`,
      headers: { 'app-version': Cypress.expose('version'), authorization: `bearer ${token}` },
      body: { id: Number(secondId), key: ' first1 ' },
      failOnStatusCode: false
    }).its('status').should('equal', 409);
    cy.getUnitsByWsAPI(wsId, token).then(units => {
      expect(units.body.map((unit: { key: string }) => unit.key).sort()).to.deep.equal(['FIRST1', 'SECOND1']);
    });
  });
});
