import {
  UserData,
  GroupData,
  WsData,
  AccessLevel,
  UnitData,
  WsSettings,
  AccessUser,
  CommentData,
  ReviewData,
  MyData,
  DefinitionUnit, CopyUnit
} from './testData';
import { UnitExport } from '../e2e/api/api-settings.cy';

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
  const isAdmin = userData.isAdmin;
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
      isAdmin: isAdmin
    },
    failOnStatusCode: false
  });
});

// 7.
Cypress.Commands.add('getUsersFullAPI',
  (full: boolean, token: string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'GET',
      url: `/api/group-admin/users?full=${full}`,
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
      url: `/api/admin/users/${id}/workspace-groups`,
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
      url: '/api/group-admin/users',
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
    url: `/api/group-admin/workspaces/${groupId}`,
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
    url: `/api/group-admin/workspaces/${ws}/${newGroup}`,
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
    url: `/api/group-admin/workspaces/${wsId}`,
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
    url: `/api/group-admin/workspaces/${wsId}/users`,
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
      url: `/api/group-admin/workspaces/${wsId}/users`,
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
    url: `/api/group-admin/workspaces/${wsId}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 23
// TODO: Endpoint is removed
// Cypress.Commands.add('getWsGroupwiseAPI', (token: string) => {
//   const authorization = `bearer ${token}`;
//   cy.request({
//     method: 'GET',
//     url: '/api/admin/workspaces/groupwise',
//     headers: {
//       'app-version': Cypress.env('version'),
//       authorization
//     },
//     failOnStatusCode: false
//   });
// });

// 24 Not used because we use request to simulate the command
Cypress.Commands.add('updateWsAPI', (ws:WsData, group:GroupData, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: '/api/group-admin/workspaces/',
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
// TODO: Moved and changed
// Cypress.Commands.add('downloadModuleAPI', (module:string, token:string) => {
//   const authorization = `bearer ${token}`;
//   cy.request({
//     method: 'GET',
//     url: `/api/admin/verona-modules/${module}`,
//     headers: {
//       'app-version': Cypress.env('version'),
//       authorization
//     },
//     failOnStatusCode: false
//   });
// });

// 30
Cypress.Commands.add('createUnitAPI', (wsId:string, unit: UnitData, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'POST',
    url: `/api/workspaces/${wsId}/units`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      key: `${unit.shortname}`,
      name: `${unit.name}`,
      groupName: `${unit.group}`
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
    url: `/api/workspaces/${wsId}/settings`,
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
    url: `/api/workspaces/${wsId}`,
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
    url: `/api/workspaces/${wsId}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 40
Cypress.Commands.add('getUnitMetadataAPI', (wsId:string, unitId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/units/${unitId}/metadata`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 41
Cypress.Commands.add(
  'updateUnitMetadataAPI',
  (wsId: string, unitId: string, profile:string, entry: DefinitionUnit, token: string) => {
    // console.log(entry);
    // eslint-disable-next-line max-len
    // const jsonObj = JSON.parse('[{"id":"a1","label":[{"lang":"de","value":"Für SPF geeignet"}],"value":"false","valueAsText":{"lang":"de","value":"ja"}},{"id":"iqb_phones","label":[{"lang":"de","value":"Kopfhörer"}],"value":[],"valueAsText":[]},{"id":"w8","label":[{"lang":"de","value":"Leitidee"}],"value":[],"valueAsText":[]},{"id":"iqb_author","label":[{"lang":"de","value":"Entwickler:in"}],"value":[{"lang":"de","value":"Ana Maier"}],"valueAsText":[{"lang":"de","value":"Ana Maier"}]}]');
    // metadata: {
    //   profiles: [{
    //     entries: `${jsonObj}`,
    //     profileId: `${profile}`,
    //     isCurrent: true
    //   }]
    // }
    const authorization = `bearer ${token}`;
    const nu = parseInt(`${unitId}`, 10);
    cy.request({
      method: 'PATCH',
      url: `/api/workspaces/${wsId}/units/${unitId}/metadata`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: {
        id: nu,
        groupName: `${entry.groupName}`
      },
      failOnStatusCode: false
    });
  }
);

// 42
Cypress.Commands.add('getUnitsByWsAPI', (wsId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/units`,
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
    url: `/api/workspaces/${wsId}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 50
Cypress.Commands.add('moveToAPI', (wsOriginId:string, wsDestinyId: string, unitId:string, token:string) => {
  // TO DO replace the unitId by an ids array
  const authorization = `bearer ${token}`;
  const nu = parseInt(`${wsDestinyId}`, 10);
  const unitIdNumber = parseInt(`${unitId}`, 10);
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsOriginId}/units/move`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      targetWorkspace: nu,
      units: [unitIdNumber]
    },
    failOnStatusCode: false
  });
});

