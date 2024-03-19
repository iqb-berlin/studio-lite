import { clickButtonToAccept, visitLoginPage } from '../../support/util';
import { adminData } from '../../support/config/userdata';

describe('Admin first test', () => {
  beforeEach(visitLoginPage);
  it('Create the superadmin', () => {
    cy.get('input[placeholder="Anmeldename"]')
      .should('exist')
      .clear()
      .type(adminData.user_name);
    cy.get('input[placeholder="Kennwort"]')
      .should('exist')
      .clear()
      .type(adminData.user_pass);
    clickButtonToAccept('Weiter');
    cy.wait(400);
    visitLoginPage();
    cy.get('mat-icon:contains("account_box")')
      .click();
    cy.get('span:contains("Abmelden")')
      .should('exist')
      .click();
    cy.wait(400);
    clickButtonToAccept('Abmelden');
  });
});
