export function addFirstUserAPI():void {
  cy.request({
    method: 'POST',
    url: 'http://localhost:4200/api/init-login',
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
    url: 'http://localhost:4200/api/login',
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
    url: `http://localhost:4200/api/admin/users/${Cypress.env('adminID')}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    Cypress.env('token_admin', '');
    expect(resp.status).to.equal(200);
  });
}

export function getUserIdAPI(username: string, typeId: string): string {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'GET',
    url: 'http://localhost:4200/api/auth-data',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    expect(resp.status).to.equal(200);
    Cypress.env(typeId, resp.body.userId);
    return resp.body.userId;
  });
  return '';
}

export function keyCloakLogin() {
  cy.request({
    method: 'POST',
    url: 'http://localhost:4200/api/keycloak-login',
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
    Cypress.env('token_cloak', resp.body);
    Cypress.env('user_cloak', 'xxx');
    expect(resp.status).to.equal(201); // We use dummy data, with real data we use code 201
  });
}
export function changePasswordAPI(oldpass: string, newpass:string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'PATCH',
    url: 'http://localhost:4200/api/password',
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
    url: 'http://localhost:4200/api/admin/users',
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

export function deleteUserAPI(user: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'DELETE',
    url: `http://localhost:4200/api/admin/users/${Cypress.env('userID')}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    Cypress.env('id_user', '');
    console.log(`The user ${user} is deleted`);
    expect(resp.status).to.equal(200);
  });
}

export function createGroupAPI(group: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'POST',
    url: 'http://localhost:4200/api/admin/workspace-groups',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      name: `${group}`,
      setting: {}
    }
  }).then(resp => {
    Cypress.env('id_group', resp.body);
    expect(resp.status).to.equal(201);
  });
}

export function createWsAPI(groupID: string, ws: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'POST',
    url: `http://localhost:4200/api/admin/workspaces/${groupID}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      groupId: `${groupID}`,
      name: `${ws}`
    }
  }).then(resp => {
    Cypress.env('id_ws', resp.body);
    expect(resp.status).to.equal(201);
  });
}

export function deleteGroupAPI(groupID: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'DELETE',
    url: `http://localhost:4200/api/admin/workspace-groups/${groupID}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  }).then(resp => {
    Cypress.env('id_group', '');
    expect(resp.status).to.equal(200);
  });
}

export function addModuleAPI() {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'POST',
    url: 'http://localhost:4200/api/admin/verona-modules',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }

  }).then(resp => {
    Cypress.env('id_group', '');
    expect(resp.status).to.equal(201);
  });
}