// 51
Cypress.Commands.add('renameWsAPI', (wsId:string, wsName:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/rename/${wsName}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 52
Cypress.Commands.add('copyToAPI', (wsDestinationId:string, copyUnit:CopyUnit, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'POST',
    url: `/api/workspaces/${wsDestinationId}/units`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      createForm: copyUnit.createForm,
      groupName: copyUnit.groupName,
      key: copyUnit.key,
      name: copyUnit.name
    },
    failOnStatusCode: false
  });
});

// 53
Cypress.Commands.add('downloadWsAPI', (wsId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/download/xlsx/workspaces/${wsId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 54
Cypress.Commands.add('downloadWsAllAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/download/xlsx/workspaces',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 55
Cypress.Commands.add('getGroupsOfWsAPI', (wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/groups`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});
// 56
Cypress.Commands.add('getCodingReportAPI', (wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/coding-report`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 57
// TODO: Endpoint has changed
Cypress.Commands.add('createGroupWsAPI', (wsId: string, groupName:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'POST',
    url: `/api/workspaces/${wsId}/group`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      body: `${groupName}`
    },
    failOnStatusCode: false
  });
});

// 58
Cypress.Commands.add('updateGroupStatesAPI', (groupId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/workspace-groups/${groupId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      id: `${groupId}`,
      settings: {
        profiles: [
          {
            id: `${Cypress.env('profile1')}`,
            label: `${Cypress.env('label1')}`
          },
          {
            id: `${Cypress.env('profile2')}`,
            label: `${Cypress.env('label2')}`
          }],
        states: [
          {
            id: 1,
            color: '#a51d2d',
            label: 'Initial'
          },
          {
            id: 2,
            color: '#edb211',
            label: 'Finale'
          }]
      }
    },
    failOnStatusCode: false
  });
});

// 59
Cypress.Commands.add('updateUnitStateAPI', (wsId: string, unitId: string, state: string, token:string) => {
  const authorization = `bearer ${token}`;
  const nu = parseInt(`${unitId}`, 10);
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/units/${unitId}/metadata`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      id: nu,
      state: `${state}`
    },
    failOnStatusCode: false
  });
});

// 60
// TODO: Endpoint is removed
// Cypress.Commands.add('deleteStateAPI', (wsId: string, state: string, token:string) => {
//   const authorization = `bearer ${token}`;
//   cy.request({
//     method: 'DELETE',
//     url: `/api/workspace/${wsId}/${state}/state`,
//     headers: {
//       'app-version': Cypress.env('version'),
//       authorization
//     },
//     failOnStatusCode: false
//   });
// });

// 61
Cypress.Commands.add('getMetadataWsAPI', (wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/units/metadata`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 62
Cypress.Commands.add('dropboxWsAPI', (wsId: string, wsDe: string, token:string) => {
  const authorization = `bearer ${token}`;
  const nu = parseInt(`${wsDe}`, 10);
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/drop-box`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      dropBoxId: nu
    },
    failOnStatusCode: false
  });
});

// 63
Cypress.Commands.add('submitUnitsAPI', (wsId: string, wsDe: string, unit:string, token:string) => {
  const authorization = `bearer ${token}`;
  const nu = parseInt(`${wsDe}`, 10);
  const unitNumber = parseInt(`${unit}`, 10);
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/submit`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      dropBoxId: nu,
      units: [unitNumber]
    },
    failOnStatusCode: false
  });
});

