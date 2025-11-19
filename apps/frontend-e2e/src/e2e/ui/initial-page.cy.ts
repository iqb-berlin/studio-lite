import { isButtonClickable } from '../../support/app.po';

describe('UI check: initial page', () => {
  const homeUserName = '[data-cy="home-user-name"]';
  const homePassword = '[data-cy="home-password"]';
  const submitButton = '[data-cy="home-submit-button"]';
  const homeImprintButton = '[data-cy="home-imprint-button"]';
  const homeButton = '[data-cy="home-button"]';

  beforeEach(() => cy.visit('/'));

  it('should have a field to introduce the username', () => {
    cy.get(homeUserName).should('exist');
  });

  it('should be editable the input field for username', () => {
    cy.get(homeUserName).type('fuser')
      .should('have.value', 'fuser');
    cy.get(homeUserName).clear();
  });

  it('should have a field to introduce the password', () => {
    cy.get(homePassword).should('exist');
  });

  it('should be editable the input field for password', () => {
    cy.get(homePassword)
      .type('pass')
      .should('have.value', 'pass');
    cy.get(homePassword).clear();
  });

  it('should have submit bottom', () => {
    cy.get(submitButton).should('exist');
  });

  it('should have submit bottom not clickable if the username and pass if not filled', () => {
    isButtonClickable(submitButton).then(isClickable => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(isClickable).to.be.false;
    });
  });

  it('should have submit bottom clickable', () => {
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

  it('should have legal notice and privacy policy bottom, and it should be clickable', () => {
    cy.get(homeImprintButton).should('exist');
    isButtonClickable(homeImprintButton).then(isClickable => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(isClickable).to.be.true;
    });

    cy.get(homeUserName).clear();
  });

  it('should click the legacy bottom, and click the return bottom', () => {
    cy.get(homeImprintButton).click();
    isButtonClickable(homeButton).then(isClickable => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(isClickable).to.be.true;
    });

    cy.get(homeButton).click();
  });
});
