/// <reference types="cypress" />
import type { RequestReportDto, WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import { IqbProfile, RegistryProfile } from '../../../support/metadata/iqbProfile';
import { baseGroup, primaryWorkspace } from '../../../support/testData';
import {
  assignVariableToItem,
  clickIndexTabWorkspace,
  createItem,
  goToItem,
  goToWsMenu,
  importExercise,
  selectUnit,
  waitForSuccess
} from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

describe('Variable and Item Metadata Coherence', () => {
  const mathArea = primaryWorkspace;

  // The profiles and the modules of the workspace are set through the API: choosing them in the
  // interface is checked in insert-record.cy.ts and unit-settings-modules.cy.ts (#1967).
  before(() => {
    createTestBaseAPI().then(({ token, wsId }) => {
      cy.getWsGroupsAPI(token).then(groups => {
        const group = (groups.body as WorkspaceGroupInListDto[]).find(({ name }) => name === baseGroup);
        expect(group?.id, `id of ${baseGroup}`).to.be.a('number');
        cy.updateGroupSettingsAPI(String(group?.id), {
          profiles: [
            { id: RegistryProfile.get('uMA'), label: IqbProfile.MAu },
            { id: RegistryProfile.get('iMA'), label: IqbProfile.MAi }
          ]
        }, token).its('status').should('equal', 200);
      });
      cy.updateWsSettingsAPI(wsId, {
        defaultEditor: 'iqb-editor-aspect@3.1',
        defaultPlayer: 'iqb-player-aspect@3.1',
        defaultSchemer: 'iqb-schemer@2.9',
        unitMDProfile: RegistryProfile.get('uMA'),
        itemMDProfile: RegistryProfile.get('iMA')
      }, token).its('status').should('equal', 200);
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  // The only spec that imports a zip through the interface
  it('imports the unit of a zip', () => {
    cy.visitWs(mathArea);
    cy.intercept('POST', '/api/workspaces/*').as('importUnits');
    importExercise('variable_metadata.zip');
    // Rejected files are reported in the answer, which is 201 all the same.
    cy.wait('@importUnits').then(({ response }) => {
      expect(response?.statusCode, 'import').to.equal(201);
      expect((response?.body as RequestReportDto).messages, 'problems importing the zip').to.deep.equal([]);
    });
  });

  it('creates item 01 and assigns variable text-field_1', () => {
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    clickIndexTabWorkspace('metadata');
    goToItem('01');
    assignVariableToItem('text-field_1');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('prevents reusing assigned variable in new item', () => {
    createItem('02');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get(`mat-select[placeholder="${json.metadata['choose-item-variable']}"]`)
        .eq(-1).find('svg').click();
    });
    // cy.get('mat-select[placeholder="Variable auswählen"]').eq(-1).find('svg').click();
    cy.get('mat-option:contains("text-field_1")').should('not.exist');
    cy.get('mat-option:contains("radio_1")').eq(0).click();
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('displays error for duplicate item names', () => {
    createItem('02');
    cy.get('mat-form-field').find('mat-error').should('exist');
  });

  it('renames item and assigns variable', () => {
    cy.get('mat-label:contains("Item ID")').eq(-1).type('{backspace}{backspace}03');
    assignVariableToItem('drop-list_1');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('unassigns variable from item', () => {
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    clickIndexTabWorkspace('metadata');
    goToItem('03');
    assignVariableToItem('');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('removes variable from item properties', () => {
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    clickIndexTabWorkspace('metadata');
    goToItem('03');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get(`mat-select[placeholder="${json.metadata['choose-item-variable']}"]`)
        .eq(-1).find('svg').click()
        .then(() => {
          cy.get('mat-select:contains("drop-list_1")').should('have.length', 0);
        });
    });
  });

  it('excludes unassigned variable from metadata report', () => {
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-metadata"]').click();
    cy.get('[data-cy="workspace-show-metadata-display"]').click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get(`.mdc-tab__text-label:contains("${json.metadata.items}")`).click();
    });
    // waits for the assigned variable first: against the table still loading, the absence would prove nothing
    cy.get('mat-dialog-container .mat-mdc-tab-body-active table')
      .should('contain.text', 'text-field_1')
      .and('not.contain.text', 'drop-list_1');
    // every unit cell holds its link as HTML, "href" included, which no cell shows (#2195)
    cy.get('mat-dialog-container .mat-mdc-tab-body-active input').type('href');
    cy.get('mat-dialog-container .mat-mdc-tab-body-active tr.mat-mdc-row').should('not.exist');
    cy.get('[data-cy="metadata-table-view-close"]').click();
  });

  it('sorts items by variable ID', () => {
    cy.get('studio-lite-item').eq(1).find('span:contains("02")').should('exist');
    cy.get('studio-lite-item').eq(0).find('span:contains("01")').should('exist');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('select.sort-items').select(`${json.metadata['sort-by-variableId']}`,
        { force: true });
    });
    cy.get('studio-lite-item').eq(0).find('span:contains("02")').should('exist');
    cy.get('studio-lite-item').eq(1).find('span:contains("01")').should('exist');
  });

  it('provides sort by item ID option', () => {
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('select.sort-items').select(`${json.metadata['sort-by-id']}`, { force: true });
    });
  });

  it('excludes unassigned variable from preview', () => {
    cy.visitWs(mathArea);
    selectUnit('MA_01');
    clickIndexTabWorkspace('metadata');
    goToItem('03');
    assignVariableToItem('');
    cy.contains('mat-icon', 'visibility').click({ force: true });
    cy.contains('span.item_value', 'drop-list_1').should('not.exist');
  });

  it('creates comment linked to multiple items', () => {
    clickIndexTabWorkspace('comments');
    cy.get('tiptap-editor').type('Neue Kommentar zu item1');
    cy.get('.fx-row-space-between-end').find('svg').eq(0).click();
    cy.get('.mat-pseudo-checkbox').next().contains('01').click();
    cy.get('.mat-pseudo-checkbox').next().contains('02').click();
    // waited for, so that the teardown does not come in the middle of the request
    cy.intercept('POST', '/api/workspaces/*/units/*/comments').as('sendComment');
    cy.contains('button', 'send').click({ force: true });
    waitForSuccess('@sendComment');
  });
});
