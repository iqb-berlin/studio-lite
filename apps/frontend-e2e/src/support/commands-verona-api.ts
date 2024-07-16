Cypress.Commands.add('addModuleAPI', (module:string) => {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.readFile(`../frontend-e2e/src/fixtures/${module}`)
    .then(aspect => {
      const bodyToSend = {
        aspect
      };
      cy.request({
        method: 'POST',
        url: '/api/admin/verona-modules',
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: bodyToSend
      });
    });
});

Cypress.Commands.add('getModulesAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/verona-modules',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});
