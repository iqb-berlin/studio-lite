// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    // eslint-disable-next-line
    getWs(id:string): Chainable<Response<any>>;
  }
}
Cypress.Commands.add('getWs',
  (id:string) => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    cy.request({
      method: 'GET',
      url: `/api/admin/users/${id}/workspaces`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      failOnStatusCode: false
    });
  });
