import { AccessLevel } from '../../../support/testData';
import { addFirstUser, deleteFirstUser } from '../../../support/helpers';

// Only the discard button of the confirmation discards. Esc and a click beside the dialog close it
// without an answer, and until #1844 that counted as one.
describe('Discarding the unsaved changes of a unit', () => {
  const group = { id: '', name: 'DiscardGroup' };
  const ws = { id: '', name: 'DiscardWorkspace' };
  const unit = { shortname: 'DISCARD1', name: 'Verwerfen', group: '' };
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
        const userId = authData.body.userId;
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

  it('keeps them when the dialog is closed with Esc or beside it, and discards them on confirmation', () => {
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${unitId}/properties`).as('loadProps');
    cy.visit(`/#/a/${wsId}/${unitId}/properties`);
    cy.wait('@loadProps');
    description().type('Entwurf');
    saveButton().should('be.enabled');

    cy.get('[data-cy="workspace-unit-discard-button"]').click();
    cy.get('mat-dialog-container').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('mat-dialog-container').should('not.exist');
    description().should('have.value', 'Entwurf');
    saveButton().should('be.enabled');

    cy.get('[data-cy="workspace-unit-discard-button"]').click();
    cy.get('mat-dialog-container').should('be.visible');
    cy.get('.cdk-overlay-backdrop').click({ force: true });
    cy.get('mat-dialog-container').should('not.exist');
    description().should('have.value', 'Entwurf');
    saveButton().should('be.enabled');

    cy.get('[data-cy="workspace-unit-discard-button"]').click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.contains('mat-dialog-container button', json.workspace.reject).click();
    });
    description().should('have.value', '');
    saveButton().should('be.disabled');
  });
});
