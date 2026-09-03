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
  // 1. UI structure – radio buttons rendered, not checkboxes
  // -------------------------------------------------------------------------

  describe('UI structure', () => {
    it('renders mat-radio-button elements (not checkboxes) in the Workspaces panel', () => {
      openWsTab(ws1);
      cy.get('[data-cy="access-rights-row"]').first().within(() => {
        cy.get('mat-radio-button').should('have.length', 3);
        cy.get('mat-checkbox').should('not.exist');
      });
    });

    it('renders mat-radio-button elements (not checkboxes) in the Users panel', () => {
      openUsersTab(newUser.username);
      cy.get('[data-cy="access-rights-row"]').first().within(() => {
        cy.get('mat-radio-button').should('have.length', 3);
        cy.get('mat-checkbox').should('not.exist');
      });
    });

    // Material's 48px touch target overlaps the 40px input by 4px, and a click on that rim
    // reaches `_onTouchTargetClick`, which stops propagation before the host `(click)` that
    // deselects. The panels hide it (`--mat-radio-touch-target-display`); without this
    // assertion, removing that style leaves every deselect test below green.
    it('hides the touch target that would swallow deselect clicks', () => {
      openWsTab(ws1);
      getRoleRadio(`(${newUser.username})`, AccessLevel.Basic)
        .find('.mat-mdc-radio-touch-target')
        .should('not.be.visible');
    });

    it('shows exactly 3 radio buttons (level 1, 2, 4) per row in the Workspaces panel', () => {
      openWsTab(ws1);
      cy.get('[data-cy="access-rights-row"]').should('have.length.greaterThan', 0).each($row => {
        cy.wrap($row).find('[data-cy^="access-rights-radio-button-"]').should('have.length', 3);
        cy.wrap($row).find('[data-cy="access-rights-radio-button-1"]').should('exist');
        cy.wrap($row).find('[data-cy="access-rights-radio-button-2"]').should('exist');
        cy.wrap($row).find('[data-cy="access-rights-radio-button-4"]').should('exist');
      });
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
  // 2. All three access levels can be selected (Workspaces panel)
  // -------------------------------------------------------------------------

  describe('Workspaces panel – selecting access levels', () => {
    beforeEach(() => {
      openWsTab(ws1);
    });

    it('selects Basic (level 1) for a user and marks only that radio checked', () => {
      selectRoleAtWs(newUser.username, AccessLevel.Basic);

      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, true);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Developer, false);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, false);
    });

    it('selects Developer (level 2) for a user and marks only that radio checked', () => {
      selectRoleAtWs(newUser.username, AccessLevel.Developer);

      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Developer, true);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, false);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, false);
    });

    it('selects Admin (level 4) for a user and marks only that radio checked', () => {
      selectRoleAtWs(newUser.username, AccessLevel.Admin);

      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, true);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, false);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Developer, false);
    });

    it('switches level: selecting Developer after Basic unchecks Basic', () => {
      selectRoleAtWs(newUser.username, AccessLevel.Basic);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, true);

      selectRoleAtWs(newUser.username, AccessLevel.Developer);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Developer, true);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, false);
    });

    it('radio selections for one user do not affect another user\'s row', () => {
      selectRoleAtWs(newUser.username, AccessLevel.Basic);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, true);

      // anotherUser's row must remain unchecked
      assertRoleRadioChecked(`(${anotherUser.username})`, AccessLevel.Basic, false);
      assertRoleRadioChecked(`(${anotherUser.username})`, AccessLevel.Developer, false);
      assertRoleRadioChecked(`(${anotherUser.username})`, AccessLevel.Admin, false);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Unselect by re-clicking the active radio (Workspaces panel)
  // -------------------------------------------------------------------------

  describe('Workspaces panel – deselect by re-clicking (unselectable radio)', () => {
    beforeEach(() => {
      openWsTab(ws1);
    });

    it('deselects Basic by clicking the already-checked Basic radio', () => {
      selectRoleAtWs(newUser.username, AccessLevel.Basic);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, true);

      deselectRoleAtWs(newUser.username, AccessLevel.Basic);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, false);
    });

    it('deselects Developer by re-clicking it', () => {
      selectRoleAtWs(newUser.username, AccessLevel.Developer);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Developer, true);

      deselectRoleAtWs(newUser.username, AccessLevel.Developer);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Developer, false);
    });

    it('deselects Admin by re-clicking it', () => {
      selectRoleAtWs(newUser.username, AccessLevel.Admin);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, true);

      deselectRoleAtWs(newUser.username, AccessLevel.Admin);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, false);
    });

    it('all three radios are unchecked after deselection', () => {
      selectRoleAtWs(newUser.username, AccessLevel.Admin);
      deselectRoleAtWs(newUser.username, AccessLevel.Admin);

      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, false);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Developer, false);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Admin, false);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Save and persist – Workspaces panel
  // -------------------------------------------------------------------------

  describe('Workspaces panel – save and reload', () => {
    it('persists a Basic role assignment after save and page reload', () => {
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('saveUsers');
      openWsTab(ws1);
      selectRoleAtWs(newUser.username, AccessLevel.Basic);
      clickAccessRightsSaveButton();
      cy.wait('@saveUsers').its('response.statusCode').should('eq', 200);

      // Reload and verify the radio is still checked
      cy.visit('/');
      cy.findAdminGroupSettings(group1).click();
      openWsTab(ws1);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Basic, true);

      // Cleanup: deselect and save
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('cleanupSave');
      deselectRoleAtWs(newUser.username, AccessLevel.Basic);
      clickAccessRightsSaveButton();
      cy.wait('@cleanupSave');
    });

    it('persists a Developer role assignment after save and page reload', () => {
      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('saveUsers');
      openWsTab(ws1);
      selectRoleAtWs(newUser.username, AccessLevel.Developer);
      clickAccessRightsSaveButton();
      cy.wait('@saveUsers').its('response.statusCode').should('eq', 200);

      cy.visit('/');
      cy.findAdminGroupSettings(group1).click();
      openWsTab(ws1);
      assertRoleRadioChecked(`(${newUser.username})`, AccessLevel.Developer, true);

      cy.intercept('PATCH', '/api/group-admin/workspaces/*/users').as('cleanupSave');
      deselectRoleAtWs(newUser.username, AccessLevel.Developer);
      clickAccessRightsSaveButton();
      cy.wait('@cleanupSave');
    });

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
  // 5. All three access levels can be selected (Users panel)
  // -------------------------------------------------------------------------

  describe('Users panel – selecting access levels', () => {
    beforeEach(() => {
      openUsersTab(newUser.username);
    });

    it('selects Basic (level 1) for a workspace and marks only that radio checked', () => {
      selectRoleAtUser(ws1, AccessLevel.Basic);

      assertRoleRadioChecked(ws1, AccessLevel.Basic, true);
      assertRoleRadioChecked(ws1, AccessLevel.Developer, false);
      assertRoleRadioChecked(ws1, AccessLevel.Admin, false);
    });

    it('selects Developer (level 2) for a workspace', () => {
      selectRoleAtUser(ws1, AccessLevel.Developer);

      assertRoleRadioChecked(ws1, AccessLevel.Developer, true);
      assertRoleRadioChecked(ws1, AccessLevel.Basic, false);
      assertRoleRadioChecked(ws1, AccessLevel.Admin, false);
    });

    it('selects Admin (level 4) for a workspace', () => {
      selectRoleAtUser(ws1, AccessLevel.Admin);

      assertRoleRadioChecked(ws1, AccessLevel.Admin, true);
      assertRoleRadioChecked(ws1, AccessLevel.Basic, false);
      assertRoleRadioChecked(ws1, AccessLevel.Developer, false);
    });

    it('selecting a level for ws1 does not affect ws2\'s radio group', () => {
      selectRoleAtUser(ws1, AccessLevel.Admin);

      assertRoleRadioChecked(ws2, AccessLevel.Admin, false);
      assertRoleRadioChecked(ws2, AccessLevel.Basic, false);
      assertRoleRadioChecked(ws2, AccessLevel.Developer, false);
    });
  });

  // -------------------------------------------------------------------------
  // 6. Unselect by re-clicking the active radio (Users panel)
  // -------------------------------------------------------------------------

  describe('Users panel – deselect by re-clicking (unselectable radio)', () => {
    beforeEach(() => {
      openUsersTab(newUser.username);
    });

    it('deselects Basic by re-clicking it', () => {
      selectRoleAtUser(ws1, AccessLevel.Basic);
      assertRoleRadioChecked(ws1, AccessLevel.Basic, true);

      deselectRoleAtUser(ws1, AccessLevel.Basic);
      assertRoleRadioChecked(ws1, AccessLevel.Basic, false);
    });

    it('deselects Developer by re-clicking it', () => {
      selectRoleAtUser(ws1, AccessLevel.Developer);
      assertRoleRadioChecked(ws1, AccessLevel.Developer, true);

      deselectRoleAtUser(ws1, AccessLevel.Developer);
      assertRoleRadioChecked(ws1, AccessLevel.Developer, false);
    });

    it('deselects Admin by re-clicking it', () => {
      selectRoleAtUser(ws1, AccessLevel.Admin);
      assertRoleRadioChecked(ws1, AccessLevel.Admin, true);

      deselectRoleAtUser(ws1, AccessLevel.Admin);
      assertRoleRadioChecked(ws1, AccessLevel.Admin, false);
    });
  });

  // -------------------------------------------------------------------------
  // 7. Save and persist – Users panel
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
  // 8. Cross-panel consistency: changes via Workspaces tab are reflected in Users tab
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
  // 9. Multiple users/workspaces independence
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
