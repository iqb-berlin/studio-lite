import {
  goToSettings, saveAndExpect, login, logout
} from '../../../support/helpers';

// An administrator lets snow fall on the start page and stops it again, in the settings.
describe('Snow on the start page', () => {
  const snowfallSwitch = '[data-cy="admin-app-config-snowfall"]';
  const snowfall = '[data-cy="home-snowfall"]';

  const switchSnowfall = (on: boolean) => {
    goToSettings();
    cy.get(snowfallSwitch).find('input[type="checkbox"]').should(on ? 'not.be.checked' : 'be.checked');
    cy.get(snowfallSwitch).find('label').click();
    saveAndExpect('PATCH', '/api/settings/config', 'saveSnowfall', 0);
    cy.get('@saveSnowfall').its('request.body.snowfall').should('equal', on);
  };

  before(() => {
    cy.addFirstUserAPI(Cypress.expose('username'), Cypress.expose('password'))
      .its('status').should('equal', 201);
    login(Cypress.expose('username'), Cypress.expose('password'));
  });

  // The settings outlast the reset before each spec: the next spec starts without snow, with the rest
  // of the config as it was. The PATCH replaces the whole config.
  after(() => {
    cy.loginAPI(Cypress.expose('username'), Cypress.expose('password')).then(session => {
      const token: string = session.body.accessToken;
      cy.getSettingConfigAPI(token).then(config => {
        cy.patchSettingConfigAPI({ ...config.body, snowfall: false }, token)
          .its('status').should('equal', 200);
      });
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
    logout();
    cy.get('[data-cy="home-user-name"]').should('exist');
    cy.get(snowfall).should('not.exist');
  });
});
