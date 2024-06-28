/// <reference types="cypress" />
import {
  createNewUser,
  createGroup,
  deleteGroup,
  grantRemovePrivilege,
  addFirstUser,
  deleteFirstUser,
  addModule,
  deleteModule,
  deleteUser,
  createWs
} from '../../support/util';

describe('UI Administration Management', () => {
  before(() => addFirstUser());
  after(() => deleteFirstUser());
  beforeEach(() => {
    cy.visit('/');
  });
  it('user with admin credentials can add new user', () => {
    createNewUser('newuser', 'newpass');
  });

  it('user with admin credentials can delete a user', () => {
    deleteUser('newuser');
  });

  it('user with admin credentials can create a group (Bereichsgruppe)', () => {
    createGroup('Mathematik Primär Bereichsgruppe');
  });

  it('user with admin credentials can create a workspace(Arbeitsbereich) within its Bereichsgruppe', () => {
    createWs('Mathematik I', 'Mathematik Primär Bereichsgruppe');
    grantRemovePrivilege(Cypress.env('username'), 'Mathematik I', 'read');
  });

  it('user with admin credentials can Modules upload', () => {
    addModule();
  });

  it('user with admin credentials delete Modules', () => {
    deleteModule();
  });

  it('user with admin credentials can delete groups', () => {
    deleteGroup('Mathematik Primär Bereichsgruppe');
  });
});
