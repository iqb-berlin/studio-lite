import {
  AccessLevel,
  standardUser,
  resource,
  adminGroup,
  adminMathWorkspace
} from '../../../support/testData';
import {
  addFirstUser,
  addResourcePackage,
  createGroup,
  createNewUser,
  deleteFirstUser,
  deleteGroup,
  deleteResource,
  deleteUser
} from '../../../support/helpers';
import {
  createWs,
  grantRemovePrivilegeAtWs
} from '../../../support/helpers/group-admin';

describe('UI Administration Management', () => {
  const group1 = adminGroup;
  const ws1 = adminMathWorkspace;
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
  });

  it('displays admin settings button for admin users', () => {
    cy.findAdminSettings().should('exist');
  });

  it('creates a new user', () => {
    createNewUser(standardUser);
  });

  it('deletes a user', () => {
    deleteUser(standardUser.username);
  });

  it('creates a workspace group', () => {
    createGroup(group1);
  });

  it('creates a workspace within a group', () => {
    createWs(ws1, group1);
    grantRemovePrivilegeAtWs([Cypress.expose('username')], 'Mathematik I', [AccessLevel.Basic]);
  });

  it('uploads a resource package',
    { defaultCommandTimeout: 200000 },
    () => {
      addResourcePackage(resource);
    });

  it('deletes a resource package', () => {
    deleteResource();
  });

  it('deletes a workspace group', () => {
    deleteGroup(group1);
  });
});
