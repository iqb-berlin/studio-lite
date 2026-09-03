import {
  AccessLevel,
  group1,
  newUser,
  anotherUser,
  ws1,
  ws2
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
    createNewUser(newUser);
    createNewUser(anotherUser);
    createGroup(group1);
    createWs(ws1, group1);
    createWs(ws2, group1);
    // makeAdminOfGroup navigates away — call last so it doesn't break createWs above
    makeAdminOfGroup(group1, [Cypress.expose('username')]);
  });

  beforeEach(() => {
    cy.visit('/');
    cy.findAdminGroupSettings(group1).click();
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
      openWsTab(ws1);
      getRoleRadio(`(${newUser.username})`, AccessLevel.Basic)
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
      openWsTab(ws1);
    });

    // One walk over all three levels: every level can be picked, and picking the next one
    // unchecks the one before -- the same assertion the three per-level tests each made once.
    it('marks only the clicked level and unchecks the level before it', () => {
      selectRoleAtWs(newUser.username, AccessLevel.Basic);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, true);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Developer, false);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, false);

      selectRoleAtWs(newUser.username, AccessLevel.Developer);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Developer, true);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, false);

      selectRoleAtWs(newUser.username, AccessLevel.Admin);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, true);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Developer, false);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, false);
    });

    it('leaves the row without a level when the checked radio is clicked again', () => {
      selectRoleAtWs(newUser.username, AccessLevel.Admin);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, true);

      deselectRoleAtWs(newUser.username, AccessLevel.Admin);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, false);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Developer, false);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, false);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Save and persist – Workspaces panel
  // -------------------------------------------------------------------------

  describe('Workspaces panel – save and reload', () => {
    it('persists an Admin role assignment after save and page reload', () => {
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('saveUsers');
      openWsTab(ws1);
      selectRoleAtWs(newUser.username, AccessLevel.Admin);
      clickAccessRightsSaveButton();
      cy.wait('@saveUsers').its('response.statusCode').should('eq', 200);

      cy.visit('/');
      cy.findAdminGroupSettings(group1).click();
      openWsTab(ws1);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, true);

      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('cleanupSave');
      deselectRoleAtWs(newUser.username, AccessLevel.Admin);
      clickAccessRightsSaveButton();
      cy.wait('@cleanupSave');
    });

    it('persists removal of role (deselect then save)', () => {
      // First assign
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('saveFirst');
      openWsTab(ws1);
      selectRoleAtWs(newUser.username, AccessLevel.Basic);
      clickAccessRightsSaveButton();
      cy.wait('@saveFirst').its('response.statusCode').should('eq', 200);

      // Now deselect and save
      cy.visit('/');
      cy.findAdminGroupSettings(group1).click();
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('saveUsers');
      openWsTab(ws1);
      deselectRoleAtWs(newUser.username, AccessLevel.Basic);
      clickAccessRightsSaveButton();
      cy.wait('@saveUsers').its('response.statusCode').should('eq', 200);

      // Reload and verify unchecked
      cy.visit('/');
      cy.findAdminGroupSettings(group1).click();
      openWsTab(ws1);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, false);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Developer, false);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, false);
    });

    it('persists a role switch (Basic → Admin) after save', () => {
      // Assign Basic first
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('saveFirst');
      openWsTab(ws1);
      selectRoleAtWs(newUser.username, AccessLevel.Basic);
      clickAccessRightsSaveButton();
      cy.wait('@saveFirst').its('response.statusCode').should('eq', 200);

      // Switch to Admin
      cy.visit('/');
      cy.findAdminGroupSettings(group1).click();
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('saveSwitch');
      openWsTab(ws1);
      selectRoleAtWs(newUser.username, AccessLevel.Admin);
      clickAccessRightsSaveButton();
      cy.wait('@saveSwitch').its('response.statusCode').should('eq', 200);

      // Reload and verify Admin is checked, Basic is not
      cy.visit('/');
      cy.findAdminGroupSettings(group1).click();
      openWsTab(ws1);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, true);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, false);

      // Cleanup
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('cleanupSave');
      deselectRoleAtWs(newUser.username, AccessLevel.Admin);
      clickAccessRightsSaveButton();
      cy.wait('@cleanupSave');
    });
  });

  // -------------------------------------------------------------------------
  // 4. Selecting and deselecting a level (Users panel)
  // -------------------------------------------------------------------------

  describe('Users panel – selecting and deselecting', () => {
    beforeEach(() => {
      openUsersTab(newUser.username);
    });

    it('marks only the clicked level and unchecks the level before it', () => {
      selectRoleAtUser(ws1, AccessLevel.Basic);
      assertRoleRadioChecked(ws1, AccessLevel.Basic, true);
      assertRoleRadioChecked(ws1, AccessLevel.Developer, false);
      assertRoleRadioChecked(ws1, AccessLevel.Admin, false);

      selectRoleAtUser(ws1, AccessLevel.Developer);
      assertRoleRadioChecked(ws1, AccessLevel.Developer, true);
      assertRoleRadioChecked(ws1, AccessLevel.Basic, false);

      selectRoleAtUser(ws1, AccessLevel.Admin);
      assertRoleRadioChecked(ws1, AccessLevel.Admin, true);
      assertRoleRadioChecked(ws1, AccessLevel.Developer, false);
      assertRoleRadioChecked(ws1, AccessLevel.Basic, false);
    });

    it('leaves the row without a level when the checked radio is clicked again', () => {
      selectRoleAtUser(ws1, AccessLevel.Admin);
      assertRoleRadioChecked(ws1, AccessLevel.Admin, true);

      deselectRoleAtUser(ws1, AccessLevel.Admin);
      assertRoleRadioChecked(ws1, AccessLevel.Basic, false);
      assertRoleRadioChecked(ws1, AccessLevel.Developer, false);
      assertRoleRadioChecked(ws1, AccessLevel.Admin, false);
    });
  });

  // -------------------------------------------------------------------------
  // 5. Save and persist – Users panel
  // -------------------------------------------------------------------------

  describe('Users panel – save and reload', () => {
    it('persists Basic role via Users panel after save and reload', () => {
      cy.intercept('PATCH', '/api/group-admin/users/*/workspaces').as('saveWorkspaces');
      openUsersTab(newUser.username);
      selectRoleAtUser(ws1, AccessLevel.Basic);
      clickAccessRightsSaveButton();
      cy.wait('@saveWorkspaces').its('response.statusCode').should('eq', 200);

      cy.visit('/');
      cy.findAdminGroupSettings(group1).click();
      openUsersTab(newUser.username);
      assertRoleRadioChecked(ws1, AccessLevel.Basic, true);

      // Cleanup
      cy.intercept('PATCH', '/api/group-admin/users/*/workspaces').as('cleanupSave');
      deselectRoleAtUser(ws1, AccessLevel.Basic);
      clickAccessRightsSaveButton();
      cy.wait('@cleanupSave');
    });

    it('persists role removal via Users panel after save and reload', () => {
      // Assign first
      cy.intercept('PATCH', '/api/group-admin/users/*/workspaces').as('saveFirst');
      openUsersTab(newUser.username);
      selectRoleAtUser(ws1, AccessLevel.Developer);
      clickAccessRightsSaveButton();
      cy.wait('@saveFirst').its('response.statusCode').should('eq', 200);

      // Deselect
      cy.visit('/');
      cy.findAdminGroupSettings(group1).click();
      cy.intercept('PATCH', '/api/group-admin/users/*/workspaces').as('saveWorkspaces');
      openUsersTab(newUser.username);
      deselectRoleAtUser(ws1, AccessLevel.Developer);
      clickAccessRightsSaveButton();
      cy.wait('@saveWorkspaces').its('response.statusCode').should('eq', 200);

      cy.visit('/');
      cy.findAdminGroupSettings(group1).click();
      openUsersTab(newUser.username);
      assertRoleRadioChecked(ws1, AccessLevel.Developer, false);
      assertRoleRadioChecked(ws1, AccessLevel.Basic, false);
      assertRoleRadioChecked(ws1, AccessLevel.Admin, false);
    });
  });

  // -------------------------------------------------------------------------
  // 6. Cross-panel consistency: changes via Workspaces tab are reflected in Users tab
  // -------------------------------------------------------------------------

  describe('Cross-panel consistency', () => {
    it('role set via Workspaces tab is shown correctly in Users tab', () => {
      // Assign via Workspaces panel
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('saveUsers');
      openWsTab(ws1);
      selectRoleAtWs(newUser.username, AccessLevel.Developer);
      clickAccessRightsSaveButton();
      cy.wait('@saveUsers').its('response.statusCode').should('eq', 200);

      // Verify via Users panel
      cy.visit('/');
      cy.findAdminGroupSettings(group1).click();
      openUsersTab(newUser.username);
      assertRoleRadioChecked(ws1, AccessLevel.Developer, true);
      assertRoleRadioChecked(ws1, AccessLevel.Basic, false);
      assertRoleRadioChecked(ws1, AccessLevel.Admin, false);

      // Cleanup
      cy.intercept('PATCH', '/api/group-admin/users/*/workspaces').as('cleanupSave');
      deselectRoleAtUser(ws1, AccessLevel.Developer);
      clickAccessRightsSaveButton();
      cy.wait('@cleanupSave');
    });

    it('role set via Users tab is shown correctly in Workspaces tab', () => {
      // Assign via Users panel
      cy.intercept('PATCH', '/api/group-admin/users/*/workspaces').as('saveWs');
      openUsersTab(newUser.username);
      selectRoleAtUser(ws1, AccessLevel.Admin);
      clickAccessRightsSaveButton();
      cy.wait('@saveWs').its('response.statusCode').should('eq', 200);

      // Verify via Workspaces panel
      cy.visit('/');
      cy.findAdminGroupSettings(group1).click();
      openWsTab(ws1);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, true);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, false);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Developer, false);

      // Cleanup
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('cleanupSave');
      deselectRoleAtWs(newUser.username, AccessLevel.Admin);
      clickAccessRightsSaveButton();
      cy.wait('@cleanupSave');
    });
  });

  // -------------------------------------------------------------------------
  // 7. Multiple users/workspaces independence
  // -------------------------------------------------------------------------

  describe('Multiple users/workspaces – radio groups are independent', () => {
    it('two users in the same workspace have independent radio groups', () => {
      openWsTab(ws1);

      selectRoleAtWs(newUser.username, AccessLevel.Basic);
      selectRoleAtWs(anotherUser.username, AccessLevel.Admin);

      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, true);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, false);
      assertRoleRadioChecked(`(${anotherUser.username})`, AccessLevel.Admin, true);
      assertRoleRadioChecked(`(${anotherUser.username})`, AccessLevel.Basic, false);
    });

    it('one user can have different levels across two workspaces', () => {
      openUsersTab(newUser.username);

      selectRoleAtUser(ws1, AccessLevel.Basic);
      selectRoleAtUser(ws2, AccessLevel.Admin);

      assertRoleRadioChecked(ws1, AccessLevel.Basic, true);
      assertRoleRadioChecked(ws1, AccessLevel.Admin, false);
      assertRoleRadioChecked(ws2, AccessLevel.Admin, true);
      assertRoleRadioChecked(ws2, AccessLevel.Basic, false);
    });
  });

  after(() => {
    deleteUser(newUser.username);
    deleteUser(anotherUser.username);
    deleteGroup(group1);
    deleteFirstUser();
  });
});
