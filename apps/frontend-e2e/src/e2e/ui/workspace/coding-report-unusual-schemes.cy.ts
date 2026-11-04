import { primaryWorkspace } from '../../../support/testData';
import { goToWsMenu, workspaceOfPage } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

// Codes need neither rule sets nor a manual instruction of their own. A unit whose codes come without
// them failed the coding report of its whole workspace, and so did any unit whose scheme throws (#1873).
describe('The coding report of units with unusual or broken schemes', () => {
  let token = '';
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
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-coding-report"]').click();
    cy.wait('@codingReport').its('response.statusCode').should('be.oneOf', [200, 304]);
    cy.get('[data-cy="coding-report-error"]').should('not.exist');
  };

  before(() => {
    createTestBaseAPI();
    cy.visitWs(primaryWorkspace);
    workspaceOfPage().then(page => {
      wsId = page.wsId;
      token = page.token;
      addUnitWithScheme('NORULES1', 'Ohne Regeln', 'coding-scheme-codes-without-rule-sets.json');
      addUnitWithScheme('BROKEN1', 'Defekt', 'coding-scheme-rule-set-without-rules.json');
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('gives a unit whose scheme cannot be evaluated one row and reports the others', () => {
    openCodingReport();
    cy.contains('mat-dialog-container tr', 'BROKEN1')
      .should('contain.text', 'Kodierschema kann nicht ausgewertet werden');
    cy.contains('mat-dialog-container tr', 'auto_1').should('exist');
  });
});
