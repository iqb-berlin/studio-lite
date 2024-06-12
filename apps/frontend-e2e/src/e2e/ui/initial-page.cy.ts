import { getAppTitle, isButtonClickable } from '../../support/app.po';

describe('UI check: initial page', () => {
  beforeEach(() => cy.visit('/'));

  it('should display application title', () => {
    // Custom command example, see `../support/commands.ts` file
    cy.login('my-email@something.com', 'myPassword');

    // Function helper example, see `../support/app.po.ts` file
    getAppTitle().contains('IQB-Studio');
  });

  it('should have a field to introduce the username', () => {
    cy.get('input[placeholder="Anmeldename"]')
      .should('exist');
  });

  it('should be editable the input field for username', () => {
    cy.get('input[placeholder="Anmeldename"]')
      .type('user')
      .should('have.value', 'user');
    cy.get('input[placeholder="Anmeldename"]')
      .clear();
  });

  it('should have a field to introduce the password', () => {
    cy.get('input[placeholder="Kennwort"]')
      .should('exist');
  });

  it('should be editable the input field for password', () => {
    cy.get('input[placeholder="Kennwort"]')
      .type('pass')
      .should('have.value', 'pass');
    cy.get('input[placeholder="Kennwort"]')
      .clear();
  });

  it('should have submit bottom', () => {
    cy.get('button')
      .contains('Weiter')
      .should('exist');
  });

  it('should have submit bottom is not clickable if the username and pass if not filled', () => {
    const buttonSelector = '[data-cy="home-submit"]';
    isButtonClickable(buttonSelector).then(isClickable => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(isClickable).to.be.false;
    });
  });

  it('should have submit bottom is clickable', () => {
    cy.get('input[placeholder="Anmeldename"]')
      .type('user');
    cy.get('input[placeholder="Kennwort"]')
      .type('pass');
    const buttonSelector = '[data-cy="home-submit"]';

    isButtonClickable(buttonSelector).then(isClickable => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(isClickable).to.be.true;
    });
    cy.get('input[placeholder="Anmeldename"]')
      .should('exist');
    cy.get('input[placeholder="Anmeldename"]')
      .clear();
    cy.get('input[placeholder="Kennwort"]')
      .should('exist');
    cy.get('input[placeholder="Kennwort"]')
      .clear();
  });

  it('should be present open ID connector', () => {
    cy.get('[data-cy="alternative-login"]')
      .should('exist');
  });

  it('should be able to link with open ID connector ', () => {
    cy.get('[data-cy="alternative-login"]')
      .click();
    cy.get('studio-lite-login-alternative-warning')
      .should('exist');
    cy.get('span:contains("Schließen")')
      .should('exist')
      .click();
  });
});
