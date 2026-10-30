import type { State, WorkspaceGroupFullDto, WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import { baseGroup } from '../../../support/testData';
import { clickIndexTabWsgAdmin } from '../../../support/helpers';
import { addState, deleteState } from '../../../support/helpers/group-admin';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

describe('The settings page of a workspace group', () => {
  let token = '';
  let groupId = '';

  const storedStates = (): Cypress.Chainable<State[]> => cy.getGroupPropertiesAPI(groupId, token)
    .then(resp => {
      expect(resp.status, 'group settings').to.equal(200);
      return (resp.body as WorkspaceGroupFullDto).settings?.states || [];
    });

  before(() => {
    createTestBaseAPI();
    cy.visit('/');
    cy.window()
      .then(win => {
        token = win.localStorage.getItem('id_token') || '';
        return cy.getWsGroupsAPI(token);
      })
      .then(resp => {
        const group = (resp.body as WorkspaceGroupInListDto[]).find(({ name }) => name === baseGroup);
        expect(group?.id, `id of ${baseGroup}`).to.be.a('number');
        groupId = String(group?.id);
        // the states "Initial" (1) and "Finale" (2)
        cy.updateGroupPropertiesAPI(groupId, token).its('status').should('equal', 200);
      });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  // Deleting a state saves the group settings at once. It saved the states as they were loaded, without what had
  // been changed before, and the next state got the id of the deleted one, which units keep (#2009).
  it('saves a renamed state along with a deletion, and gives the next state an id of its own', () => {
    cy.findAdminGroupSettings(baseGroup).click();
    clickIndexTabWsgAdmin('settings');
    cy.get('studio-lite-states .state')
      .first()
      .within(() => {
        cy.get('.text-form-field input').should('have.value', 'Initial').clear().type('Begonnen');
      });

    deleteState('Finale');
    storedStates().should('deep.equal', [{ id: 1, color: '#a51d2d', label: 'Begonnen' }]);

    addState('Abgeschlossen');
    storedStates().then(states => {
      expect(states.map(state => state.id)).to.deep.equal([1, 3]);
    });
  });

  // After a failed load the page offered substitutes with empty default modules for saving, and the API lays what
  // it gets over the stored settings (#2010). A group that does not exist fails to load without a faked answer.
  it('offers nothing to save when the group cannot be loaded', () => {
    cy.visit('/#/wsg-admin/999999/settings');
    // coming from another group's page, the router keeps the page and loads nothing
    cy.reload();
    cy.get('[data-cy="wsg-admin-settings-not-loaded"]').should('be.visible');
    cy.get('[data-cy="wsg-admin-settings-save-button"]').should('not.exist');
  });
});
