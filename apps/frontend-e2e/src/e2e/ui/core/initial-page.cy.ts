import { isButtonClickable } from '../../../support/app.po';

describe('Login Page', () => {
  const homeUserName = '[data-cy="home-user-name"]';
  const homePassword = '[data-cy="home-password"]';
  const submitButton = '[data-cy="home-submit-button"]';
  const homeImprintButton = '[data-cy="home-imprint-button"]';
  const homeButton = '[data-cy="home-button"]';

  beforeEach(() => cy.visit('/'));

  it('displays username input field', () => {
    cy.get(homeUserName).should('exist');
  });

  it('allows editing username field', () => {
    cy.get(homeUserName).type('fuser')
      .should('have.value', 'fuser');
    cy.get(homeUserName).clear();
  });

  it('displays password input field', () => {
    cy.get(homePassword).should('exist');
  });

  it('allows editing password field', () => {
    cy.get(homePassword)
      .type('pass')
      .should('have.value', 'pass');
    cy.get(homePassword).clear();
  });

  it('displays submit button', () => {
    cy.get(submitButton).should('exist');
  });

  it('disables submit button when fields are empty', () => {
    isButtonClickable(submitButton).then(isClickable => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(isClickable).to.be.false;
    });
  });

  it('enables submit button when fields are filled', () => {
    cy.get(homeUserName).type('fuser');
    cy.get(homePassword).type('pass');
    isButtonClickable(submitButton).then(isClickable => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(isClickable).to.be.true;
    });
    cy.get(homeUserName).should('exist');
    cy.get(homeUserName).clear();
    cy.get(homePassword).should('exist');
    cy.get(homePassword).clear();
  });

  it('displays clickable imprint button', () => {
    cy.get(homeImprintButton).should('exist');
    isButtonClickable(homeImprintButton).then(isClickable => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(isClickable).to.be.true;
    });

    cy.get(homeUserName).clear();
  });

  it('navigates to imprint page and back', () => {
    cy.get(homeImprintButton).click();
    isButtonClickable(homeButton).then(isClickable => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(isClickable).to.be.true;
    });

    cy.get(homeButton).click();
  });
});
