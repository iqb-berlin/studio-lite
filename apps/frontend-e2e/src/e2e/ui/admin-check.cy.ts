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
} from '../../support/util/util';
import { adminData } from '../../support/config/userdata';

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

  it('user with admin credentials can create a Bereichsgruppe', () => {
    createGroup('Mathematik Primär Bereichsgruppe');
  });

  it('user can create a Arbeitsbereich within its Bereichsgruppe', () => {
    createWs('Mathematik I', 'Mathematik Primär Bereichsgruppe');
    grantRemovePrivilege(adminData.user_name, 'Mathematik I', 'read');
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
  /*
  it('should be able to add notice warning and set its duration', () => {
  });
  it('should be able to change the title of the application', () => {
  });
  it('should be able to change the content of te secondary box', () => {
  });
  it('should be able to edit the legal notice and data protection', () => {
  });
  it('should be able to change the apps logo', () => {
  });
  it('should be able to change the background color of the application', () => {
  });
  it('should be able to change the background of the secondary box', () => {
  });
  it('should be able to add the parameter for unit export', () => {
  }); */
});
