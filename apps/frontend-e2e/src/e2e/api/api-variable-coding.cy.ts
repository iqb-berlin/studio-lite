import {
  AccessLevel, GroupData, WsData, WsSettings
} from '../../support/testData';
import { deleteTextField } from '../../support/utilAPI';

describe.skip('API variable coherence in Scheme, Aspect and Metadata', () => {
  const modules:string[] = ['iqb-schemer-2.5.3.html', 'iqb-editor-aspect-2.9.3.html', 'iqb-player-aspect-2.9.3.html'];
  const ws1: WsData = {
    id: 'id_ws1',
    name: 'Mathematik Primar I'
  };
  const group1: GroupData = {
    id: 'id_group1',
    name: 'Bista III'
  };
  const newSettings: WsSettings = {
    defaultEditor: 'iqb-editor-aspect@2.9',
    defaultPlayer: 'iqb-player-aspect@2.9',
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

  // after(() => {
  //   cy.deleteUsersAPI([Cypress.env(`id_${Cypress.env('username')}`)], Cypress.env(`token_${Cypress.env('username')}`))
  //     .then(resp => {
  //       Cypress.env('token_admin', '');
  //       expect(resp.status).to.equal(200);
  //     });
  // });

  it('prepare the api context', () => {
    modules.forEach(m => {
      cy.addModuleAPI(m, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(201);
        });
    });
  });

  it(' creates group', () => {
    cy.createGroupAPI(group1, Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        Cypress.env(group1.id, resp.body);
        console.log(resp.body);
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

  it('Set verona in the ws', () => {
    cy.updateWsMetadataAPI(
      Cypress.env(ws1.id),
      newSettings,
      Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        expect(resp.status).to.equal(200);
      });
  });

  it('Import exercise', () => {
    cy.uploadUnitsAPI(Cypress.env(ws1.id),
      'variable_metadata.zip',
      Cypress.env(`token_${Cypress.env('username')}`))
      .then(resp => {
        expect(resp.status).to.equal(201);
      });
  });

  it('deletes a text-field_1 in aspect', () => {
    deleteTextField();
  });

  it('checks text-field_1 is still present', () => {

  });

  it('delete the data', () => {
  });
});
