/// <reference types="cypress" />
import {
  addFirstUser,
  createGroup,
  createWs,
  deleteFirstUser,
  deleteGroup,
  grantRemovePrivilege
} from '../../../support/util';
import { selectProfileForGroupFromAdmin } from '../../../support/metadata/metadata-util';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import { AccessLevel } from '../../../support/testData';

describe.skip('UI Metadata Management from administration', () => {
  const area = 'Deutsch II';
  const mathArea = 'Mathematik II';
  const group = 'Bista II';
  beforeEach(() => {
    cy.visit('/');
  });
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
  });

  it('prepares context', () => {
    createGroup(group);
    cy.visit('/');
    createWs(area, group);
    grantRemovePrivilege(Cypress.env('username'), area, AccessLevel.Admin);
    cy.visit('/');
    createWs(mathArea, group);
    grantRemovePrivilege(Cypress.env('username'), mathArea, AccessLevel.Admin);
  });
  it('chooses profiles for a Group from the administration settings ', () => {
    selectProfileForGroupFromAdmin(group, IqbProfile.DE);
    cy.visit('/');
    selectProfileForGroupFromAdmin(group, IqbProfile.MA);
  });

  it('deletes the data', () => {
    deleteGroup(group);
  });
});
