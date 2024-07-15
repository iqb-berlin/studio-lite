Cypress.Commands.add('addModuleAPI', (module:string) => {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.readFile(`../frontend-e2e/src/fixtures/${module}`)
    .then(aspect => {
      cy.request({
        method: 'POST',
        url: '/api/admin/verona-modules',
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          aspect
        }
      });
    });
});
