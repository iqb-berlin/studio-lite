/// <reference types="cypress" />
import { getAppTitle } from '../../../support/app.po';

describe('Application', () => {
  beforeEach(() => cy.visit('/'));

  it('displays IQB-Studio title', () => {
    // Custom command example, see `../support/commands.ts` file
    // cy.login('my-email@something.com', 'myPassword');

    // Function helper example, see `../support/app.po.ts` file
    getAppTitle().contains('IQB-Studio');
  });
});
