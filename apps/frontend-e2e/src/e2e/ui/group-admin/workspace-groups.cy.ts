import {
  AccessLevel,
  baseGroup,
  standardUser,
  groupAdminUser,
  primaryWorkspace,
  secondaryWorkspace
} from '../../../support/testData';
import {
  addFirstUser,
  createGroup,
  createNewUser,
  deleteFirstUser,
  deleteGroup,
  deleteUser,
  login,
  logout,
  makeAdminOfGroup,
  clickIndexTabWsgAdmin,
  importExercise,
  submitUnits,
  returnSubmittedUnits
} from '../../../support/helpers';
import {
  addState,
  configureDropBox,
  createWs,
  deleteState,
  grantRemovePrivilegeAtUser,
  grantRemovePrivilegeAtWs
} from '../../../support/helpers/group-admin';

describe('Workspace Group Administration', () => {
  before(() => {
    addFirstUser();
  });
  after(() => {
    deleteFirstUser();
  });

  it('sets up test workspace and users', () => {
    createNewUser(standardUser);
    createNewUser(groupAdminUser);
    createGroup(baseGroup);
    createWs(primaryWorkspace, baseGroup);
    grantRemovePrivilegeAtWs(
      [standardUser.username, groupAdminUser.username, Cypress.expose('username')],
      primaryWorkspace,
      [AccessLevel.Basic, AccessLevel.Admin, AccessLevel.Admin]
    );
    createWs(secondaryWorkspace, baseGroup);
    grantRemovePrivilegeAtWs(
      [standardUser.username, groupAdminUser.username, Cypress.expose('username')],
      secondaryWorkspace,
      [AccessLevel.Basic, AccessLevel.Admin, AccessLevel.Admin]
    );
  });

  it('imports units from zip file', () => {
    cy.visitWs(primaryWorkspace);
    importExercise('test_studio_units_download.zip');
    cy.contains('M6_AK0011').should('exist');
  });

  it('assigns group admin role to user', () => {
    makeAdminOfGroup(baseGroup, [Cypress.expose('username'), groupAdminUser.username]);
  });

  it('displays all admin tabs (users, workspaces, units, settings)', () => {
    cy.findAdminGroupSettings(baseGroup).click();
    cy.get('[data-cy="wsg-admin-routes-users"]').should('exist');
    cy.get('[data-cy="wsg-admin-routes-workspaces"]').should('exist');
    cy.get('[data-cy="wsg-admin-routes-units"]').should('exist');
    cy.get('[data-cy="wsg-admin-routes-settings"]').should('exist');
  });

  it('hides group admin settings for normal users', () => {
    logout();
    login(standardUser.username, standardUser.password);
    cy.findAdminGroupSettings(baseGroup).should('not.exist');
  });

  it('checks that workspace primaryWorkspace is read-only for user', () => {
    cy.contains(primaryWorkspace).click();
    cy.get('[data-cy="units-area-no-access-level"]').should('exist');
    cy.get('studio-lite-add-unit-button>button')
      .should('have.attr', 'disabled');
  });

  it('displays group settings button for group admins', () => {
    logout();
    login(groupAdminUser.username, groupAdminUser.password);
    cy.findAdminGroupSettings(baseGroup).should('exist');
  });

  it('configures secondaryWorkspace as a drop-box for primaryWorkspace', () => {
    cy.findAdminGroupSettings(baseGroup).click();
    configureDropBox(primaryWorkspace, secondaryWorkspace);
  });

  it('submits a unit from primaryWorkspace to its drop-box secondaryWorkspace', () => {
    cy.visitWs(primaryWorkspace);
    submitUnits(['M6_AK0011']);
    // Verify successful submission
    cy.get('mat-row')
      .contains('M6_AK0011', { timeout: 10000 })
      .should('not.exist');

    // Verify it arrived in secondaryWorkspace
    cy.visitWs(secondaryWorkspace);
    cy.get('mat-row').contains('M6_AK0011').should('exist');
  });

  it('returns a unit from the drop-box secondaryWorkspace back to primaryWorkspace', () => {
    cy.visitWs(secondaryWorkspace);
    returnSubmittedUnits(['M6_AK0011']);

    // Verify it is back in primaryWorkspace
    cy.visitWs(primaryWorkspace);
    cy.get('mat-row').contains('M6_AK0011').should('exist');
  });

  it('allows group admin to manage workspace privileges', () => {
    cy.findAdminGroupSettings(baseGroup).click();
    cy.get('[data-cy="wsg-admin-routes-workspaces"]').click();
    grantRemovePrivilegeAtWs(
      [standardUser.username],
      primaryWorkspace,
      [AccessLevel.Admin]
    );
  });

  it('allows group admin to manage user privileges from users tab', () => {
    cy.findAdminGroupSettings(baseGroup).click();
    cy.get('[data-cy="wsg-admin-routes-users"]').click();
    grantRemovePrivilegeAtUser(standardUser.username,
      [primaryWorkspace, secondaryWorkspace],
      [AccessLevel.Basic, AccessLevel.Developer]);
  });

  it('displays the units table and filters by name', () => {
    cy.findAdminGroupSettings(baseGroup).click();
    clickIndexTabWsgAdmin('units');
    cy.get('table').should('be.visible');
    cy.get('studio-lite-search-filter').should('exist');
  });

  it('displays the unit items table and filters by name', () => {
    clickIndexTabWsgAdmin('unit-items');
    cy.get('table').should('be.visible');
    cy.get('studio-lite-search-filter').should('exist');
  });

  it('displays the roles matrix dialog from the users tab', () => {
    clickIndexTabWsgAdmin('users');
    // Select a user first to show the right panel and roles header
    cy.get('mat-row').contains(standardUser.username).click();
    cy.get('studio-lite-roles-header').should('be.visible');
    cy.get('studio-lite-roles-header').find('button.help').click();
    cy.get('mat-dialog-container').should('be.visible');

    cy.get('mat-dialog-container').find('studio-lite-roles-matrix').should('exist');
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('mat-dialog-container').find('button').contains(json.dialogs.close).click();
    });
  });

  it('displays the settings tab', () => {
    clickIndexTabWsgAdmin('settings');
    cy.get('studio-lite-unit-rich-note-tags-config').should('exist');
  });

  it('adds and deletes a state', () => {
    clickIndexTabWsgAdmin('settings');
    addState('Test Delete State');
    deleteState('Test Delete State');
  });

  it('enables workspace editing for group admins', () => {
    cy.visitWs(primaryWorkspace);
    cy.get('[data-cy="units-area-no-access-level"]').should('not.exist');
    cy.get('studio-lite-add-unit-button>button')
      .should('not.have.attr', 'disabled');
  });

  it('cleans up test data', () => {
    logout();
    login(Cypress.expose('username'), Cypress.expose('password'));
    deleteGroup(baseGroup);
    deleteUser(standardUser.username);
    cy.findAdminSettings().click();
    deleteUser(groupAdminUser.username);
  });
});
