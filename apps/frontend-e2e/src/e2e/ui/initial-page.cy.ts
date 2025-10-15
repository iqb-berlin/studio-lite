import { isButtonClickable } from '../../support/app.po';

describe('UI check: initial page', () => {
  const homeUserName = '[data-cy="home-user-name"]';
  const homePassword = '[data-cy="home-password"]';
  const submitBottom = '[data-cy="home-submit"]';
  const homeImprintBottom = '[data-cy="home-imprint"]';
  const homeBottom = '[data-cy="home-home-page"]';

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
    cy.get(submitBottom).should('exist');
  });

  it('should have submit bottom not clickable if the username and pass if not filled', () => {
    isButtonClickable(submitBottom).then(isClickable => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(isClickable).to.be.false;
    });
  });

  it('should have submit bottom clickable', () => {
    cy.get(homeUserName).type('fuser');
    cy.get(homePassword).type('pass');
    isButtonClickable(submitBottom).then(isClickable => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(isClickable).to.be.true;
    });
    cy.get(homeUserName).should('exist');
    cy.get(homeUserName).clear();
    cy.get(homePassword).should('exist');
    cy.get(homePassword).clear();
  });

  it('should have legal notice and privacy policy bottom, and it should be clickable', () => {
    cy.get(homeImprintBottom).should('exist');
    isButtonClickable(homeImprintBottom).then(isClickable => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(isClickable).to.be.true;
    });

    cy.get(homeUserName).clear();
  });

  it('should click the legacy bottom, and click the return bottom', () => {
    cy.get(homeImprintBottom).click();
    isButtonClickable(homeBottom).then(isClickable => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(isClickable).to.be.true;
    });

    cy.get(homeBottom).click();
  });
});
