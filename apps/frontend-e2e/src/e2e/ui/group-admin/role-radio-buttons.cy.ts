import {
  AccessLevel,
  baseGroup,
  standardUser,
  secondaryUser,
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
  makeAdminOfGroup,
  clickIndexTabWsgAdmin,
  openWsTab,
  openUsersTab
} from '../../../support/helpers';
import {
  createWs,
  assertRoleRadioChecked,
  clickAccessRightsSaveButton,
  getRoleRadio,
  selectRoleAtWs,
  deselectRoleAtWs,
  selectRoleAtUser,
  deselectRoleAtUser
} from '../../../support/helpers/group-admin';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Role Radio Buttons – wsg-admin access rights', () => {
  before(() => {
    addFirstUser();
    createNewUser(standardUser);
    createNewUser(secondaryUser);
    createGroup(baseGroup);
    createWs(primaryWorkspace, baseGroup);
    createWs(secondaryWorkspace, baseGroup);
    // makeAdminOfGroup navigates away — call last so it doesn't break createWs above
    makeAdminOfGroup(baseGroup, [Cypress.expose('username')]);
  });

  beforeEach(() => {
    cy.visit('/');
    cy.findAdminGroupSettings(baseGroup).click();
  });

  // -------------------------------------------------------------------------
  // 1. UI structure – what only a browser can answer
  // -------------------------------------------------------------------------

  describe('UI structure', () => {
    // That each row renders one radio per level is held by the component specs; what needs a
    // browser is the touch target. Material's 48px target overlaps the 40px input by 4px, and
    // a click on that rim reaches `_onTouchTargetClick`, which stops propagation before the
    // host `(click)` that deselects. The panels hide it (`--mat-radio-touch-target-display`);
    // without this assertion, removing that style leaves every deselect test below green.
    it('hides the touch target that would swallow deselect clicks', () => {
      openWsTab(primaryWorkspace);
      getRoleRadio(`(${standardUser.username})`, AccessLevel.Basic)
        .find('.mat-mdc-radio-touch-target')
        .should('not.be.visible');
    });

    it('all radio buttons are disabled when no workspace is selected', () => {
      clickIndexTabWsgAdmin('workspaces');
      // Rows are always rendered; only the radio inputs become disabled when nothing is selected
      cy.get('[data-cy="access-rights-row"]').should('have.length.greaterThan', 0).each($row => {
        cy.wrap($row).find('input[type="radio"]').each($radio => {
          cy.wrap($radio).should('be.disabled');
        });
      });
    });

    it('all radio buttons are disabled when no user is selected', () => {
      clickIndexTabWsgAdmin('users');
      // Rows are always rendered; only the radio inputs become disabled when nothing is selected
      cy.get('[data-cy="access-rights-row"]').should('have.length.greaterThan', 0).each($row => {
        cy.wrap($row).find('input[type="radio"]').each($radio => {
          cy.wrap($radio).should('be.disabled');
        });
      });
    });
  });

  // -------------------------------------------------------------------------
  // 2. Selecting and deselecting a level (Workspaces panel)
  // -------------------------------------------------------------------------

  describe('Workspaces panel – selecting and deselecting', () => {
    beforeEach(() => {
      openWsTab(primaryWorkspace);
    });

    // One walk over all three levels: every level can be picked, and picking the next one
    // unchecks the one before -- the same assertion the three per-level tests each made once.
    it('marks only the clicked level and unchecks the level before it', () => {
      selectRoleAtWs(standardUser.username, AccessLevel.Basic);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Basic, true);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Developer, false);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Admin, false);

      selectRoleAtWs(standardUser.username, AccessLevel.Developer);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Developer, true);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Basic, false);

      selectRoleAtWs(standardUser.username, AccessLevel.Admin);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Admin, true);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Developer, false);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Basic, false);
    });

    it('leaves the row without a level when the checked radio is clicked again', () => {
      selectRoleAtWs(standardUser.username, AccessLevel.Admin);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Admin, true);

      deselectRoleAtWs(standardUser.username, AccessLevel.Admin);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Basic, false);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Developer, false);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Admin, false);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Save and persist – Workspaces panel
  // -------------------------------------------------------------------------

  describe('Workspaces panel – save and reload', () => {
    it('persists an Admin role assignment after save and page reload', () => {
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('saveUsers');
      openWsTab(primaryWorkspace);
      selectRoleAtWs(standardUser.username, AccessLevel.Admin);
      clickAccessRightsSaveButton();
      cy.wait('@saveUsers').its('response.statusCode').should('eq', 200);

      cy.visit('/');
      cy.findAdminGroupSettings(baseGroup).click();
      openWsTab(primaryWorkspace);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Admin, true);

      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('cleanupSave');
      deselectRoleAtWs(standardUser.username, AccessLevel.Admin);
      clickAccessRightsSaveButton();
      cy.wait('@cleanupSave');
    });

    it('persists removal of role (deselect then save)', () => {
      // First assign
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('saveFirst');
      openWsTab(primaryWorkspace);
      selectRoleAtWs(standardUser.username, AccessLevel.Basic);
      clickAccessRightsSaveButton();
      cy.wait('@saveFirst').its('response.statusCode').should('eq', 200);

      // Now deselect and save
      cy.visit('/');
      cy.findAdminGroupSettings(baseGroup).click();
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('saveUsers');
      openWsTab(primaryWorkspace);
      deselectRoleAtWs(standardUser.username, AccessLevel.Basic);
      clickAccessRightsSaveButton();
      cy.wait('@saveUsers').its('response.statusCode').should('eq', 200);

      // Reload and verify unchecked
      cy.visit('/');
      cy.findAdminGroupSettings(baseGroup).click();
      openWsTab(primaryWorkspace);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Basic, false);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Developer, false);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Admin, false);
    });

    it('persists a role switch (Basic → Admin) after save', () => {
      // Assign Basic first
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('saveFirst');
      openWsTab(primaryWorkspace);
      selectRoleAtWs(standardUser.username, AccessLevel.Basic);
      clickAccessRightsSaveButton();
      cy.wait('@saveFirst').its('response.statusCode').should('eq', 200);

      // Switch to Admin
      cy.visit('/');
      cy.findAdminGroupSettings(baseGroup).click();
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('saveSwitch');
      openWsTab(primaryWorkspace);
      selectRoleAtWs(standardUser.username, AccessLevel.Admin);
      clickAccessRightsSaveButton();
      cy.wait('@saveSwitch').its('response.statusCode').should('eq', 200);

      // Reload and verify Admin is checked, Basic is not
      cy.visit('/');
      cy.findAdminGroupSettings(baseGroup).click();
      openWsTab(primaryWorkspace);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Admin, true);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Basic, false);

      // Cleanup
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('cleanupSave');
      deselectRoleAtWs(standardUser.username, AccessLevel.Admin);
      clickAccessRightsSaveButton();
      cy.wait('@cleanupSave');
    });
  });

  // -------------------------------------------------------------------------
  // 4. Selecting and deselecting a level (Users panel)
  // -------------------------------------------------------------------------

  describe('Users panel – selecting and deselecting', () => {
    beforeEach(() => {
      openUsersTab(standardUser.username);
    });

    it('marks only the clicked level and unchecks the level before it', () => {
      selectRoleAtUser(primaryWorkspace, AccessLevel.Basic);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Basic, true);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Developer, false);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Admin, false);

      selectRoleAtUser(primaryWorkspace, AccessLevel.Developer);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Developer, true);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Basic, false);

      selectRoleAtUser(primaryWorkspace, AccessLevel.Admin);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Admin, true);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Developer, false);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Basic, false);
    });

    it('leaves the row without a level when the checked radio is clicked again', () => {
      selectRoleAtUser(primaryWorkspace, AccessLevel.Admin);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Admin, true);

      deselectRoleAtUser(primaryWorkspace, AccessLevel.Admin);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Basic, false);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Developer, false);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Admin, false);
    });
  });

  // -------------------------------------------------------------------------
  // 5. Save and persist – Users panel
  // -------------------------------------------------------------------------

  describe('Users panel – save and reload', () => {
    it('persists Basic role via Users panel after save and reload', () => {
      cy.intercept('PATCH', '/api/group-admin/users/*/workspaces').as('saveWorkspaces');
      openUsersTab(standardUser.username);
      selectRoleAtUser(primaryWorkspace, AccessLevel.Basic);
      clickAccessRightsSaveButton();
      cy.wait('@saveWorkspaces').its('response.statusCode').should('eq', 200);

      cy.visit('/');
      cy.findAdminGroupSettings(baseGroup).click();
      openUsersTab(standardUser.username);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Basic, true);

      // Cleanup
      cy.intercept('PATCH', '/api/group-admin/users/*/workspaces').as('cleanupSave');
      deselectRoleAtUser(primaryWorkspace, AccessLevel.Basic);
      clickAccessRightsSaveButton();
      cy.wait('@cleanupSave');
    });

    it('persists role removal via Users panel after save and reload', () => {
      // Assign first
      cy.intercept('PATCH', '/api/group-admin/users/*/workspaces').as('saveFirst');
      openUsersTab(standardUser.username);
      selectRoleAtUser(primaryWorkspace, AccessLevel.Developer);
      clickAccessRightsSaveButton();
      cy.wait('@saveFirst').its('response.statusCode').should('eq', 200);

      // Deselect
      cy.visit('/');
      cy.findAdminGroupSettings(baseGroup).click();
      cy.intercept('PATCH', '/api/group-admin/users/*/workspaces').as('saveWorkspaces');
      openUsersTab(standardUser.username);
      deselectRoleAtUser(primaryWorkspace, AccessLevel.Developer);
      clickAccessRightsSaveButton();
      cy.wait('@saveWorkspaces').its('response.statusCode').should('eq', 200);

      cy.visit('/');
      cy.findAdminGroupSettings(baseGroup).click();
      openUsersTab(standardUser.username);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Developer, false);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Basic, false);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Admin, false);
    });
  });

  // -------------------------------------------------------------------------
  // 6. Cross-panel consistency: changes via Workspaces tab are reflected in Users tab
  // -------------------------------------------------------------------------

  describe('Cross-panel consistency', () => {
    it('role set via Workspaces tab is shown correctly in Users tab', () => {
      // Assign via Workspaces panel
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('saveUsers');
      openWsTab(primaryWorkspace);
      selectRoleAtWs(standardUser.username, AccessLevel.Developer);
      clickAccessRightsSaveButton();
      cy.wait('@saveUsers').its('response.statusCode').should('eq', 200);

      // Verify via Users panel
      cy.visit('/');
      cy.findAdminGroupSettings(baseGroup).click();
      openUsersTab(standardUser.username);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Developer, true);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Basic, false);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Admin, false);

      // Cleanup
      cy.intercept('PATCH', '/api/group-admin/users/*/workspaces').as('cleanupSave');
      deselectRoleAtUser(primaryWorkspace, AccessLevel.Developer);
      clickAccessRightsSaveButton();
      cy.wait('@cleanupSave');
    });

    it('role set via Users tab is shown correctly in Workspaces tab', () => {
      // Assign via Users panel
      cy.intercept('PATCH', '/api/group-admin/users/*/workspaces').as('saveWs');
      openUsersTab(standardUser.username);
      selectRoleAtUser(primaryWorkspace, AccessLevel.Admin);
      clickAccessRightsSaveButton();
      cy.wait('@saveWs').its('response.statusCode').should('eq', 200);

      // Verify via Workspaces panel
      cy.visit('/');
      cy.findAdminGroupSettings(baseGroup).click();
      openWsTab(primaryWorkspace);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Admin, true);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Basic, false);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Developer, false);

      // Cleanup
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('cleanupSave');
      deselectRoleAtWs(standardUser.username, AccessLevel.Admin);
      clickAccessRightsSaveButton();
      cy.wait('@cleanupSave');
    });
  });

  // -------------------------------------------------------------------------
  // 7. Multiple users/workspaces independence
  // -------------------------------------------------------------------------

  describe('Multiple users/workspaces – radio groups are independent', () => {
    it('two users in the same workspace have independent radio groups', () => {
      openWsTab(primaryWorkspace);

      selectRoleAtWs(standardUser.username, AccessLevel.Basic);
      selectRoleAtWs(secondaryUser.username, AccessLevel.Admin);

      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Basic, true);
      assertRoleRadioChecked(`(${standardUser.username})`, AccessLevel.Admin, false);
      assertRoleRadioChecked(`(${secondaryUser.username})`, AccessLevel.Admin, true);
      assertRoleRadioChecked(`(${secondaryUser.username})`, AccessLevel.Basic, false);
    });

    it('one user can have different levels across two workspaces', () => {
      openUsersTab(standardUser.username);

      selectRoleAtUser(primaryWorkspace, AccessLevel.Basic);
      selectRoleAtUser(secondaryWorkspace, AccessLevel.Admin);

      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Basic, true);
      assertRoleRadioChecked(primaryWorkspace, AccessLevel.Admin, false);
      assertRoleRadioChecked(secondaryWorkspace, AccessLevel.Admin, true);
      assertRoleRadioChecked(secondaryWorkspace, AccessLevel.Basic, false);
    });
  });

  after(() => {
    deleteUser(standardUser.username);
    deleteUser(secondaryUser.username);
    deleteGroup(baseGroup);
    deleteFirstUser();
  });
});
