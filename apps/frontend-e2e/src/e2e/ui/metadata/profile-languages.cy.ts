import { AccessLevel, baseGroup, primaryWorkspace } from '../../../support/testData';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import { clickIndexTabWsgAdmin } from '../../../support/helpers';
import { createGroupAdminBaseAPI } from '../../../support/helpers/test-base';

// Where a metadata profile is chosen, the languages it is complete in stand behind its name, read from
// the profile itself (#2212). Every profile of the registry brings its texts in German only so far.
describe('Languages of a metadata profile where it is chosen', () => {
  const deutsch = 'https://w3id.org/iqb/p12/unit/';
  let token = '';

  before(() => {
    createGroupAdminBaseAPI({ users: [], firstUserAccess: AccessLevel.Admin }).then(base => {
      token = base.token;
    });
  });

  it('stand behind each profile the group can choose', () => {
    cy.findAdminGroupSettings(baseGroup).click();
    clickIndexTabWsgAdmin('settings');

    const profile = () => cy.get('[data-cy="shared-profiles-select-profile"]').filter(`:contains(${IqbProfile.DEu})`);
    profile().find('[data-cy="shared-profiles-profile-languages"]').should('have.text', '(de)');
    // the name the choice is saved under stays the name of the profile
    profile().find('input').should('have.attr', 'name', IqbProfile.DEu);
  });

  it('stand behind each profile a workspace of the group can choose', () => {
    cy.getWsGroupsAPI(token).then(groups => {
      expect(groups.status, 'groups').to.equal(200);
      const groupId = String((groups.body as { id: number; name: string }[])
        .find(group => group.name === baseGroup)?.id);
      cy.updateGroupSettingsAPI(groupId, { profiles: [{ id: deutsch, label: IqbProfile.DEu }] }, token)
        .its('status').should('equal', 200);
    });

    cy.findAdminGroupSettings(baseGroup).click();
    clickIndexTabWsgAdmin('workspaces');
    cy.get('mat-table').contains(primaryWorkspace).click();
    cy.get('mat-icon').contains('settings').click();
    cy.get('[data-cy="edit-workspace-settings-select-unit-profile"]').click();

    cy.get('[data-cy="edit-workspace-settings-unit-profile"]')
      .filter(`:contains(${IqbProfile.DEu})`)
      .find('[data-cy="edit-workspace-settings-profile-languages"]')
      .should('have.text', '(de)');
  });
});
