import { addFirstUserAPI, deleteFirstUserAPI } from '../../support/utilAPI';

describe.skip('API verona-modules', () => {
  before(() => addFirstUserAPI());
  after(() => deleteFirstUserAPI());
  it('API example', () => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    cy.request({
      method: '',
      url: '/api/',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      }
    }).then(resp => {
      expect(resp.status).to.equal(200);
    });
  });
});
