import {
  goToSettings, saveAndExpect, login, logout
} from '../../../support/helpers';

// An administrator lets snow fall on the start page and stops it again, in the settings (#2221).
describe('Snow on the start page', () => {
  const snowfallSwitch = '[data-cy="admin-effects-snowfall"] button[role="switch"]';
  const snowfall = '[data-cy="home-snowfall"]';
  // saveAndExpect counts the save buttons of the settings: texts, mail template, logo, then the effects
  const effectsCard = 3;

  const switchSnowfall = (on: boolean) => {
    goToSettings();
    // the switch is locked until the stored effects are in
    cy.get(snowfallSwitch).should('not.be.disabled').and('have.attr', 'aria-checked', on ? 'false' : 'true');
    cy.get(snowfallSwitch).click();
    saveAndExpect('PATCH', '/api/settings/effects', 'saveSnowfall', effectsCard);
    cy.get('@saveSnowfall').its('request.body').should('deep.equal', { snowfall: on });
  };

  before(() => {
    cy.addFirstUserAPI(Cypress.expose('username'), Cypress.expose('password'))
      .its('status').should('equal', 201);
    login(Cypress.expose('username'), Cypress.expose('password'));
  });

  // The settings outlast the reset before each spec: the next spec starts without snow.
  after(() => {
    cy.loginAPI(Cypress.expose('username'), Cypress.expose('password')).then(session => {
      cy.patchSettingEffectsAPI({ snowfall: false }, session.body.accessToken)
        .its('status').should('equal', 200);
    });
  });

  it('lets snow fall on the start page once switched on', () => {
    switchSnowfall(true);
    logout();
    cy.get(snowfall).find('.flake').should('have.length.greaterThan', 0);
  });

  it('stops the snow once switched off', () => {
    login(Cypress.expose('username'), Cypress.expose('password'));
    switchSnowfall(false);
    // the start page begins without snow: only after its own answer does "no snow" say anything
    cy.intercept('GET', '/api/settings/effects').as('startPageEffects');
    logout();
    cy.wait('@startPageEffects').its('response.body.snowfall').should('equal', false);
    cy.get('[data-cy="home-user-name"]').should('exist');
    cy.get(snowfall).should('not.exist');
  });
});
