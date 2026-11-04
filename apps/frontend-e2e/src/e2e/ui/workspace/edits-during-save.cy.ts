import { FIRST_WORKSPACE_REQUEST_TIMEOUT } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

// Saving takes a while and blocks nothing. What is typed meanwhile was not sent, and must stay
// unsaved rather than count as saved; and a second save must not start while one runs (#1845).
describe('Edits made while a unit is being saved', () => {
  const unit = { shortname: 'DURING1', name: 'Waehrend', group: '' };
  let token = '';
  let wsId = '';
  let unitId = '';

  const description = () => cy.get('textarea[formcontrolname="description"]');
  const saveButton = () => cy.get('[data-cy="workspace-unit-save-button"]');

  before(() => {
    createTestBaseAPI({ units: [unit] }).then(base => {
      ({ token, wsId } = base);
      [unitId] = base.unitIds;
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('keeps what was typed during the save unsaved, and sends it with the next save', () => {
    let patches = 0;
    cy.intercept('PATCH', `/api/workspaces/${wsId}/units/${unitId}/properties`, req => {
      patches += 1;
      req.continue(res => { res.setDelay(4000); });
    }).as('saveProps');
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${unitId}/properties`).as('loadProps');
    cy.visit(`/#/a/${wsId}/${unitId}/properties`);
    cy.wait('@loadProps', { requestTimeout: FIRST_WORKSPACE_REQUEST_TIMEOUT });

    description().type('vorher');
    saveButton().click();
    // the save is under way: no second one can be started, and typing goes on
    saveButton().should('be.disabled');
    description().type(' danach');
    cy.wait('@saveProps').its('request.body.description').should('equal', 'vorher');

    description().should('have.value', 'vorher danach');
    saveButton().should('be.enabled');

    saveButton().click();
    cy.wait('@saveProps').its('request.body.description').should('equal', 'vorher danach');
    saveButton().should('be.disabled');
    cy.then(() => expect(patches, 'requests sent').to.equal(2));
    cy.getUnitPropertiesAPI(wsId, unitId, token).its('body.description').should('equal', 'vorher danach');
  });
});
