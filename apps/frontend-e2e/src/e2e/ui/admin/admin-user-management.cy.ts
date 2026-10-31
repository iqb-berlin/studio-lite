import {
  addFirstUser,
  clearFormControl,
  clearUserFilter,
  clickIndexTabAdmin,
  clickIndexTabWsgAdmin,
  createGroup,
  createNewUser,
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
import { secondaryUser, standardUser } from '../../../support/testData';

describe('Admin User Management', () => {
  const editTarget = secondaryUser;

  before(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    addFirstUser();
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

    // The API refuses to delete the own account (#1949), so its row offers no delete button.
    it('offers no delete button in the row of the logged-in admin (#1949)', () => {
      cy.window().then(win => {
        const token = win.localStorage.getItem('id_token') || '';
        // a user no other test here creates, so that a failure leaves nothing in their way
        cy.createUserAPI(standardUser, token).then(user => {
          expect(user.status, standardUser.username).to.equal(201);
          goToAdminUsers();
          cy.contains('mat-row', Cypress.expose('username'))
            .find('[data-cy="admin-users-delete-user"]')
            .should('not.exist');
          cy.contains('mat-row', standardUser.username)
            .find('[data-cy="admin-users-delete-user"]')
            .should('exist');
          cy.deleteUsersAPI([String(user.body)], token).its('status').should('equal', 200);
        });
      });
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

  // ─── Own account ──────────────────────────────────────────────────────────────

  describe('Own account', () => {
    // The API refuses it (#1950), so the dialog of the own account keeps the checkbox out of reach.
    it('offers no way to take away the own administrator right (#1950)', () => {
      goToAdminUsers();
      selectUserRow(Cypress.expose('username'));
      cy.get('[data-cy="admin-users-menu-edit-user"]').click();
      cy.get('[formcontrolname="isAdmin"] input[type="checkbox"]').should('be.disabled');
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.contains(json.admin['own-admin-hint']).should('be.visible');
        cy.clickDialogButton(json.cancel);
      });
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

  // ─── Group admins: no check lost while they load ──────────────────────────────

  // A check set before the admins of a group, or the groups of a user, arrived was reset by them
  // (#2056). The answer is held back, so that the lock can be seen while it lasts.
  describe('Group admins while they load', () => {
    const group = 'Gruppe mit später Antwort';
    const holdBack = (url: string, alias: string): void => {
      cy.intercept('GET', url, req => {
        req.on('response', res => { res.setDelay(1500); });
      }).as(alias);
    };

    before(() => {
      cy.window().then(win => {
        cy.createGroupAPI({ id: '', name: group }, win.localStorage.getItem('id_token') || '')
          .its('status').should('equal', 201);
      });
    });

    it('locks the checks while the admins of the selected group load (#2056)', () => {
      cy.visit('/');
      cy.findAdminSettings().click();
      clickIndexTabAdmin('workspace-groups');
      holdBack('/api/admin/workspace-groups/*/admins', 'groupAdmins');
      cy.contains('mat-row', group).click();
      cy.contains('mat-checkbox', `(${Cypress.expose('username')})`)
        .find('input[type="checkbox"]')
        .should('be.disabled');
      cy.wait('@groupAdmins');
      cy.contains('mat-checkbox', `(${Cypress.expose('username')})`)
        .find('input[type="checkbox"]')
        .should('be.enabled');
    });

    it('locks the checks while the groups of the selected user load (#2056)', () => {
      goToAdminUsers();
      holdBack('/api/admin/users/*/workspace-groups', 'userGroups');
      selectUserRow(Cypress.expose('username'));
      cy.contains('mat-checkbox', group)
        .find('input[type="checkbox"]')
        .should('be.disabled');
      cy.wait('@userGroups');
      cy.contains('mat-checkbox', group)
        .find('input[type="checkbox"]')
        .should('be.enabled');
    });
  });
});
