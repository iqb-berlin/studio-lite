// import {
//   addFirstUserAPI, deleteFirstUserAPI, deleteUserAPI, getUserIdAPI
// } from '../../support/utilAPI';
// import { UserData } from '../../support/testData';
//
// describe('API admin users test', () => {
//   const user2:UserData = {
//     username: 'admin2',
//     password: 'paso',
//     isAdmin: false
//   };
//
//   before(addFirstUserAPI);
//   after(deleteFirstUserAPI);
//
//   context('Positive Tests', () => {
//     // 17.
//     it('1. should be able to retrieve admin users', () => {
//       getUserIdAPI(Cypress.env('username'), Cypress.env('token_admin'));
//       cy.getUsersAPI()
//         .then(resp => {
//           expect(resp.status).to.equal(200);
//           expect(resp.body[0].name).to.equal(Cypress.env('username'));
//         });
//     });
//     // 18.
//     it('2. should be able to retrieve an admin users', () => {
//       cy.createUserAPI(user2)
//         .then(res => {
//           Cypress.env(user2.username, res.body);
//           expect(res.status).to.equal(201);
//           cy.getUsersAPI()
//             .then(resp => {
//               expect(resp.status).to.equal(200);
//               expect(resp.body.length).to.equal(2);
//             });
//         });
//     });
//     // 19.
//     it('5. should able to retrieve all users', () => {
//       cy.getUsersFullAPI()
//         .then(resp => {
//           expect(resp.status).to.equal(200);
//           expect(resp.body.length).to.equal(2);
//         });
//     });
//     // 20.
//     it('6. should able to retrieve a user', () => {
//       cy.getUserAPI(Cypress.env(user2.username))
//         .then(resp => {
//           expect(resp.body.name).to.equal(user2.username);
//         });
//     });
//     // 20.
//     it('6.Negative test: should not be able to retrieve a false user', () => {
//     // /api/admin/users/{id}
//       cy.getUserAPI('999')
//         .its('status')
//         .should('equal', 404);
//     });
//     // 21.
//     it('7. should to retrieve the workspaces of a user (admin). /api/admin/users/{id}/workspaces', () => {
//       cy.getWsByUserAPI(Cypress.env(user2.username))
//         .then(resp => {
//           expect(resp.status).to.equal(200);
//         // TODO INSERT WS AND CHECK THE SIZE AFTER THAT
//         // expect(resp.body.length).to.equal(0);
//         });
//     });
//   });
//
//   context('Negative Tests', () => {
//     // Doesn't work (GET and POST) /api/admin/users/{id}/workspace-groups
//     // I can find real function for these api
//     it('7. Negativ should to retrieve the workspaces of a user (admin). /api/admin/users/{id}/workspaces', () => {
//       cy.getWsByUserAPI('no_user')
//         .then(resp => {
//           expect(resp.status)
//             .to
//             .equal(500);
//         });
//     });
//
//     // 23.  The server response is 200 and it is undocumented
//     // TODO Check
//     it('9. Should able be possible change data of a user', () => {
//       cy.pause();
//       const authorization = `bearer ${Cypress.env('token_admin')}`;
//       cy.request({
//         method: 'PATCH',
//         url: '/api/admin/users',
//         headers: {
//           'app-version': Cypress.env('version'),
//           authorization
//         },
//         body: {
//           id: `${Cypress.env(user2.username)}`,
//           name: `${user2.username}`,
//           isAdmin: true
//         }
//       })
//         .then(resp => {
//           expect(resp.status)
//             .to
//             .equal(200);
//         });
//     });
//
//     // 22.
//     it('10. Delete the second user', () => {
//       cy.pause();
//       deleteUserAPI(Cypress.env(user2.username));
//     });
//   });
// });
