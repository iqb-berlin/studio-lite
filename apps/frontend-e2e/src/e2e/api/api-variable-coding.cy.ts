import {
  AccessLevel, GroupData, modules, WsData, WsSettings
} from '../../support/testData';
import {
  deleteGroup, deleteAllModules, goToItem, goToWsMenu, login, logout, selectUnit
} from '../../support/helpers';
import { deleteTextField } from '../../support/api';

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
    defaultSchemer: 'iqb-schemer@2.6',
    unitGroups: [],
    stableModulesOnly: false,
    unitMDProfile: 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json',
    itemMDProfile: 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/item.json'
  };

  before(() => {
    cy.addFirstUserAPI(Cypress.expose('username'), Cypress.expose('password'))
      .then(resp => {
        Cypress.expose(`token_${Cypress.expose('username')}`, resp.body);
        expect(resp.status).to.equal(201);
        cy.getUserIdAPI(Cypress.expose(`token_${Cypress.expose('username')}`))
          .then(resp2 => {
            Cypress.expose(`id_${Cypress.expose('username')}`, resp2.body.userId);
            expect(resp2.status).to.equal(200);
          });
      });
  });

  after(() => {
    cy.deleteUsersAPI([Cypress.expose(`id_${Cypress.expose('username')}`)],
      Cypress.expose(`token_${Cypress.expose('username')}`))
      .then(resp => {
        Cypress.expose('token_admin', '');
        expect(resp.status).to.equal(200);
      });
    cy.visit('/');
    // cy.resetDb();
  });

  it('should initialize the API testing context by adding required Verona modules', () => {
    modules.forEach(m => {
      cy.addModuleAPI(m, Cypress.expose(`token_${Cypress.expose('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(201);
        });
    });
  });

  it('should successfully create a new workspace group with administrator credentials', () => {
    cy.createGroupAPI(group1, Cypress.expose(`token_${Cypress.expose('username')}`))
      .then(resp => {
        Cypress.expose(group1.id, resp.body);
        expect(resp.status).to.equal(201);
      });
  });

  it('should successfully create a new workspace within the newly created group', () => {
    cy.createWsAPI(Cypress.expose(group1.id), ws1, Cypress.expose(`token_${Cypress.expose('username')}`))
      .then(resp => {
        Cypress.expose(ws1.id, resp.body);
        expect(resp.status).to.equal(201);
      });
  });

  it('should authorize the current administrator to manage the new workspace', () => {
    cy.updateUsersOfWsAPI(Cypress.expose(ws1.id),
      AccessLevel.Admin,
      Cypress.expose(`id_${Cypress.expose('username')}`),
      Cypress.expose(`token_${Cypress.expose('username')}`))
      .then(resp => {
        expect(resp.status).to.equal(200);
      });
  });

  it('should successfully assign metadata profiles to the specified workspace group', () => {
    Cypress.expose('profile1', 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json');
    Cypress.expose('label1', 'IQB Mathematik Primar - Aufgabe');
    Cypress.expose('profile2', 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/item.json');
    Cypress.expose('label2', 'IQB Mathematik Primar - Item');
    cy.updateGroupMetadataAPI(
      Cypress.expose(group1.id),
      Cypress.expose(`token_${Cypress.expose('username')}`))
      .then(resp => {
        expect(resp.status).to.equal(200);
      });
  });

  it('should successfully update workspace settings to include Verona module references', () => {
    cy.updateWsMetadataAPI(
      Cypress.expose(ws1.id),
      newSettings,
      Cypress.expose(`token_${Cypress.expose('username')}`))
      .then(resp => {
        expect(resp.status).to.equal(200);
      });
  });

  it('should successfully import a unit package and retrieve the assigned unit ID', () => {
    cy.uploadUnitsAPI(Cypress.expose(ws1.id),
      'variable_metadata.zip',
      Cypress.expose(`token_${Cypress.expose('username')}`))
      .then(resp => {
        expect(resp.status).to.equal(201);
        cy.getUnitsByWsAPI(Cypress.expose(ws1.id), Cypress.expose(`token_${Cypress.expose('username')}`))
          .then(resp1 => {
            expect(resp1.status).to.equal(200);
            Cypress.expose('unit1', resp1.body[0].id);
          });
      });
  });

  it('should allow deleting a specific text field variable using the API', () => {
    deleteTextField(Cypress.expose(ws1.id), Cypress.expose('unit1'));
  });

  it('should verify that the deleted variable is no longer listed in unit properties', () => {
    login(Cypress.expose('username'), Cypress.expose('password'));
    cy.visitWs(ws1.name);
    selectUnit('MA_01');
    goToItem('01');
    cy.get('mat-select[placeholder="Variable auswählen"]')
      .eq(-1).find('svg').click()
      .then(() => {
        cy.get('mat-option:contains("text-field_1")').should('have.length', 0);
      });
  });

  it('should verify that the deleted variable is correctly excluded from the metadata report', () => {
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-reports"]').click();
    cy.get('[data-cy="workspace-edit-unit-show-metadata"]').click();
    cy.clickDataCyWithResponseCheck(
      '[data-cy="workspace-show-metadata-display"]',
      [200, 304],
      '/api/workspaces/*/units/properties',
      'GET',
      'summaryMetadata'
    );
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get(`.mdc-tab__text-label:contains("${json.metadata.items}")`).click();
    });
    cy.get('mat-dialog-container:contains("text-field_1")').should('have.length', 0);
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.clickDialogButton(json.close);
    });
  });

  it('should successfully cleanup all created test data from the system', () => {
    deleteGroup(group1.name);
    deleteAllModules();
    logout();
  });
});
