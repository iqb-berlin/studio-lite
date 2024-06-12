import { getAppTitle } from '../../support/app.po';
import {
  clickButtonToAccept, deleteUser
} from '../../support/util/util';

describe('api-login', () => {
  beforeEach(() => cy.visit('/'));

  it('should display application title', () => {
    // Custom command example, see `../support/commands.ts` file
    // cy.login('my-email@something.com', 'myPassword');

    // Function helper example, see `../support/app.po.ts` file
    getAppTitle().contains('IQB-Studio');
  });
  it('The connection with the database works', () => {
    cy.get('input[placeholder="Anmeldename"]')
      .should('exist')
      .clear()
      .type('admin');
    cy.get('input[placeholder="Kennwort"]')
      .should('exist')
      .clear()
      .type('1234');
    clickButtonToAccept('Weiter');
    cy.visit('/');
    deleteUser('admin');
    cy.visit('/');
    cy.get('mat-icon:contains("account_box")')
      .eq(0)
      .should('exist')
      .click();
    cy.get('span:contains("Abmelden")')
      .should('exist')
      .click();
    cy.wait(400);
    clickButtonToAccept('Abmelden');
  });
});
