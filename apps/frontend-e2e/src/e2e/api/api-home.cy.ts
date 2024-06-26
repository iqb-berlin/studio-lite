import { addFirstUserAPI, deleteFirstUserAPI } from '../../support/utilAPI';

describe('HOME', () => {
  before(() => addFirstUserAPI());
  after(() => deleteFirstUserAPI());
  it('my-data: retrieve user data', () => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    cy.request({
      method: 'GET',
      url: '/api/my-data',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      }
    }).then(resp => {
      expect(resp.status).to.equal(200);
    });
  });

  it('my-data: modify user data', () => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    cy.request({
      method: 'GET',
      url: '/api/auth-data',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      }
    }).then(resp => {
      Cypress.env('id_admin', resp.body.userId);
      expect(resp.status).to.equal(200);
      const nu = parseInt(Cypress.env('id_admin'), 10);
      cy.request({
        method: 'PATCH',
        url: '/api/my-data',
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          id: nu,
          description: '',
          email: 'first@email.com',
          lastName: 'First',
          firstName: '',
          emailPublishApproved: false
        }
      }).then(resp1 => {
        expect(resp1.status).to.equal(200);
      });
    });
  });
});
