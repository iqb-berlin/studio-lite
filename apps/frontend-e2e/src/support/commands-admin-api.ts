import {
  AccessLevel, GroupData, UserData, WsData
} from './testData';

// 25

// 18
Cypress.Commands.add('createUserAPI', (userData:UserData) => {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'POST',
    url: '/api/admin/users',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      name: `${userData.username}`,
      password: `${userData.password}`,
      isAdmin: `${userData.isAdmin}`
    },
    failOnStatusCode: false
  });
});

// 1
Cypress.Commands.add('createGroupAPI', (group:GroupData, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'POST',
    url: '/api/admin/workspace-groups',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      name: `${group.name}`,
      setting: {}
    },
    failOnStatusCode: false
  });
});

// 6
Cypress.Commands.add('createWsAPI', (groupKey: string, ws1:WsData, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'POST',
    url: `/api/admin/workspaces/${groupKey}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      groupId: `${groupKey}`,
      name: `${ws1.name}`
    },
    failOnStatusCode: false
  });
});

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
