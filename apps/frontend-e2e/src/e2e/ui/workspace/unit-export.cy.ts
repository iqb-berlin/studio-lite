import { Interception } from 'cypress/types/net-stubbing';
import {
  primaryWorkspace,
  exportUnits
} from '../../../support/testData';
import {
  goToWsMenu,
  selectListUnits,
  waitForSuccess
} from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI, TestBase } from '../../../support/helpers/test-base';

describe('Workspace Unit Export & Reports', () => {
  let base: TestBase;

  before(() => {
    createTestBaseAPI({ units: [exportUnits.exportUnit1, exportUnits.exportUnit2] })
      .then(created => { base = created; });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  // The settings outgrow the dialog once the booklet panel opens; scrolled to the end, the unit
  // list still has to reach the bottom of the dialog content instead of ending a screen above it (#1749)
  it('export dialog unit list grows with the settings column', () => {
    cy.visitWs(primaryWorkspace);
    cy.contains('.unit-row, mat-row', exportUnits.exportUnit1.shortname, { timeout: 15000 }).should('be.visible');
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    cy.get('studio-lite-export-test-taker-config input[type="number"]').first().clear().type('1');
    cy.get('mat-dialog-content mat-expansion-panel.mat-expanded').should('have.length', 2);
    cy.get('mat-dialog-content')
      .should($content => {
        expect($content[0].scrollHeight).to.be.greaterThan($content[0].clientHeight);
      })
      .scrollTo('bottom')
      .then($content => {
        const content = $content[0];
        const style = getComputedStyle(content);
        const contentBottom = content.getBoundingClientRect().bottom -
          parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom);
        const listBottom = $content.find('studio-lite-select-unit-list')[0].getBoundingClientRect().bottom;
        expect(listBottom).to.be.closeTo(contentBottom, 2);
      });
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.cancel || json.close);
    });
  });

  it('export dialog search filter narrows the unit list', () => {
    cy.visitWs(primaryWorkspace);
    cy.contains('.unit-row, mat-row', exportUnits.exportUnit1.shortname, { timeout: 15000 }).should('be.visible');
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

  // A freshly created unit has neither comments nor rich notes, so the dialog offers neither (#1729)
  it('export dialog locks the files the chosen units have no content for', () => {
    cy.visitWs(primaryWorkspace);
    cy.contains('.unit-row, mat-row', exportUnits.exportUnit1.shortname, { timeout: 15000 }).should('be.visible');
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    selectListUnits([exportUnits.exportUnit1.shortname]);
    cy.get('[data-cy="export-file-addComments"] input').should('be.disabled').and('not.be.checked');
    cy.get('[data-cy="export-file-addRichNotes"] input').should('be.disabled').and('not.be.checked');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('studio-lite-export-unit-file-config')
        .should('contain.text', json['unit-download']['no-comments'])
        .and('contain.text', json['unit-download']['no-rich-notes']);
      cy.clickDialogButton(json.cancel || json.close);
    });
  });

  // Booklet and test takers stay XML beside JSON units, so the JSON format keeps the logins (#2099)
  it('exports selected units with logins as JSON format', () => {
    cy.visitWs(primaryWorkspace);
    cy.contains('.unit-row, mat-row', exportUnits.exportUnit1.shortname, { timeout: 15000 }).should('be.visible');
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    selectListUnits([exportUnits.exportUnit1.shortname]);
    cy.get('mat-radio-button[value="json"]').click();
    cy.get('studio-lite-export-test-taker-config input[type="number"]').first().clear().type('1');
    cy.intercept('POST', '/api/workspaces/*/download-units').as('downloadJsonReq');
    cy.get('[data-cy="workspace-export-unit-button"]').click();
    waitForSuccess('@downloadJsonReq');
    cy.get<Interception>('@downloadJsonReq').then(interception => {
      expect(interception.request.body).to.include({ exportFormat: 'json', addTestTakersReview: 1 });
    });
  });

  it('exports selected units with the locked files left out', () => {
    cy.visitWs(primaryWorkspace);
    cy.contains('.unit-row, mat-row', exportUnits.exportUnit1.shortname, { timeout: 15000 }).should('be.visible');
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    selectListUnits([exportUnits.exportUnit1.shortname]);
    cy.get('mat-radio-button[value="xml"]').click();
    cy.get('[data-cy="export-file-addComments"] input').should('be.disabled');

    cy.intercept('GET', '/api/workspaces/*?download=true*').as('downloadFilteredReq');
    cy.get('[data-cy="workspace-export-unit-button"]').click();
    waitForSuccess('@downloadFilteredReq');
    cy.get<Interception>('@downloadFilteredReq').then(interception => {
      const settings = JSON.parse(new URL(interception.request.url).searchParams.get('settings') ?? '{}');
      expect(settings).to.include({ addComments: false, addRichNotes: false });
    });
  });

  // The element's internal id 05 and the derived variable's alias 05 are each unique in their own
  // list, but both formats write both as an id; the Testcenter from version 19 rejects the XML (#2119)
  it('names an id the export would carry twice, in XML and in JSON, and exports anyway on request', () => {
    const conflictUnit = { shortname: 'EXP_ID05', name: 'Doppelte ID', group: '' };
    let unitId = '';
    cy.createUnitAPI(base.wsId, conflictUnit, base.token).then(created => {
      expect(created.status, conflictUnit.shortname).to.equal(201);
      unitId = String(created.body);
      cy.updateUnitVariablesAPI(unitId, base.wsId, [{
        id: '05', alias: '_00a', type: 'string', format: '', multiple: true, nullable: false, values: []
      }], base.token).its('status').should('equal', 200);
      cy.updateUnitSchemeAPI(unitId, base.wsId, base.token, JSON.stringify({
        version: '3.0',
        variableCodings: [
          { id: '05', alias: '_00a', sourceType: 'BASE_NO_VALUE' },
          {
            id: 'd_1790938214783', alias: '05', sourceType: 'MANUAL', deriveSources: []
          }
        ]
      })).its('status').should('equal', 200);
    });
    cy.visitWs(primaryWorkspace);
    cy.contains('.unit-row, mat-row', conflictUnit.shortname, { timeout: 15000 }).should('be.visible');
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-download-unit"]').should('be.visible').click();
    selectListUnits([conflictUnit.shortname]);
    cy.get('mat-radio-button[value="xml"]').click();

    cy.get('[data-cy="workspace-export-unit-button"]').click();
    cy.get('[data-cy="variable-id-conflicts-unit"]')
      .should('contain.text', conflictUnit.shortname)
      .find('[data-cy="variable-id-conflict"] .name')
      .then($names => {
        expect([...$names].map(name => name.textContent?.trim())).to.deep.equal(['05', '_00a', '05']);
      });
    cy.get('[data-cy="variable-id-conflicts-cancel"]').click();
    cy.get('[data-cy="variable-id-conflicts-unit"]').should('not.exist');
    cy.get('mat-radio-button[value="json"]').click();
    cy.get('[data-cy="workspace-export-unit-button"]').should('be.visible').click();
    cy.get('[data-cy="variable-id-conflicts-unit"]').should('contain.text', conflictUnit.shortname);
    cy.get('[data-cy="variable-id-conflicts-cancel"]').click();
    cy.get('mat-radio-button[value="xml"]').click();
    cy.intercept('GET', '/api/workspaces/*?download=true*').as('downloadConflictReq');
    cy.get('[data-cy="workspace-export-unit-button"]').should('be.visible').click();
    cy.get('[data-cy="variable-id-conflicts-export-anyway"]').click();
    waitForSuccess('@downloadConflictReq');
    cy.get('[data-cy="workspace-export-unit-button"]').should('not.exist');
    // the other tests of this spec share the base and are not meant to see this unit
    cy.then(() => cy.deleteUnitsAPI([unitId], base.wsId, base.token).its('status').should('equal', 200));
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
    cy.intercept('GET', '/api/workspaces/*/units/scheme').as('codingReport');
    cy.get('[data-cy="workspace-edit-unit-show-coding-report"]').click();
    waitForSuccess('@codingReport');
    cy.get('[data-cy="coding-report-error"]').should('not.exist');
    // a unit without a scheme still gets its row
    cy.contains('studio-lite-coding-report tr', exportUnits.exportUnit1.shortname).should('exist');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.close);
    });
    cy.get('mat-mdc-dialog-container, mat-dialog-container').should('not.exist');
  });

  it('exports codebook for selected units', () => {
    cy.visitWs(primaryWorkspace);
    cy.contains('.unit-row, mat-row', exportUnits.exportUnit2.shortname, { timeout: 15000 }).should('be.visible');
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
    cy.contains('.unit-row, mat-row', exportUnits.exportUnit2.shortname, { timeout: 15000 }).should('be.visible');
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
