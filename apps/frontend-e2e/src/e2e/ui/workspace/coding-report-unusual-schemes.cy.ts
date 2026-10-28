import { AccessLevel } from '../../../support/testData';
import { addFirstUser, deleteFirstUser, goToWsMenu } from '../../../support/helpers';

// Codes need neither rule sets nor a manual instruction of their own. A unit whose codes come without
// them failed the coding report of its whole workspace, and so did any unit whose scheme throws (#1873).
describe('The coding report of units with unusual or broken schemes', () => {
  const group = { id: '', name: 'CodingReportGroup' };
  const ws = { id: '', name: 'CodingReportWorkspace' };
  let token = '';
  let groupId = '';
  let wsId = '';

  const addUnitWithScheme = (shortname: string, name: string, fixture: string) => {
    cy.createUnitAPI(wsId, { shortname, name, group: '' }, token)
      .then(created => {
        expect(created.status).to.equal(201);
        cy.fixture(fixture).then(scheme => {
          cy.request({
            method: 'PATCH',
            url: `/api/workspaces/${wsId}/units/${created.body}/scheme`,
            headers: { 'app-version': Cypress.expose('version'), authorization: `bearer ${token}` },
            body: { scheme: JSON.stringify(scheme), schemeType: 'iqb@3.0' }
          }).its('status').should('equal', 200);
        });
      });
  };

  const openCodingReport = () => {
    cy.intercept('GET', `/api/workspaces/${wsId}/units/scheme`).as('codingReport');
    cy.visitWs(ws.name);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-coding-report"]').click();
    // 304 when the report has not changed since the previous test opened it
    cy.wait('@codingReport').its('response.statusCode').should('be.oneOf', [200, 304]);
    cy.get('[data-cy="coding-report-error"]').should('not.exist');
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
            addUnitWithScheme('NORULES1', 'Ohne Regeln', 'coding-scheme-codes-without-rule-sets.json');
            addUnitWithScheme('BROKEN1', 'Defekt', 'coding-scheme-rule-set-without-rules.json');
          });
        });
      });
    });
  });

  after(() => {
    cy.deleteGroupsAPI([groupId], token).its('status').should('equal', 200);
    deleteFirstUser();
  });

  it('lists the variables of codes without rule sets with their coding type', () => {
    openCodingReport();
    // the whole cell, since 'halbautomatisch' contains 'automatisch'
    cy.contains('mat-dialog-container tr', 'auto_1').contains('td', /^\s*automatisch\s*$/);
    cy.contains('mat-dialog-container tr', 'manual_1').contains('td', /^\s*manuell\s*$/);
  });

  it('gives a unit whose scheme cannot be evaluated one row and reports the others', () => {
    openCodingReport();
    cy.contains('mat-dialog-container tr', 'BROKEN1')
      .should('contain.text', 'Kodierschema kann nicht ausgewertet werden');
    cy.contains('mat-dialog-container tr', 'auto_1').should('exist');
  });
});
