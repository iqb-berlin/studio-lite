// 1
import { UserData } from './testData';

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
Cypress.Commands.add('deleteUserAPI', (userId: string) => {
  const authorization = `bearer ${Cypress.env(`token_${Cypress.env('username')}`)}`;
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

// 9.
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

// 10
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

// 11

// 110
Cypress.Commands.add('deleteFirstUserAPI', () => {
  const authorization = `bearer ${Cypress.env(`token_${Cypress.env('username')}`)}`;
  cy.request({
    method: 'DELETE',
    url: `/api/admin/users/${Cypress.env(`id_${Cypress.env('username')}`)}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    }
  });
});
