import {
  getItem,
  getStructure,
  selectProfileForArea,
  selectProfileForAreaFromGroup,
  selectProfileForGroup
} from '../../../support/metadata/metadata-util';
import { AccessLevel, testGroups, testWorkspaces } from '../../../support/testData';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import {
  addFirstUser,
  addUnit,
  createGroup,
  createWs,
  deleteFirstUser,
  deleteGroup,
  grantRemovePrivilegeAtWs
} from '../../../support/helpers';

describe('Metadata Management', () => {
  const ws1 = testWorkspaces.metadata.german1;
  const ws2 = testWorkspaces.metadata.math1;
  const group = testGroups.metadata.bista1;
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
    // cy.resetDb();
  });

  it('sets up workspaces with metadata profiles', () => {
    createGroup(group);
    createWs(ws1, group);
    grantRemovePrivilegeAtWs([Cypress.expose('username')], ws1, [AccessLevel.Admin]);
    createWs(ws2, group);
    grantRemovePrivilegeAtWs([Cypress.expose('username')], ws2, [AccessLevel.Admin]);
  });

  it('selects metadata profiles for group', () => {
    selectProfileForGroup(group, IqbProfile.DE);
    selectProfileForGroup(group, IqbProfile.MA);
  });

  it('assigns profiles to workspaces from group settings', () => {
    selectProfileForAreaFromGroup(IqbProfile.DE, ws1, group);
    selectProfileForAreaFromGroup(IqbProfile.MA, ws2, group);
  });

  it('assigns profile from workspace settings', () => {
    cy.visitWs(ws1);
    selectProfileForArea(IqbProfile.DE);
    cy.visitWs(ws2);
    selectProfileForArea(IqbProfile.MA);
  });

  it('creates unit in workspace', () => {
    cy.visitWs(ws2);
    addUnit('M1_001');
  });

  it('creates multiple units in workspace', () => {
    cy.visitWs(ws1);
    addUnit('D1_001');
    cy.visitWs(ws1);
    addUnit('D1_002');
  });

  it('adds metadata to math unit', () => {
    cy.visitWs(ws2);
    cy.contains('M1_001').should('exist').click();
    getStructure('uMA', false);
    getItem('iMA', false);
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('adds metadata with multiple items to German unit', () => {
    cy.visitWs(ws1);
    cy.contains('D1_001').should('exist').click();
    getStructure('uDE', false);
    getItem('iDE', false);
    getItem('iDE', true);
    getItem('iDE', true, 'iDE');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('cleans up test data', () => {
    deleteGroup(group);
  });
});
