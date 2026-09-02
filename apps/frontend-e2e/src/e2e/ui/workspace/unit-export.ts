import {
  primaryWorkspace,
  exportUnits
} from '../../../support/testData';
import {
  ensureUnitExists,
  goToWsMenu,
  selectListUnits
} from '../../../support/helpers';

describe('Workspace Unit Export & Reports', () => {
  it('exports selected units (default format)', () => {
    ensureUnitExists(primaryWorkspace, exportUnits.exportUnit1);
    ensureUnitExists(primaryWorkspace, exportUnits.exportUnit2);
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    selectListUnits([exportUnits.exportUnit1.shortname, exportUnits.exportUnit2.shortname]);
    cy.clickDataCyWithResponseCheck(
      '[data-cy="workspace-export-unit-button"]',
      [200, 304],
      '/api/workspaces/*',
      'GET',
      'export'
    );
  });

  it('export dialog shows file-config checkboxes', () => {
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    cy.get('mat-card.files mat-checkbox, studio-lite-export-unit-file-config mat-checkbox')
      .should('have.length.greaterThan', 0);
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
  });

  it('export dialog search filter narrows the unit list', () => {
    ensureUnitExists(primaryWorkspace, exportUnits.exportUnit1);
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    cy.get('[data-cy="workspace-select-unit-list-filter-units"]')
      .type(exportUnits.exportUnit1.shortname);
    cy.get(`[data-cy="workspace-select-unit-list-checkbox-${exportUnits.exportUnit1.shortname}"]`)
      .should('be.visible');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
  });

  it('export dialog definition checkbox can be toggled', () => {
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    cy.get('mat-card.files mat-checkbox, studio-lite-export-unit-file-config mat-checkbox')
      .first()
      .find('input')
      .then($chk => {
        const wasChecked = $chk.prop('checked');
        cy.wrap($chk).click({ force: true });
        cy.wrap($chk).should(wasChecked ? 'not.be.checked' : 'be.checked');
      });
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
  });

  it('exports selected units as XML (Testcenter zip format)', () => {
    ensureUnitExists(primaryWorkspace, exportUnits.exportUnit1);
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    selectListUnits([exportUnits.exportUnit1.shortname]);
    cy.get('mat-radio-button[value="xml"]').click();
    cy.intercept('GET', '/api/workspaces/*?download=true*').as('downloadXmlReq');
    cy.get('[data-cy="workspace-export-unit-button"]').click();
    cy.wait('@downloadXmlReq').its('response.statusCode').should('be.within', 200, 304);
  });

  it('exports selected units as JSON format', () => {
    ensureUnitExists(primaryWorkspace, exportUnits.exportUnit1);
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    selectListUnits([exportUnits.exportUnit1.shortname]);
    cy.get('mat-radio-button[value="json"]').click();
    cy.intercept('POST', '/api/workspaces/*/download-units').as('downloadJsonReq');
    cy.get('[data-cy="workspace-export-unit-button"]').click();
    cy.wait('@downloadJsonReq').its('response.statusCode').should('be.within', 200, 304);
  });

  it('exports selected units with comments and rich notes options toggled', () => {
    ensureUnitExists(primaryWorkspace, exportUnits.exportUnit1);
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    selectListUnits([exportUnits.exportUnit1.shortname]);

    cy.get('studio-lite-export-unit-file-config mat-checkbox').eq(0).click({ force: true });
    cy.get('studio-lite-export-unit-file-config mat-checkbox').eq(1).click({ force: true });

    cy.intercept('GET', '/api/workspaces/*?download=true*').as('downloadFilteredReq');
    cy.get('[data-cy="workspace-export-unit-button"]').click();
    cy.wait('@downloadFilteredReq').its('response.statusCode').should('be.within', 200, 304);
  });

  it('displays metadata report', () => {
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-metadata"]').click();
    cy.clickDataCyWithResponseCheck(
      '[data-cy="workspace-show-metadata-display"]',
      [200, 304],
      '/api/workspaces/*/units/properties',
      'GET',
      'summaryMetadata');
    cy.get('[data-cy="metadata-table-view-download"]').should('be.visible');
    cy.get('[data-cy="metadata-table-view-close"]').should('be.visible').click();
    cy.get('[data-cy="metadata-table-view-close"]').should('not.exist');
  });

  it('displays coding report', () => {
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-coding-report"]').click();
    cy.get('mat-mdc-dialog-container, mat-dialog-container').within(() => {
      cy.get('studio-lite-coding-report, mat-table, table, p').should('exist');
    });
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.close);
    });
    cy.get('mat-mdc-dialog-container, mat-dialog-container').should('not.exist');
  });

  it('exports codebook for selected units', () => {
    ensureUnitExists(primaryWorkspace, exportUnits.exportUnit2);
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-export-coding-book"]').click();
    selectListUnits([exportUnits.exportUnit2.shortname]);
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickButtonWithResponseCheck(
        json.export,
        [200, 304],
        '/api/workspaces/*/units/coding-book*',
        'GET',
        'codebook'
      );
    });
  });

  it('coding book export dialog can be cancelled without a selection', () => {
    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-export-coding-book"]').click();
    cy.get('[data-cy="workspace-select-unit-list-key"]').should('exist');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
    cy.get('mat-mdc-dialog-container, mat-dialog-container').should('not.exist');
  });
});