// 64
Cypress.Commands.add('returnUnitsAPI', (wsDe: string, unit:string, token:string) => {
  const authorization = `bearer ${token}`;
  const unitNumber = parseInt(`${unit}`, 10);
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsDe}/return-submitted`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      units: [unitNumber]
    },
    failOnStatusCode: false
  });
});

// 65
Cypress.Commands.add('postCommentAPI', (wsId: string, unitId: string, comment: CommentData, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'POST',
    url: `/api/workspaces/${wsId}/units/${unitId}/comments`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      body: `${comment.body}`,
      userName: `${comment.userName}`,
      userId: `${comment.userId}`,
      unitId: `${comment.unitId}`
    },
    failOnStatusCode: false
  });
});

// 66
Cypress.Commands.add('getCommentsAPI', (wsId: string, unitId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/units/${unitId}/comments`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 67
Cypress.Commands.add('updateCommentTimeAPI', (wsId: string, unitId: string, comment: CommentData, token:string) => {
  const authorization = `bearer ${token}`;
  const now = new Date();
  const nu = parseInt(`${comment.userId}`, 10);
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/units/${unitId}/comments/`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      userId: nu,
      lastSeenCommentChangedAt: now
    },
    failOnStatusCode: false
  });
});

// 68
Cypress.Commands.add('updateCommentAPI',
  (wsId: string, unitId: string, commentId:string, comment: CommentData, token:string) => {
    const authorization = `bearer ${token}`;
    const nu = parseInt(`${comment.userId}`, 10);
    cy.request({
      method: 'PATCH',
      url: `/api/workspaces/${wsId}/units/${unitId}/comments/${commentId}`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: {
        body: `${comment.body}`,
        userId: nu
      },
      failOnStatusCode: false
    });
  });

// 69
Cypress.Commands.add('deleteCommentAPI',
  (wsId: string, unitId: string, commentId:string, token:string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'DELETE',
      url: `/api/workspaces/${wsId}/units/${unitId}/comments/${commentId}`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      failOnStatusCode: false
    });
  });

// 70
Cypress.Commands.add('addReviewAPI', (wsId:string, reviewName: string, token:string) => {
  const authorization = `bearer ${token}`;
  const nu = parseInt(`${wsId}`, 10);
  cy.request({
    method: 'POST',
    url: `/api/workspaces/${wsId}/reviews/`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      name: `${reviewName}`,
      workspaceId: nu
    },
    failOnStatusCode: false
  });
});

// 71
Cypress.Commands.add('getReviewAPI', (wsId:string, reviewId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/reviews/${reviewId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 72
Cypress.Commands.add('updateReviewAPI', (wsId:string, review: ReviewData, token:string) => {
  const authorization = `bearer ${token}`;
  const nu = parseInt(`${review.id}`, 10);
  if (review.units) {
    cy.request({
      method: 'PATCH',
      url: `/api/workspaces/${wsId}/reviews/${review.id}`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: {
        id: nu,
        name: `${review.name}`,
        link: `${review.link}`,
        units: [`${review.units[0]}`]
      },
      failOnStatusCode: false
    });
  }
});

// 73
Cypress.Commands.add('getAllReviewAPI', (wsId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/reviews/`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 74
Cypress.Commands.add('getReviewWindowAPI', (reviewId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/reviews/${reviewId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 75
Cypress.Commands.add('getReviewMetadataAPI', (reviewId:string, unitId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/reviews/${reviewId}/units/${unitId}/metadata`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 76
Cypress.Commands.add('getReviewDefinitionAPI', (reviewId:string, unitId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/reviews/${reviewId}/units/${unitId}/definition`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 81
Cypress.Commands.add('deleteReviewAPI', (wsId:string, reviewId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'DELETE',
    url: `/api/workspaces/${wsId}/reviews/${reviewId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 82
// TODO: Endpoint changed
Cypress.Commands.add('FdownloadWsAPI', (wsId:string, settings: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/download/${settings}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 83
Cypress.Commands.add('deleteUnitAPI', (unitId:string, wsId:string, token: string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'DELETE',
    url: `/api/workspaces/${wsId}/units/${unitId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 84
Cypress.Commands.add('getMyData', (token: string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/my-data',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 85
Cypress.Commands.add('updateMyData', (token: string, data: MyData) => {
  const authorization = `bearer ${token}`;
  const nu = parseInt(data.id, 10);
  cy.request({
    method: 'PATCH',
    url: '/api/my-data',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      id: nu,
      description: `${data.description}`,
      email: `${data.email}`,
      lastName: `${data.lastName}`,
      firstName: `${data.firstName}`,
      emailPublishApproved: false
    },
    failOnStatusCode: false
  });
});

// 86
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

// 87
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

// 88
Cypress.Commands.add('deleteWsAPI', (ws:string, group: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'DELETE',
    url: `/api/group-admin/workspaces/${ws}/${group}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 89
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

// 90
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

// 91
Cypress.Commands.add('deleteUserAPI', (id: string, token: string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'DELETE',
    url: '/api/admin/users/',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    qs: {
      id: `${id}`
    },
    failOnStatusCode: false
  });
});

Cypress.Commands.add('deleteUsersAPI', (ids: string, token: string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'DELETE',
    url: `/api/admin/users?${ids}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 100
Cypress.Commands.add('getSettingConfigAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/admin/settings/config',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 101
Cypress.Commands.add('updateSettingConfigAPI', (token:string, hour:number) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: '/api/admin/settings/config',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      appTitle: 'IQB-Studio',
      globalWarningText: 'Warnung Achtung 2',
      globalWarningExpiredHour: `${hour}`,
      globalWarningExpiredDay: new Date(),
      hasUsers: true
    },
    failOnStatusCode: false
  });
});

// 102
Cypress.Commands.add('getSettingLogoAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/admin/settings/app-logo',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 103
Cypress.Commands.add('updateSettingLogoAPI', (token:string, color: string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: '/api/admin/settings/app-logo',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      data: '',
      alt: '',
      bodyBackground: `${color}`,
      boxBackground: ''
    },
    failOnStatusCode: false
  });
});

// 104
Cypress.Commands.add('getSettingUnitExportAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/admin/settings/unit-export-config',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 105
Cypress.Commands.add('updateSettingUnitExportAPI', (token:string, unitExport: UnitExport) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: '/api/admin/settings/unit-export-config',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      unitXsdUrl: `${unitExport.unitXsdUrl}`,
      bookletXsdUrl: `${unitExport.bookletXsdUrl}`,
      testTakersXsdUrl: `${unitExport.testTakersXsdUrl}`
    },
    failOnStatusCode: false
  });
});

// 106
Cypress.Commands.add('getSettingMissingProfilesAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/admin/settings/missings-profiles',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 107
Cypress.Commands.add('updateSettingMissingProfilesAPI', (token:string, profile:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: '/api/admin/settings/missings-profiles',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: [{
      label: 'IQB-Standard',
      missings: profile
    }],
    failOnStatusCode: false
  });
});

// 109
Cypress.Commands.add('getPackageAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/resource-packages',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 110
Cypress.Commands.add('deletePackageAPI', (token:string, packageId:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'DELETE',
    url: `/api/admin/resource-packages?id=${packageId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 111
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

// not used
Cypress.Commands.add('uploadUnitsAPI', (wsId: string, filename:string, token:string) => {
  const authorization = `bearer ${token}`;
  // const path:string = `../frontend-e2e/src/fixtures/${filename}`;
  // cy.request({
  //   method: 'POST',
  //   url: `/api/workspaces/${wsId}/upload`,
  //   headers: {
  //     'app-version': Cypress.env('version'),
  //     authorization
  //   },
  //   failOnStatusCode: false
  // }).selectFile(
  //   path, {
  //     action: 'select',
  //     force: true
  //   });
  cy.fixture(filename).then(file => {
    cy.request({
      method: 'POST',
      url: `/api/workspaces/${wsId}`,
      headers: {
        'app-version': Cypress.env('version'),
        'content-type': 'binary',
        authorization
      },
      body: file
    }).then(resp => {
      expect(resp.status).to.equal(204);
    });
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
