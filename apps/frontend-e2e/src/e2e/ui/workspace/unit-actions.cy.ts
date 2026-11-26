import { primaryWorkspace, secondaryWorkspace, UnitData } from '../../../support/testData';
import { clickIndexTabWorkspace, selectUnit, waitForSuccess } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI, TestBase } from '../../../support/helpers/test-base';

/**
 * The card „Aktionen“ under „Eigenschaften“ submits, returns, copies, moves and deletes the open unit, and
 * only it, after asking (#2232). Which buttons a level gets is answered in unit-actions.component.spec.ts,
 * the names of drop box and source in 05-api-units.ts; here it is the way through the studio, with the
 * secondary workspace as the drop box of the primary one.
 */
describe('Workspace Unit Actions', () => {
  const units: Record<'submitted' | 'copied' | 'moved' | 'deleted', UnitData> = {
    submitted: { shortname: 'ACT_SUBMIT', name: 'Abgeben', group: '' },
    copied: { shortname: 'ACT_COPY', name: 'Kopieren', group: '' },
    moved: { shortname: 'ACT_MOVE', name: 'Verschieben', group: '' },
    deleted: { shortname: 'ACT_DELETE', name: 'Löschen', group: '' }
  };
  let base: TestBase;
  let secondaryId = '';

  const openProperties = (workspace: string, unit: UnitData): void => {
    cy.visitWs(workspace);
    selectUnit(unit.shortname);
    clickIndexTabWorkspace('properties');
    cy.get('[data-cy="unit-actions"]').should('be.visible');
  };
  const confirmDialog = (): void => {
    cy.get('mat-dialog-container mat-dialog-actions button[color="primary"]').click();
  };
  const unitKeysOf = (wsId: string) => cy.getUnitsByWsAPI(wsId, base.token)
    .then(resp => (resp.body as { key: string }[]).map(unit => unit.key));
  const chooseTarget = (): void => {
    cy.get('[data-cy="select-target-workspace"]').click();
    cy.get('mat-option').contains(secondaryWorkspace).click();
  };

  before(() => {
    createTestBaseAPI({ units: Object.values(units) }).then(created => {
      base = created;
      cy.getUserIdAPI(base.token).then(authData => {
        const workspaces = (authData.body.workspaces as { workspaces: { id: number; name: string }[] }[])
          .flatMap(group => group.workspaces);
        secondaryId = String(workspaces.find(workspace => workspace.name === secondaryWorkspace)?.id);
        cy.dropboxWsAPI(base.wsId, secondaryId, base.token).its('status').should('equal', 200);
      });
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('submits the open unit to the drop box it names, and returns it from there to where it came from', () => {
    cy.intercept('PATCH', '/api/workspaces/*/units/drop-box-history').as('dropBoxHistory');
    openProperties(primaryWorkspace, units.submitted);
    cy.get('[data-cy="unit-actions-drop-box"]').should('contain.text', secondaryWorkspace);
    // greyed out, but there for its tooltip
    cy.get('[data-cy="unit-actions-return"]').should('have.attr', 'aria-disabled', 'true');

    cy.get('[data-cy="unit-actions-submit"]').click();
    cy.get('mat-dialog-container')
      .should('contain.text', units.submitted.shortname)
      .and('contain.text', secondaryWorkspace);
    confirmDialog();
    waitForSuccess('@dropBoxHistory');
    cy.then(() => unitKeysOf(secondaryId).should('include', units.submitted.shortname));

    openProperties(secondaryWorkspace, units.submitted);
    cy.get('[data-cy="unit-actions-source"]').should('contain.text', primaryWorkspace);
    cy.get('[data-cy="unit-actions-return"]').should('not.have.attr', 'aria-disabled');
    cy.get('[data-cy="unit-actions-return"]').click();
    cy.get('mat-dialog-container').should('contain.text', primaryWorkspace);
    confirmDialog();
    waitForSuccess('@dropBoxHistory');
    cy.then(() => unitKeysOf(base.wsId).should('include', units.submitted.shortname));
  });

  it('copies the open unit, and only it, without a list of units to pick from', () => {
    cy.intercept('POST', '/api/workspaces/*/units').as('copy');
    openProperties(primaryWorkspace, units.copied);

    cy.get('[data-cy="unit-actions-copy"]').click();
    cy.get('mat-dialog-container').should('contain.text', units.copied.shortname);
    cy.get('studio-lite-select-unit-list').should('not.exist');
    cy.get('[data-cy="select-target-workspace-confirm"]').should('be.disabled');
    chooseTarget();
    cy.get('[data-cy="select-target-workspace-confirm"]').click();
    waitForSuccess('@copy');

    cy.then(() => unitKeysOf(secondaryId).should('include', units.copied.shortname)
      .and('not.include', units.moved.shortname));
    cy.then(() => unitKeysOf(base.wsId).should('include', units.copied.shortname));
  });

  it('moves the open unit to the workspace chosen', () => {
    cy.intercept('PATCH', '/api/workspaces/*/units/workspace-id').as('move');
    openProperties(primaryWorkspace, units.moved);

    cy.get('[data-cy="unit-actions-move"]').click();
    chooseTarget();
    cy.get('[data-cy="select-target-workspace-confirm"]').click();
    waitForSuccess('@move');

    cy.then(() => unitKeysOf(secondaryId).should('include', units.moved.shortname));
    cy.then(() => unitKeysOf(base.wsId).should('not.include', units.moved.shortname));
  });

  it('deletes the open unit after asking about it by name', () => {
    cy.intercept('DELETE', '/api/workspaces/*/units*').as('delete');
    openProperties(primaryWorkspace, units.deleted);

    cy.get('[data-cy="unit-actions-delete"]').click();
    cy.get('studio-lite-delete-dialog').should('contain.text', units.deleted.shortname);
    cy.get('studio-lite-delete-dialog button[color="primary"]').click();
    waitForSuccess('@delete');

    cy.then(() => unitKeysOf(base.wsId).should('not.include', units.deleted.shortname));
  });

  // where the properties showed it before, in the section of its part; renewed by saving (#2232)
  it('shows under the properties of the technical validation who changed them last', () => {
    cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProperties');
    openProperties(primaryWorkspace, units.copied);

    cy.get('input[formControlName="name"]').clear().type('Kopieren, geändert');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
    waitForSuccess('@saveProperties');

    cy.translate(Cypress.expose('locale')).then(json => {
      const label = (json['unit-check']['last-changed-metadata'] as string).split('{{')[0];
      cy.get('[data-cy="unit-check-properties"] [data-cy="unit-check-last-change"]')
        .should('contain.text', label);
    });
  });
});
