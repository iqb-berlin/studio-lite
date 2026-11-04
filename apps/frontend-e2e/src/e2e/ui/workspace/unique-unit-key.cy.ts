import { primaryWorkspace } from '../../../support/testData';
import { FIRST_WORKSPACE_REQUEST_TIMEOUT, selectUnit } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

// A unit renamed in its properties must not take the key of another unit of the workspace (#1842).
// Creating and copying already refused that. A key that only breaks the format rules stays savable:
// units in use carry such keys and must stay editable.
describe('The key of a unit renamed in its properties', () => {
  let token = '';
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
    createTestBaseAPI({
      units: [
        { shortname: 'FIRST1', name: 'Erste', group: '' },
        { shortname: 'SECOND1', name: 'Zweite', group: '' }
      ]
    }).then(base => {
      ({ token, wsId } = base);
      [firstId, secondId] = base.unitIds;
    });
  });

  after(() => {
    deleteTestBaseAPI();
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
    cy.visitWs(primaryWorkspace);
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
    cy.visitWs(primaryWorkspace);
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
