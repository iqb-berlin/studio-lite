import { Context } from 'mocha';

// eslint-disable-next-line func-names
afterEach(function (this: Context) {
  if (this.currentTest?.state === 'failed') {
    Cypress.env('cancelled', 'cancelled');
    Cypress.stop();
    // eslint-disable-next-line no-useless-return
    return;
  }
});
