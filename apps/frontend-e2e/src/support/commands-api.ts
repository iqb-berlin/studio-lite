import {
  UserData, GroupData, WsData, AccessLevel
} from './testData';

// 1
Cypress.Commands.add('addFirstUserAPI', (username: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/init-login',
    headers: {
      'app-version': Cypress.env('version')
    },
    body: {
      username: username,
      password: password
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
Cypress.Commands.add('getUserIdAPI', (token: string) => {
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
  const authorization = `bearer ${token}`;
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
// 5
Cypress.Commands.add('keycloakAPI', (user:UserData) => {
  cy.request({
    method: 'POST',
    url: '/api/keycloak-login',
    headers: {
      'app-version': Cypress.env('version')
    },
    body: {
      description: '',
      email: `${user.username}@hu-berlin.com`,
      firstName: `${user.username}`,
      identity: `${user.username}`,
      isAdmin: `${user.isAdmin}`,
      issuer: 'https://www.iqb-login.de/realms/iqb',
      lastName: `${user.username}`,
      name: `${user.username}`,
      password: ''
    },
    failOnStatusCode: false
  });
});

// 6
Cypress.Commands.add('createUserAPI', (userData:UserData, token:string) => {
  const authorization = `bearer ${token}`;
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

// 7.
Cypress.Commands.add('getUsersFullAPI',
  (token: string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'GET',
      url: '/api/admin/users/full',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      failOnStatusCode: false
    });
  });

// 8
Cypress.Commands.add('getUserAPI',
  (id:string, token:string) => {
    const authorization = `bearer ${token}`;
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

// 9
Cypress.Commands.add('getUserNoIdAPI',
  (token:string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'GET',
      url: '/api/admin/users',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      failOnStatusCode: false
    });
  });

// 10
Cypress.Commands.add('updateUserAPI',
  (user:UserData, credentials: boolean, token:string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'PATCH',
      url: '/api/admin/users',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: {
        id: `${Cypress.env(`id_${user.username}`)}`,
        name: `${user.username}`,
        isAdmin: `${credentials}`
      },
      failOnStatusCode: false
    });
  });

// 11
Cypress.Commands.add('deleteUserNoIdAPI',
  (id:string, token:string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'DELETE',
      url: `/api/admin/users?id=${id}`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      failOnStatusCode: false
    });
  });

// 12
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

// 13
Cypress.Commands.add('getGroupByIdAPI', (groupId: string, token:string) => {
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

// 14
Cypress.Commands.add('getGroupAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/admin/workspace-groups',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 15 Not used because we use request to simulate the command
// Cypress.Commands.add('updateGroupAPI', (token:string) => {
//   const authorization = `bearer ${token}`;
//   cy.request({
//     method: 'PATCH',
//     url: '/api/admin/workspace-groups/',
//     headers: {
//       'app-version': Cypress.env('version'),
//       authorization
//     },
//     body: {
//       id: `${Cypress.env('id_group1')}`,
//       name: 'VERA2024'
//     },
//     failOnStatusCode: false
//   });
// });

// 16
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

// 16
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

// 16a
Cypress.Commands.add('setAdminsOfGroupAPI', (userIds: string[], groupId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/admin/workspace-groups/${groupId}/admins`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: userIds,
    failOnStatusCode: false
  });
});

// 17
Cypress.Commands.add('getAdminOfGroupAPI', (groupId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/workspace-groups/${groupId}/admins`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
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

// 17
Cypress.Commands.add('getWsAPI', (wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/workspaces/${wsId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
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

// 23
Cypress.Commands.add('setGroupFromAdminsAPI', (userIds: string[], groupId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/admin/workspace-groups/${groupId}/admins`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: userIds,
    failOnStatusCode: false
  });
});

// Cypress.Commands.add('', () => {});
// Cypress.Commands.add('', () => {});
// Cypress.Commands.add('', () => {});
// Cypress.Commands.add('', () => {});

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
// 60
Cypress.Commands.add('deleteUserAPI', (id: string, token: string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'DELETE',
    url: `/api/admin/users/${id}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 400 Bad Request
// 401 Unauthorized
// 403 Forbidden
// 404 Not found
// 405 Method not allowed
// 406 Not acceptable
// 408 Request Timeout
// 429 Too Many Requests
// 500 Internal Server Error
// 502: Bad Gateway
// 504: Gateway timeout