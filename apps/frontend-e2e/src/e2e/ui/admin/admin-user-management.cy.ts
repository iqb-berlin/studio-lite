import {
  addFirstUser,
  clearFormControl,
  clearUserFilter,
  clickIndexTabAdmin,
  clickIndexTabWsgAdmin,
  createGroup,
  createNewUser,
  deleteFirstUser,
  deleteGroup,
  deleteUser,
  editInput,
  filterUsers,
  goToAdminUsers,
  makeAdminOfGroup,
  renameGroup,
  saveUserEdit,
  selectUserRow
} from '../../../support/helpers';
import { addState } from '../../../support/helpers/group-admin';
import { selectProfileForGroupFromAdmin } from '../../../support/metadata/metadata-util';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import { secondaryUser } from '../../../support/testData';

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
      renameGroup('Rename Test Group', 'Umbenennte Gruppe');
      deleteGroup('Umbenennte Gruppe');
    });

    // Renaming a group and choosing its profiles sent settings along that were laid over the
    // stored ones: renaming wiped the profiles, choosing profiles wiped the states (#1960).
    it('keeps the profiles and the states of a group when it is renamed and given profiles', () => {
      // neither name contains the other, so that no selector finds both rows
      const group = 'Gruppe mit Profilen';
      const renamed = 'Umbenannt mit Status';
      createGroup(group);
      makeAdminOfGroup(group, [Cypress.expose('username')]);
      cy.findAdminGroupSettings(group).click();
      clickIndexTabWsgAdmin('settings');
      addState('Geprüft');

      selectProfileForGroupFromAdmin(group, IqbProfile.DEu);
      renameGroup(group, renamed);
      selectProfileForGroupFromAdmin(renamed, IqbProfile.MAu);

      // a page of its own, so that the list reloaded after saving cannot drop the selected row
      cy.visit('/');
      cy.findAdminSettings().click();
      clickIndexTabAdmin('workspace-groups');
      cy.contains('mat-row', renamed).click();
      cy.get('mat-icon').contains('settings').click();
      [IqbProfile.DEu, IqbProfile.MAu].forEach(profile => {
        cy.get('[data-cy="shared-profiles-select-profile"]')
          .filter(`:contains(${profile})`)
          .find('input')
          .should('be.checked');
      });
      cy.findAdminGroupSettings(renamed).click();
      clickIndexTabWsgAdmin('settings');
      cy.get('studio-lite-states .state .text-form-field input').should($inputs => {
        expect([...$inputs].map(input => (input as HTMLInputElement).value)).to.include('Geprüft');
      });
      deleteGroup(renamed);
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
