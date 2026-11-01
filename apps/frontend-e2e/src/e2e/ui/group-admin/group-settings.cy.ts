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

  // What is typed while the save is under way was not sent: it stays unsaved, and the button stays locked until
  // the answer, so that no second save overtakes the first (#2094)
  it('keeps a state renamed while saving unsaved and saves it with the next save', () => {
    const saveButton = () => cy.get('[data-cy="wsg-admin-settings-save-button"]');
    const firstStateLabel = () => cy.get('studio-lite-states .state').first().find('.text-form-field input');
    // the answer to the first save is held back until the test has typed on
    let release = (): void => undefined;
    const held = new Promise<void>(resolve => { release = resolve; });
    let saves = 0;
    cy.intercept('PATCH', `/api/workspace-groups/${groupId}`, req => {
      saves += 1;
      if (saves === 1) req.on('response', () => held);
    }).as('saveSettingsSlowly');
    cy.visit('/');
    cy.findAdminGroupSettings(baseGroup).click();
    clickIndexTabWsgAdmin('settings');

    firstStateLabel().clear().type('Vorher');
    saveButton().click();
    firstStateLabel().type(' danach');
    // within the 10 s the held answer may wait, so that a missing lock fails here and says so
    cy.get('[data-cy="wsg-admin-settings-save-button"]', { timeout: 2000 }).should('be.disabled');
    cy.then(() => release());
    cy.wait('@saveSettingsSlowly').its('request.body.settings.states.0.label').should('equal', 'Vorher');

    saveButton().should('be.enabled').click();
    cy.wait('@saveSettingsSlowly').its('request.body.settings.states.0.label').should('equal', 'Vorher danach');
    saveButton().should('be.disabled');
    storedStates().its('0.label').should('equal', 'Vorher danach');
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
