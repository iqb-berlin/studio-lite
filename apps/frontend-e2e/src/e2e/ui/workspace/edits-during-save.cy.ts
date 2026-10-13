import { AccessLevel } from '../../../support/testData';
import { addFirstUser, deleteFirstUser } from '../../../support/helpers';

// Saving takes a while and blocks nothing. What is typed meanwhile was not sent, and must stay
// unsaved rather than count as saved; and a second save must not start while one runs (#1845).
describe('Edits made while a unit is being saved', () => {
  const group = { id: '', name: 'EditsDuringSaveGroup' };
  const ws = { id: '', name: 'EditsDuringSaveWorkspace' };
  const unit = { shortname: 'DURING1', name: 'Waehrend', group: '' };
  let token = '';
  let groupId = '';
  let wsId = '';
  let unitId = '';

  const description = () => cy.get('textarea[formcontrolname="description"]');
  const saveButton = () => cy.get('[data-cy="workspace-unit-save-button"]');

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

  it('keeps what was typed during the save unsaved, and sends it with the next save', () => {
    let patches = 0;
    cy.intercept('PATCH', `/api/workspaces/${wsId}/units/${unitId}/properties`, req => {
      patches += 1;
      req.continue(res => { res.setDelay(4000); });
    }).as('saveProps');
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${unitId}/properties`).as('loadProps');
    cy.visit(`/#/a/${wsId}/${unitId}/properties`);
    cy.wait('@loadProps');

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
