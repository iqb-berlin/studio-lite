import {
  UserData, GroupData, WsData, AccessLevel, UnitData, WsSettings, AccessUser
} from './testData';

// General
Cypress.Commands.add('runAndIgnore', (testFn: () => void) => {
  testFn();
  throw new Error('Skipping test count');
});
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
    const nu = parseInt(`${Cypress.env(`id_${user.username}`)}`, 10);
    console.log(nu);
    cy.request({
      method: 'PATCH',
      url: '/api/admin/users',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: {
        id: nu,
        isAdmin: credentials
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

// 18
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

// 19
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

// 20
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

// 21
Cypress.Commands.add('updateUsersOfWsAPI', (wsId:string, level:AccessLevel,
                                            userId: string, token:string) => {
  // TODO use a string list as parameters instead of a string for userId
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
        id: `${userId}`
      }
    ],
    failOnStatusCode: false
  });
});
// 21a
Cypress.Commands.add(
  'updateUserListOfWsAPI',
  (wsId: string, l: AccessUser[], token: string) => {
    const authorization = `bearer ${token}`;
    // const num = l.length;
    // let addText: string;
    // addText =
    //   '{\n' +
    //   ` accessLevel: '${l[0].access}',\n` +
    //   ` id: '${l[0].id}'\n` +
    //   '}';
    //
    // for (let i = 1; i < num; i++) {
    //   addText =
    //     `${addText},{\n` +
    //     ` accessLevel: '${l[i].access}',\n` +
    //     ` id: '${l[i].id}'\n` +
    //     '}';
    // }
    // console.log(addText);
    cy.request({
      method: 'PATCH',
      url: `/api/admin/workspaces/${wsId}/users`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: [
        {
          accessLevel: `${l[0].access}`,
          id: `${l[0].id}`
        },
        {
          accessLevel: `${l[1].access}`,
          id: `${l[1].id}`
        }
      ],
      failOnStatusCode: false
    });
  }
);
// 22
Cypress.Commands.add('getUsersOfWsAdminAPI', (wsId: string, userId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/workspaces/${wsId}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 23
Cypress.Commands.add('getWsGroupwiseAPI', (token: string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/admin/workspaces/groupwise',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 24 Not used because we use request to simulate the command
Cypress.Commands.add('updateWsAPI', (ws:WsData, group:GroupData, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: '/api/admin/workspaces/',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      id: `${Cypress.env(ws.id)}`,
      name: `${ws.name}`,
      groupId: `${Cypress.env(group.id)}`,
      groupName: `${group.name}`
    },
    failOnStatusCode: false
  });
});
// 25
// Cypress.Commands.add('addModuleAPI', (module:string) => {
//   const authorization = `bearer ${Cypress.env('token_admin')}`;
//   cy.readFile(`../frontend-e2e/src/fixtures/${module}`)
//     .then(aspect => {
//       const bodyToSend = {
//         aspect
//       };
//       cy.request({
//         method: 'POST',
//         url: '/api/admin/verona-modules',
//         headers: {
//           'app-version': Cypress.env('version'),
//           authorization
//         },
//         body: bodyToSend
//       });
//     });
// });

// 26
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

// 27
Cypress.Commands.add('getModuleAPI', (module:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/verona-module/${module}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 28
Cypress.Commands.add('downloadModuleAPI', (module:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/verona-modules/download/${module}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 29
Cypress.Commands.add('deleteModuleAPI', (module:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'DELETE',
    url: `/api/admin/verona-modules/${module}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 30
Cypress.Commands.add('createUnitAPI', (wsId:string, unit: UnitData, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'POST',
    url: `/api/workspace/${wsId}/units`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      key: `${unit.shortname}`,
      name: `${unit.name}`
    },
    failOnStatusCode: false
  });
});

// 31
Cypress.Commands.add('getUnitsByWsGAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/admin/workspace-groups/units',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 32
Cypress.Commands.add('updateWsSettings', (wsId:string, settings:WsSettings, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/workspace/${wsId}/settings`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: `${settings}`,
    failOnStatusCode: false
  });
});

// 33
Cypress.Commands.add('getWsNormalAPI', (wsId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspace/${wsId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 34
Cypress.Commands.add('getUsersByWsIdAPI', (wsId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspace/${wsId}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 42
Cypress.Commands.add('getUnitsByWsAPI', (wsId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspace/${wsId}/units`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 43 similar to 22 but with no admin
Cypress.Commands.add('getUsersOfWsAPI', (wsId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspace/${wsId}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});
// 44
Cypress.Commands.add('downloadWsAPI', (wsId:string, settings: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspace/${wsId}/download/${settings}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

//
// // 34
// Cypress.Commands.add('getGroupsByWsIdAPI', (wsId:string, token:string) => {
//   const authorization = `bearer ${token}`;
//   cy.request({
//     method: 'GET',
//     url: `/api/workspace/${wsId}/groups`,
//     headers: {
//       'app-version': Cypress.env('version'),
//       authorization
//     },
//     failOnStatusCode: false
//   });
// });

// 50
Cypress.Commands.add('deleteUnitAPI', (unitId:string, wsId:string, token: string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'DELETE',
    url: `/api/workspace/${wsId}/${unitId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 77
Cypress.Commands.add('getWsByUserAPI', (userId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/users/${userId}/workspaces`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 78
Cypress.Commands.add('getGroupsByUserAPI', (userId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/users/${userId}/workspace-groups`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// Use not found
// Cypress.Commands.add('updateGroupsByUserAPI', (userId:string, token:string) => {
//   const authorization = `bearer ${token}`;
//   cy.request({
//     method: 'PATCH',
//     url: `/api/admin/users/${userId}/workspace-groups`,
//     headers: {
//       'app-version': Cypress.env('version'),
//       authorization
//     },
//     failOnStatusCode: false
//   });
// });

// 79
Cypress.Commands.add('deleteWsAPI', (ws:string, group: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'DELETE',
    url: `/api/admin/workspaces/${ws}/${group}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 80
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
