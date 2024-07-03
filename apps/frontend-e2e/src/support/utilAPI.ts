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
    // const data:APIProps = {
    //   username: Cypress.env('username'),
    //   password: Cypress.env('password'),
    //   token_admin: resp.body
    // };
    // const dataAdmin = new APIData(data);
    // return dataAdmin;
  });
}

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
    console.log(resp.body.userId);
  });
}

export function getCloakIdAPI():void {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'GET',
    url: '/api/admin/users',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    cy.wrap(resp.body[1].id).as('IdCloak');
    expect(resp.status).to.equal(200);
    Cypress.env('id_cloak', resp.body[1].id);
  });
}

export function keyCloakLogin() {
  cy.request({
    method: 'POST',
    url: '/api/keycloak-login',
    headers: {
      'app-version': Cypress.env('version')
    },
    body: {
      description: '',
      email: 'xxx@hu-berlin.com',
      firstName: 'xxx',
      identity: 'xxx',
      isAdmin: 'false',
      issuer: 'https://www.iqb-login.de/realms/iqb',
      lasName: 'xxx',
      name: 'xxx',
      password: ''
    }
  }).then(resp => {
    cy.wrap(resp.body).as('tokenCloak');
    Cypress.env('token_cloak', resp.body);
    expect(resp.status).to.equal(201); // We use dummy data, with real data we use code 201
    return resp.body;
  });
}
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

export function createNewUserAPI(user: string, pass: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'POST',
    url: '/api/admin/users',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      name: `${user}`,
      password: `${pass}`,
      isAdmin: true,
      description: 'Student im HuDel-Projekt',
      email: 'email@gmail.com',
      lastName: 'Schmit',
      firstName: 'Cristian',
      issuer: 'issuer',
      identity: 'identity'
    }
  }).then(resp => {
    Cypress.env('id_user', resp.body);
    expect(resp.status).to.equal(201);
  });
}

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
// admin-workspaces
export function createGroupAPI(group: string, groupKey: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'POST',
    url: '/api/admin/workspace-groups',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      name: `${group}`,
      setting: {}
    }
  }).then(resp => {
    Cypress.env(groupKey, resp.body);
    expect(resp.status).to.equal(201);
  });
}

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

export function createWsAPI(groupKey: string, ws: string, wsKey:string) {
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
      name: `${ws}`
    }
  }).then(resp => {
    Cypress.env(wsKey, resp.body);
    expect(resp.status).to.equal(201);
  });
}

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
