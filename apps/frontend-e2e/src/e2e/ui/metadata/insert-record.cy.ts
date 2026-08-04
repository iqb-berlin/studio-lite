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
  deleteFirstUser,
  deleteGroup
} from '../../../support/helpers';
import {
  createWs,
  grantRemovePrivilegeAtWs
} from '../../../support/helpers/group-admin';

describe('Metadata Management', () => {
  const ws1 = testWorkspaces.metadata.german1;
  const ws2 = testWorkspaces.metadata.math1;
  const group = testGroups.metadata.bista1;

  it('sets up workspaces with metadata profiles', () => {
    addFirstUser();
    createGroup(group);
    createWs(ws1, group);
    grantRemovePrivilegeAtWs([Cypress.expose('username')], ws1, [AccessLevel.Admin]);
    createWs(ws2, group);
    grantRemovePrivilegeAtWs([Cypress.expose('username')], ws2, [AccessLevel.Admin]);
  });

  it('selects metadata profiles for group', () => {
    selectProfileForGroup(group, IqbProfile.DEu);
    selectProfileForGroup(group, IqbProfile.DEi);
    selectProfileForGroup(group, IqbProfile.MAu);
    selectProfileForGroup(group, IqbProfile.MAi);
  });

  it('assigns profiles to workspaces from group settings', () => {
    selectProfileForAreaFromGroup([IqbProfile.DEu, IqbProfile.DEi], ws1, group);
    selectProfileForAreaFromGroup([IqbProfile.MAu, IqbProfile.DEi], ws2, group);
  });

  it('assigns profile from workspace settings', () => {
    cy.visitWs(ws1);
    selectProfileForArea([IqbProfile.DEu, IqbProfile.DEi]);
    cy.visitWs(ws2);
    selectProfileForArea([IqbProfile.MAu, IqbProfile.MAi]);
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
    cy.intercept({ method: 'GET', pathname: '/api/metadata/vocabularies' }).as('vocabs');
    cy.visitWs(ws2);
    cy.pause();
    cy.contains('M1_001').should('exist').click();
    cy.wait('@vocabs');
    cy.wait('@vocabs');
    getStructure('uMA', false);
    getItem('iMA', false);
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('adds metadata with multiple items to German unit', () => {
    cy.intercept({ method: 'GET', pathname: '/api/metadata/vocabularies' }).as('vocabs');
    cy.visitWs(ws1);
    cy.contains('D1_001').should('exist').click();
    cy.wait('@vocabs');
    cy.wait('@vocabs');
    getStructure('uDE', false);
    getItem('iDE', false);
    getItem('iDE', true);
    getItem('iDE', true, 'iDE');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
  });

  it('cleans up test data', () => {
    deleteGroup(group);
    deleteFirstUser();
  });
});
