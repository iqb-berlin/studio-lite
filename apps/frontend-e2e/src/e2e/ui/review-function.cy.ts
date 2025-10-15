import {
  createBasicSpecCy,
  createExercisesSpec,
  deleteBasicSpecCy
} from './shared/basic.spec.cy';

describe('Review:', () => {
  before(() => {
    Cypress._.noop(createBasicSpecCy());
  });

  after(() => {
    Cypress._.noop(deleteBasicSpecCy());
  });

  it('create a review', () => {
    createExercisesSpec();
  });

  it('', () => {

  });
});
