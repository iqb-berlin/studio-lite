import { GroupData, UserData, WsData } from './testData';
// 25 TO DELETE
export function addFirstUserAPI():void {
  cy.request({
    method: 'POST',
    url: '/api/init-login',
    headers: {
      'app-version': Cypress.env('version')
    },
    body: {
      username: Cypress.env('username'),
      password: Cypress.env('password')
    }
  }).then(resp => {
    Cypress.env('token_admin', resp.body);
    expect(resp.status).to.equal(201);
  });
  // cy.intercept('POST', '/api/init-login', req => {
  //   Cypress.env(`token_${Cypress.env('username')}`, req.body);
  //   req.reply({
  //     statusCode: 201,
  //     headers: {
  //       'app-version': Cypress.env('version')
  //     },
  //     body: {
  //       username: Cypress.env('username'),
  //       password: Cypress.env('password')
  //     }
  //   });
  // }).as(`addFirstUser${from}`);
}

// 26
export function loginAPI(username:string, password:string) {
  cy.request({
    method: 'POST',
    url: '/api/login',
    headers: {
      'app-version': Cypress.env('version')
    },
    body: {
      username: `${username}`,
      password: `${password}`
    }
  }).then(resp => {
    Cypress.env('token_admin', resp.body);
    expect(resp.status).to.equal(201);
  });
}
// 24
export function deleteFirstUserAPI() {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'DELETE',
    url: `/api/admin/users/${Cypress.env('id_admin')}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    Cypress.env('token_admin', '');
    expect(resp.status).to.equal(200);
  });
}
// 27
export function getUserIdAPI(username: string, token: string):void {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/auth-data',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    Cypress.env(`id_${username}`, resp.body.userId);
    expect(resp.status).to.equal(200);
  });
}

// 28
export function changePasswordAPI(oldpass: string, newpass:string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'PATCH',
    url: '/api/password',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      oldPassword: oldpass,
      newPassword: newpass
    }
  }).then(resp => {
    expect(resp.status).to.equal(200);
  });
}
// 18 .DEL
export function createUserAPI(userData:UserData) {
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
    }
  }).then(resp => {
    Cypress.env(userData.username, resp.body);
    expect(resp.status).to.equal(201);
  });
}

// 22.
export function deleteUserAPI(userId: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'DELETE',
    url: `/api/admin/users/${userId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    expect(resp.status).to.equal(200);
  });
}
// admin-workspaces to delete
export function createGroupAPI(group: GroupData) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
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
    }
  }).then(resp => {
    Cypress.env(group.id, resp.body);
    expect(resp.status).to.equal(201);
  });
}
// TO DO 10. TO DELETE
export function getGroupAPI(groupKey: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/workspace-groups/${groupKey}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    expect(resp.body.name).to.equal('VERA2022');
    expect(resp.status).to.equal(200);
  });
}

// 11. TO DELETE
export function getWsAPI(wsKey: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/workspaces/${wsKey}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    expect(resp.body.name).to.equal('01Vorlage');
    expect(resp.status).to.equal(200);
  });
}

// 12. TO DELETE
export function getUsersOfWsAPI(wsKey: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/workspaces/${wsKey}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    expect(resp.status).to.equal(200);
  });
}

// 13. TO DELETE
export function updateUsersOfWsAPI(wsKey: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'PATCH',
    url: `/api/admin/workspaces/${wsKey}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: [
      {
        accessLevel: 4,
        id: Cypress.env('id_admin')
      }
    ]
  }).then(resp => {
    expect(resp.status).to.equal(200);
  });
}
// 13.Option 2 TO DELETE
export function grantAccessWsAPI(wsKey: string, userId:string, accessLevel:number) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'PATCH',
    url: `/api/admin/workspaces/${wsKey}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: [
      {
        accessLevel: accessLevel,
        id: userId
      }
    ]
  }).then(resp => {
    expect(resp.status).to.equal(200);
  });
}

// 14. What does it do?
export function updateWsAPI(wsKey: string, groupKey: string, wsName:string, groupName: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'PATCH',
    url: '/api/admin/workspaces',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: [
      {
        id: `${wsKey}`,
        name: `${wsName}`,
        groupId: `${groupKey}`,
        groupName: `${groupName}`,
        settings: {
          defaultEditor: {},
          defaultPlayer: {},
          defaultSchemer: {},
          unitGroups: [
          ],
          stableModulesOnly: true,
          unitMDProfile: '',
          itemMDProfile: '',
          states: [
            'HOLA'
          ]
        }
      }
    ]
  }).then(resp => {
    expect(resp.status).to.equal(200);
  });
}

// 15.
// TODO changed /api/admin/workspaces/move
export function deleteWsAPI(wsKey: string, groupKey: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'DELETE',
    url: `/api/admin/workspaces/${wsKey}/${groupKey}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    expect(resp.status).to.equal(200);
  });
}

// 8. TO DELETE
export function setAdminOfGroupAPI(userKey: string, groupKey: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'PATCH',
    url: `/api/admin/workspace-groups/${groupKey}/admins`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: [
      userKey
    ]
  }).then(resp => {
    expect(resp.status).to.equal(200);
  });
}

export function getAdminOfGroupAPI(groupKey: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/workspace-groups/${groupKey}/admins`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    expect(resp.status).to.equal(200);
    expect(resp.body[0]).to.have.property('name');
    expect(resp.body[0].id).equal(Cypress.env('id_admin'));
  });
}
// 6 TO DELETE
// export function createWsAPI(groupKey: string, ws: string, wsKey:string) {
export function createWsAPI(groupKey: string, ws1:WsData) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
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
    }
  }).then(resp => {
    Cypress.env(ws1.id, resp.body);
    expect(resp.status).to.equal(201);
  });
}

export function getWsByGroupAPI(groupKey: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/workspace-groups/${groupKey}/workspaces`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    expect(resp.status).to.equal(304);
  });
}
// 16. TO DELETE
export function deleteGroupAPI(groupID: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'DELETE',
    url: `/api/admin/workspace-groups/${groupID}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    Cypress.env(groupID, '');
    expect(resp.status).to.equal(200);
  });
}

export function addModuleAPI() {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'POST',
    url: '/api/admin/verona-modules',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }

  }).then(resp => {
    Cypress.env('id_group', '');
    expect(resp.status).to.equal(201);
  });
}
