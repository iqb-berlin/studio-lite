import { AccessLevel, primaryWorkspace, secondaryWorkspace } from '../../../support/testData';
import { FIRST_WORKSPACE_REQUEST_TIMEOUT } from '../../../support/helpers';
import { createGroupAdminBaseAPI, GroupAdminBase } from '../../../support/helpers/test-base';

// The address of a unit of another workspace, pasted into the open studio, as from a link sent by mail:
// the page is not loaded anew, only the router follows. The studio stayed in the workspace before and
// looked for the unit in it (#2242).
describe('Opening a unit of another workspace by its address', () => {
  let base: GroupAdminBase;
  let primaryUnitId = '';
  let secondaryUnitId = '';

  before(() => {
    createGroupAdminBaseAPI({ users: [], firstUserAccess: AccessLevel.Admin }).then(created => {
      base = created;
      cy.createUnitAPI(base.wsId, { shortname: 'ADDRESS1', name: 'Erste', group: '' }, base.token)
        .then(unit => {
          expect(unit.status, 'unit of the primary workspace').to.equal(201);
          primaryUnitId = String(unit.body);
        });
      cy.createUnitAPI(base.secondaryWsId, { shortname: 'ADDRESS2', name: 'Zweite', group: '' }, base.token)
        .then(unit => {
          expect(unit.status, 'unit of the secondary workspace').to.equal(201);
          secondaryUnitId = String(unit.body);
        });
    });
  });

  it('opens the other workspace with its units', () => {
    cy.visit(`/#/a/${base.wsId}/${primaryUnitId}/properties`);
    cy.title({ timeout: FIRST_WORKSPACE_REQUEST_TIMEOUT }).should('contain', primaryWorkspace);
    cy.contains('mat-row', 'ADDRESS1').should('exist');

    // the hash alone, as the address bar changes it: no page load
    cy.window().then(win => {
      win.location.hash = `#/a/${base.secondaryWsId}/${secondaryUnitId}/properties`;
    });

    cy.title({ timeout: FIRST_WORKSPACE_REQUEST_TIMEOUT }).should('contain', secondaryWorkspace);
    cy.contains('mat-row', 'ADDRESS2').should('exist');
    cy.contains('mat-row', 'ADDRESS1').should('not.exist');
    // the properties of the unit, loaded from its own workspace: before, they were looked for in the other
    cy.get('input[formcontrolname="key"]').should('have.value', 'ADDRESS2');
    cy.get('[data-cy="unit-properties-not-loaded"]').should('not.exist');
    cy.get('.error-container').should('not.exist');
  });
});
