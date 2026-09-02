import {
  addFirstUser,
  clearFormControl,
  clearUserFilter,
  clickIndexTabAdmin,
  createGroup,
  createNewUser,
  deleteFirstUser,
  deleteGroup,
  deleteUser,
  editInput,
  filterUsers,
  goToAdminUsers,
  makeAdminOfGroup,
  saveUserEdit,
  selectUserRow
} from '../../../support/helpers';
import { secondaryUser } from '../../../support/testData';

// ---------------------------------------------------------------------------
// Covers (all previously < 70 % e2e coverage):
//   - admin/components/users          (was 67 %)
//   - admin/components/users-menu     (was 57 %)
//   - admin/components/edit-user      (was 42 %)
//   - admin/components/workspace-groups-menu (was 50 %)
// ---------------------------------------------------------------------------
describe('Admin User Management', () => {
  const editTarget = secondaryUser;

  before(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    addFirstUser();
  });

  after(() => {
    deleteFirstUser();
  });

  // ─── Users tab: component visibility ─────────────────────────────────────────

  describe('Users tab', () => {
    beforeEach(() => {
      goToAdminUsers();
    });

    it('shows the users and users-menu components', () => {
      cy.get('studio-lite-users').should('exist');
      cy.get('studio-lite-users-menu').should('exist');
    });

    it('opens the add-user form via the users-menu button', () => {
      cy.get('[data-cy="admin-users-menu-add-user"]').click();
      cy.get('[data-cy="admin-edit-user-username"]').should('be.visible');
    });

    it('disables submit when username is empty', () => {
      cy.get('[data-cy="admin-users-menu-add-user"]').click();
      cy.get('[data-cy="admin-edit-user-username"]').clear();
      cy.get('[data-cy="admin-edit-user-button"]').should('be.disabled');
    });

    it('filters the user list and clears it again', () => {
      createNewUser(editTarget);
      filterUsers(editTarget.username);
      cy.contains('mat-row', editTarget.username).should('be.visible');
      cy.contains('mat-row', Cypress.expose('username')).should('not.exist');

      clearUserFilter();
      cy.contains('mat-row', Cypress.expose('username')).should('be.visible');
      cy.contains('mat-row', editTarget.username).should('be.visible');

      deleteUser(editTarget.username);
    });

    it('sorts the table by username column', () => {
      cy.get('mat-header-cell').contains('Name', { matchCase: false }).click();
      cy.get('mat-header-cell.mat-sort-header-sorted, [aria-sort]').should('exist');
    });
  });

  // ─── Edit-user: CRUD flows ────────────────────────────────────────────────────

  describe('Edit user', () => {
    before(() => {
      createNewUser(editTarget);
    });

    after(() => {
      deleteUser(editTarget.username);
    });

    beforeEach(() => {
      goToAdminUsers();
      selectUserRow(editTarget.username);
      cy.get('[data-cy="admin-users-menu-edit-user"]').click();
    });

    it('opens the edit form pre-filled with current data', () => {
      cy.get('[data-cy="admin-edit-user-username"]')
        .should('be.visible')
        .and('have.value', editTarget.username);
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.clickDialogButton(json.cancel);
      });
    });

    it('updates the email address', () => {
      editInput('admin-edit-user-email', 'updated@example.com');
      saveUserEdit('updateEmail');
    });

    it('changes the password', () => {
      editInput('admin-edit-user-password', 'NewSecret99!');
      saveUserEdit('changePassword');
    });

    it('toggles the admin flag on and then off', () => {
      cy.get('[formcontrolname="isAdmin"]').click({ force: true });
      saveUserEdit('toggleAdmin');

      // Reopen the row and revert
      goToAdminUsers();
      selectUserRow(editTarget.username);
      cy.get('[data-cy="admin-users-menu-edit-user"]').click();
      cy.get('[formcontrolname="isAdmin"]').click({ force: true });
      saveUserEdit('revertAdmin');
    });

    it('clears and restores the email field (form-validation coverage)', () => {
      clearFormControl('email');
      cy.get('[data-cy="admin-edit-user-button"]').should('exist');
      editInput('admin-edit-user-email', 'restored@example.com');
      saveUserEdit('restoreEmail');
    });
  });

  // ─── Workspace groups: rename and assign admin ────────────────────────────────

  describe('Workspace Groups menu', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.findAdminSettings().click();
      clickIndexTabAdmin('workspace-groups');
    });

    it('shows workspace-groups and workspace-groups-menu components', () => {
      cy.get('studio-lite-workspace-groups').should('exist');
      cy.get('studio-lite-workspace-groups-menu').should('exist');
    });

    it('renames a group', () => {
      createGroup('Rename Test Group');
      cy.contains('mat-row', 'Rename Test Group').click();
      cy.get('[data-cy="admin-workspace-groups-rename-group"]').click({ force: true });
      cy.translate(Cypress.expose('locale')).then(json => {
        const placeholderText = json.admin['group-name'];
        cy.get(`input[placeholder="${placeholderText}"]`)
          .should('be.visible')
          .clear()
          .type('Umbenennte Gruppe');

        cy.intercept('PATCH', '/api/admin/workspace-groups/*').as('patchGroup');
        cy.get('mat-dialog-actions button')
          .contains(json.save)
          .click({ force: true });
        cy.wait('@patchGroup').its('response.statusCode').should('eq', 200);
      });
      cy.contains('mat-row', 'Umbenennte Gruppe').should('exist');
      deleteGroup('Umbenennte Gruppe');
    });

    it('assigns a user as group admin', () => {
      createNewUser(editTarget);
      createGroup('Admin Rights Group');
      makeAdminOfGroup('Admin Rights Group', [editTarget.username]);
      deleteGroup('Admin Rights Group');
      deleteUser(editTarget.username);
    });
  });
});
