describe('HOME', () => {
  it('my-data: retrieve user data', () => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    cy.request({
      method: 'GET',
      url: 'http://localhost:4200/api/my-data',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      }
    }).then(resp => {
      expect(resp.status).to.equal(200);
    });
  });

  it('verona: modify user data', () => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    const id: number = parseInt(Cypress.env('adminID'), 10);
    cy.request({
      method: 'PATCH',
      url: 'http://localhost:4200/api/my-data',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: {
        id: id,
        lastName: 'First'
      }
    })
      .then(resp => {
        expect(resp.status)
          .to
          .equal(200);
      });
  });
});
