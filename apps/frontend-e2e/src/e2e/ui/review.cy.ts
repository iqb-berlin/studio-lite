import { createBasicSpecCy } from './shared/basic.spec.cy';

describe('Review:', () => {
  before(() => {
    cy.runUntracked(() => {
      createBasicSpecCy();
    });
  });

  it('create a review', () => {

  });

});
