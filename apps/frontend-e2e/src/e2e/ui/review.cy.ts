import { createBasicSpecCytog } from './shared/basic-together.spec.cy';

describe('Review:', () => {
  before(() => {
    cy.runUntracked(() => {
      cy.log('Hago 11');
      createBasicSpecCytog();
      cy.log('Hago 1');
    });
  });

  it('create a review', () => {

  });
});
