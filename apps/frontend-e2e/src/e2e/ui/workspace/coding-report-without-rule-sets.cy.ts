import { AccessLevel } from '../../../support/testData';
import { addFirstUser, deleteFirstUser, goToWsMenu } from '../../../support/helpers';

// Codes need neither rule sets nor a manual instruction of their own. A unit whose codes come without
// them failed the coding report of its whole workspace (#1873).
describe('The coding report of a unit whose codes have no rule sets', () => {
  const group = { id: '', name: 'CodingReportGroup' };
  const ws = { id: '', name: 'CodingReportWorkspace' };
  let token = '';
  let groupId = '';
  let wsId = '';

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
            cy.createUnitAPI(wsId, { shortname: 'NORULES1', name: 'Ohne Regeln', group: '' }, token)
              .then(created => {
                expect(created.status).to.equal(201);
                cy.fixture('coding-scheme-codes-without-rule-sets.json').then(scheme => {
                  cy.request({
                    method: 'PATCH',
                    url: `/api/workspaces/${wsId}/units/${created.body}/scheme`,
                    headers: { 'app-version': Cypress.expose('version'), authorization: `bearer ${token}` },
                    body: { scheme: JSON.stringify(scheme), schemeType: 'iqb@3.0' }
                  }).its('status').should('equal', 200);
                });
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

  it('lists its variables with their coding type', () => {
    cy.intercept('GET', `/api/workspaces/${wsId}/units/scheme`).as('codingReport');
    cy.visitWs(ws.name);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-coding-report"]').click();
    cy.wait('@codingReport').its('response.statusCode').should('equal', 200);
    cy.get('[data-cy="coding-report-error"]').should('not.exist');
    // the whole cell, since 'halbautomatisch' contains 'automatisch'
    cy.contains('mat-dialog-container tr', 'auto_1').contains('td', /^\s*automatisch\s*$/);
    cy.contains('mat-dialog-container tr', 'manual_1').contains('td', /^\s*manuell\s*$/);
  });
});
