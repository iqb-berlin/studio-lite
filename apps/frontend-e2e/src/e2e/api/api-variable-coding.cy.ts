import {
  AccessLevel, GroupData, modules, WsData, WsSettings
} from '../../support/testData';
import { deleteTextField } from '../../support/util-api';
import {
  deleteGroup,
  deleteModule,
  goToItem,
  goToWsMenu,
  login,
  logout,
  selectUnit
} from '../../support/util';

describe('API variable coherence in Scheme, Aspect and Metadata', () => {
  const ws1: WsData = {
    id: 'id_ws1',
    name: 'Mathematik Primar I'
  };
  const group1: GroupData = {
    id: 'id_group1',
    name: 'Bista III'
  };
  const newSettings: WsSettings = {
    defaultEditor: 'iqb-editor-aspect@2.12',
    defaultPlayer: 'iqb-player-aspect@2.12',
    defaultSchemer: 'iqb-schemer@2.5',
    unitGroups: [],
    stableModulesOnly: false,
    unitMDProfile: 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json',
    itemMDProfile: 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/item.json'
  };

  before(() => {
    cy.addFirstUserAPI(Cypress.env('username'), Cypress.env('password'))
      .then(resp => {
        Cypress.env(`token_${Cypress.env('username')}`, resp.body);
        expect(resp.status).to.equal(201);
        cy.getUserIdAPI(Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp2 => {
            Cypress.env(`id_${Cypress.env('username')}`, resp2.body.userId);
            expect(resp2.status).to.equal(200);
          });
      });
  });

  after(() => {
    cy.deleteUsersAPI([Cypress.env(`id_${Cypress.env('username')}`)], Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        Cypress.env('token_admin', '');
        expect(resp.status).to.equal(200);
      });
    cy.visit('/');
    // cy.resetDb();
  });

  it('prepares api context', () => {
    modules.forEach(m => {
      cy.addModuleAPI(m, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(201);
        });
    });
  });

  it('creates group', () => {
    cy.createGroupAPI(group1, Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        Cypress.env(group1.id, resp.body);
        expect(resp.status).to.equal(201);
      });
  });

  it('creates ws', () => {
    cy.createWsAPI(Cypress.env(group1.id), ws1, Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        Cypress.env(ws1.id, resp.body);
        expect(resp.status).to.equal(201);
      });
  });

  it('sets admin as admin at ws', () => {
    cy.updateUsersOfWsAPI(Cypress.env(ws1.id),
      AccessLevel.Admin,
      Cypress.env(`id_${Cypress.env('username')}`),
      Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        expect(resp.status).to.equal(200);
      });
  });

  it('selects profile for the group', () => {
    Cypress.env('profile1', 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json');
    Cypress.env('label1', 'IQB Mathematik Primar - Aufgabe');
    Cypress.env('profile2', 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/item.json');
    Cypress.env('label2', 'IQB Mathematik Primar - Item');
    cy.updateGroupMetadataAPI(
      Cypress.env(group1.id),
      Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        expect(resp.status).to.equal(200);
      });
  });

  it('sets verona in the ws', () => {
    cy.updateWsMetadataAPI(
      Cypress.env(ws1.id),
      newSettings,
      Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        expect(resp.status).to.equal(200);
      });
  });

  it('imports exercise', () => {
    cy.uploadUnitsAPI(Cypress.env(ws1.id),
      'variable_metadata.zip',
      Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        expect(resp.status).to.equal(201);
        cy.getUnitsByWsAPI(Cypress.env(ws1.id), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp1 => {
            expect(resp1.status).to.equal(200);
            Cypress.env('unit1', resp1.body[0].id);
          });
      });
  });

  it('deletes a text-field_1 in aspect', () => {
    deleteTextField(Cypress.env(ws1.id), Cypress.env('unit1'));
  });

  it('checks text-field_1 is not present at properties', () => {
    login(Cypress.env('username'), Cypress.env('password'));
    cy.visitWs(ws1.name);
    selectUnit('MA_01');
    goToItem('01');
    cy.get('mat-select[placeholder="Variable auswählen"]')
      .eq(-1).find('svg').click()
      .then(() => {
        cy.get('mat-option:contains("text-field_1")').should('have.length', 0);
      });
  });

  it('checks that text-field_1 is not present at Menu > Berichte > Metadaten does not exist', () => {
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-metadata"]').click();
    // eslint-disable-next-line max-len
    cy.clickButtonWithResponseCheck('Anzeigen', [200, 304], '/api/workspaces/*/units/properties', 'GET', 'summaryMetadata');
    cy.get('.mdc-tab__text-label:contains("Metadaten Items")').click();
    cy.get('mat-dialog-container:contains("text-field_1")').should('have.length', 0);
    cy.clickButton('Schließen');
  });

  it('deletes the data', () => {
    deleteGroup(group1.name);
    deleteModule();
    logout();
  });
});
