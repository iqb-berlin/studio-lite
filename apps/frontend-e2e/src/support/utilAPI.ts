export function addFirstUserAPI() {
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
    console.log(resp.body);
    window.localStorage.setItem('token_admin', resp.body);
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
    console.log(`DELETE admin ${Cypress.env('token_admin')}`);
    console.log(resp.body);
  });
}

export function getAdminUserAPI() {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'GET',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    url: 'http://localhost:4200/api/auth-data'
  }).then(resp => {
    Cypress.env('adminID', resp.body.userId);
  });
}

export function createNewUserAPI(user: string, pass: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'POST',
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
    },
    url: 'http://localhost:4200/api/admin/users'
  }).then(resp => {
    Cypress.env('userID', user);
    expect(resp.status).to.equal(201);
  });
}

export function deleteUserAPI(user: string) {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  cy.request({
    method: 'DELETE',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    url: 'http://localhost:4200/api/admin/users',
    body: {
      id: Cypress.env('userID')
    }
  }).then(resp => {
    Cypress.env('userID', user);
    expect(resp.status).to.equal(201);
  });
}
