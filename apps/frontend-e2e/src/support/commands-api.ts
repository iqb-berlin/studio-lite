import {
  UserData, GroupData, WsData, AccessLevel
} from './testData';

// 1
Cypress.Commands.add('addFirstUserAPI', () => {
  cy.request({
    method: 'POST',
    url: '/api/init-login',
    headers: {
      'app-version': Cypress.env('version')
    },
    body: {
      username: Cypress.env('username'),
      password: Cypress.env('password')
    },
    failOnStatusCode: false
  });
});

// 2
Cypress.Commands.add('loginAPI', (username: string, password:string) => {
  cy.request({
    method: 'POST',
    url: '/api/login',
    headers: {
      'app-version': Cypress.env('version')
    },
    body: {
      username: `${username}`,
      password: `${password}`
    },
    failOnStatusCode: false
  });
});

// 3
Cypress.Commands.add('getUserIdAPI', (username: string, token: string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/auth-data',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 4
Cypress.Commands.add('updatePasswordAPI', (token: string, oldPass: string, newPass:string) => {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'PATCH',
    url: '/api/password',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      oldPassword: oldPass,
      newPassword: newPass
    },
    failOnStatusCode: false
  });
});

// 6
Cypress.Commands.add('deleteUserAPI', (id: string) => {
  const authorization = `bearer ${Cypress.env(`token_${Cypress.env('username')}`)}`;
  cy.request({
    method: 'DELETE',
    url: `/api/admin/users/${id}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    expect(resp.status).to.equal(200);
  });
});

// 7
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

// 8.
Cypress.Commands.add('getUsersFullAPI',
  () => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    cy.request({
      method: 'GET',
      url: '/api/admin/users/full',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      }
    });
  });

// 9
Cypress.Commands.add('getUserAPI',
  (id:string) => {
    const authorization = `bearer ${Cypress.env('token_admin')}`;
    cy.request({
      method: 'GET',
      url: `/api/admin/users/${id}`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      failOnStatusCode: false
    });
  });

// 10
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

// 11
Cypress.Commands.add('setAdminOfGroupAPI', (userId: string, groupId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/admin/workspace-groups/${groupId}/admins`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: [
      userId
    ],
    failOnStatusCode: false
  });
});
// 12
Cypress.Commands.add('createWsAPI', (groupId: string, ws:WsData, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'POST',
    url: `/api/admin/workspaces/${groupId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      groupId: `${groupId}`,
      name: `${ws.name}`
    },
    failOnStatusCode: false
  });
});

// 13
Cypress.Commands.add('moveWsAPI', (ws:string, newGroup: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/admin/workspaces/${ws}/${newGroup}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 14
Cypress.Commands.add('deleteWsAPI', (ws:string, group: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/admin/workspaces/${ws}/${group}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 16
Cypress.Commands.add('getGroupAPI', (groupId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/workspace-groups/${groupId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 17
Cypress.Commands.add('getWsAPI', (wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/workspaces/${wsId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  });
});

// 18
Cypress.Commands.add('updateUsersOfWsAPI', (wsId:string, level:AccessLevel, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/admin/workspaces/${wsId}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: [
      {
        accessLevel: `${level}`,
        id: Cypress.env(`id_${Cypress.env('username')}`)
      }
    ],
    failOnStatusCode: false
  });
});

// 19
Cypress.Commands.add('getUsersOfWsAPI', (wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/workspaces/${wsId}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  });
});

// 20 Not used because we use request to simulate the command
Cypress.Commands.add('updateGroupAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: '/api/admin/workspace-groups/',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      id: `${Cypress.env('id_group1')}`,
      name: 'VERA2024'
    },
    failOnStatusCode: false
  });
});

// 21 Not used because we use request to simulate the command
Cypress.Commands.add('updateWsAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: '/api/admin/workspaces/',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      id: `${Cypress.env('id_ws1')}`,
      name: 'NewVorlage'
    },
    failOnStatusCode: false
  });
});

// 40
Cypress.Commands.add('deleteGroupAPI', (id: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'DELETE',
    url: `/api/admin/workspace-groups/${id}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 110 and 6 is the same
Cypress.Commands.add('deleteFirstUserAPI', () => {
  const authorization = `bearer ${Cypress.env(`token_${Cypress.env('username')}`)}`;
  cy.request({
    method: 'DELETE',
    url: `/api/admin/users/${Cypress.env(`id_${Cypress.env('username')}`)}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});
