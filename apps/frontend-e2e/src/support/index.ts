import { Context } from 'mocha';

afterEach(function (this: Context) {
  if (this.currentTest?.state === 'failed') {
    Cypress.stop();
  }
});
