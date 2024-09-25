// @ts-check
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../global.d.ts" />


// 33
Cypress.Commands.add('deleteUnitAPI', (idUnit: string, idGroup:string) => {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  return cy.request({
    method: 'DELETE',
    url: `/api/workspace/${idGroup}/${idUnit}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});
