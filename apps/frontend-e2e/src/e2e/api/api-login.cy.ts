import { getAppTitle } from '../../support/app.po';

describe('api-login', () => {
  beforeEach(() => cy.visit('/'));

  it('should display application title', () => {
    // Custom command example, see `../support/commands.ts` file
    // cy.login('my-email@something.com', 'myPassword');

    // Function helper example, see `../support/app.po.ts` file
    getAppTitle().contains('IQB-Studio');
  });
});
