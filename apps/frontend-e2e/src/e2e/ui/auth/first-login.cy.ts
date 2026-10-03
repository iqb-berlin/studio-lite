import { addFirstUser, deleteFirstUser } from '../../../support/helpers';

/**
 * Until the app has loaded its config it assumes there are users, so a login sent in that window
 * goes to /api/login instead of /api/init-login. On a cold API -- the first spec of a CI job -- the
 * config answers late, and the first login of a spec waited in vain for its init-login (#1754).
 * The delay here stands in for that slow answer.
 */
describe('First login', () => {
  let delayConfig = true;

  after(() => {
    deleteFirstUser();
  });

  it('should create the first user even when the config answers late', () => {
    cy.intercept('GET', '/api/admin/settings/config', req => {
      if (!delayConfig) return;
      req.on('response', res => {
        res.setDelay(4000);
      });
    });
    addFirstUser();
    cy.then(() => {
      delayConfig = false;
    });
  });
});
