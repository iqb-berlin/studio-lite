import {
  addFirstUser, addUnit,
  createGroup,
  createWs,
  deleteFirstUser,
  deleteGroup,
  grantRemovePrivilegeAtWs
} from '../../../support/util';
import {
  getItem,
  getStructure,
  selectProfileForArea,
  selectProfileForAreaFromGroup,
  selectProfileForGroup
} from '../../../support/metadata/metadata-util';
import { AccessLevel } from '../../../support/testData';
import { IqbProfile } from '../../../support/metadata/iqbProfile';

describe('Metadata Management', () => {
  const ws1 = 'Deutsch I';
  const ws2 = 'Mathematik I';
  const group = 'Bista I';
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
    // cy.resetDb();
  });

  it('prepares context', () => {
    createGroup(group);
    createWs(ws1, group);
    grantRemovePrivilegeAtWs([Cypress.env('username')], ws1, [AccessLevel.Admin]);
    createWs(ws2, group);
    grantRemovePrivilegeAtWs([Cypress.env('username')], ws2, [AccessLevel.Admin]);
  });

  it('chooses profiles from the group ', () => {
    selectProfileForGroup(group, IqbProfile.DE);
    selectProfileForGroup(group, IqbProfile.MA);
  });

  it('chooses profile for a ws from a group', () => {
    selectProfileForAreaFromGroup(IqbProfile.DE, ws1, group);
    selectProfileForAreaFromGroup(IqbProfile.MA, ws2, group);
  });

  it('chooses a profile for a workspace', () => {
    cy.visitWs(ws1);
    selectProfileForArea(IqbProfile.DE);
    cy.visitWs(ws2);
    selectProfileForArea(IqbProfile.MA);
  });

  it('creates a new Unit in a ws', () => {
    cy.visitWs(ws2);
    addUnit('M1_001');
  });

  it('creates more than one Unit in a ws', () => {
    cy.visitWs(ws1);
    addUnit('D1_001');
    cy.visitWs(ws1);
    addUnit('D1_002');
  });

  it('adds metadata values for the unit M1_001', () => {
    cy.visitWs(ws2);
    cy.contains('M1_001').should('exist').click();
    getStructure('uMA', false);
    getItem('iMA', false);
    cy.get('[data-cy="workspace-save-unit"]').click();
  });

  it('adds metadata values for the unit D1_001, that has several items', () => {
    cy.visitWs(ws1);
    cy.contains('D1_001').should('exist').click();
    getStructure('uDE', false);
    getItem('iDE', false);
    getItem('iDE', true);
    getItem('iDE', true, 'iDE');
    cy.get('[data-cy="workspace-save-unit"]').click();
  });

  it('deletes the data', () => {
    deleteGroup(group);
  });
});
