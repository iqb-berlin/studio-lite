import {
  AccessLevel
} from './testData';

// 25

// 6

// 13
Cypress.Commands.add('updateUsersOfWsAPI', (wsKey:string, level:AccessLevel, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/admin/workspaces/${wsKey}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: [
      {
        accessLevel: `${level}`,
        id: Cypress.env('id_admin')
      }
    ],
    failOnStatusCode: false
  });
});
