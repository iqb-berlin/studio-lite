/// <reference types="cypress" />
import {
  addFirstUser,
  createWs,
  createGroup, deleteFirstUser, deleteGroup,
  grantRemovePrivilege
} from '../../../support/util';
import {
  selectProfileForGroupFromAdmin
} from '../../../support/metadata/metadata-util';
import { IqbProfile } from '../../../support/metadata/iqbProfile';

describe('UI Metadata Management from administration', () => {
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

  it('UI prepare context', () => {
    createGroup(group);
    cy.visit('/');
    createWs(area, group);
    grantRemovePrivilege(Cypress.env('username'), area, 'write');
    cy.visit('/');
    createWs(mathArea, group);
    grantRemovePrivilege(Cypress.env('username'), mathArea, 'write');
  });
  it('choose profiles for a Group from the administration settings ', () => {
    selectProfileForGroupFromAdmin(group, IqbProfile.DE);
    cy.visit('/');
    selectProfileForGroupFromAdmin(group, IqbProfile.MA);
  });

  it('delete the data', () => {
    deleteGroup(group);
  });
});
