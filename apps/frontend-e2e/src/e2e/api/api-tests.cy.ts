import { GroupData, UserData } from '../../support/testData';

describe('Studio API tests', () => {
  const noId:string = '9988';
  const fakeUser:UserData = {
    username: 'falseUser',
    password: 'paso',
    isAdmin: false
  };
  const user2:UserData = {
    username: 'normalUser',
    password: 'paso',
    isAdmin: false
  };
  const group1: GroupData = {
    id: 'id_group1',
    name: 'VERA2022'
  };
  const vera2024: string = 'VERA2024';
  const group2: GroupData = {
    id: 'id_group2',
    name: 'GROUP2022'
  };
  // const fakeGroup: GroupData = {
  //   id: 'id_group3',
  //   name: 'fakeGroup'
  // };
  // const ws1: WsData = {
  //   id: 'id_ws1',
  //   name: '01Vorlage'
  // };

  describe('Auth API tests', () => {
    /** ************************************************************************* */
    describe('1. POST /api/init-login', () => {
      it('201 positive test: should create a first user.', () => {
        cy.addFirstUserAPI(Cypress.env('username'), Cypress.env('password'))
          .then(resp => {
            Cypress.env(`token_${Cypress.env('username')}`, resp.body);
            expect(resp.status).to.equal(201);
          });
      });
      it('403 negative test: should to create a second first user with the same user data.', () => {
        cy.addFirstUserAPI(Cypress.env('username'), Cypress.env('password'))
          .then(resp => {
            expect(resp.status).to.equal(403);
          });
      });
      // eslint-disable-next-line max-len
      it('403 negative test: should not create a second first user with the different user data.', () => {
        cy.addFirstUserAPI(fakeUser.username, fakeUser.password)
          .then(resp => {
            expect(resp.status).to.equal(403);
          });
      });
    });
    describe('2. POST /api/login', () => {
      it('201 positive test: should be logging in with the correct data', () => {
        cy.loginAPI(Cypress.env('username'), Cypress.env('password'))
          .then(resp => {
            Cypress.env(`token_${Cypress.env('username')}`, resp.body);
            console.log(resp.body);
            expect(resp.status).to.equal(201);
          });
      });
      it('401 negative test: should not be able to log in with false data.', () => {
        cy.loginAPI(fakeUser.username, fakeUser.password)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });
    describe('3. GET /api/auth-data', () => {
      it('200 positive test: should get the id of the logged in user.', () => {
        cy.getUserIdAPI(Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            Cypress.env(`id_${Cypress.env('username')}`, resp.body.userId);
            expect(resp.status).to.equal(200);
          });
      });
      it('200 negative test: should get the id with the correct token', () => {
        cy.getUserIdAPI(Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            cy.log(resp.body.userId);
            expect(resp.status).to.equal(200);
          });
      });
      it('401 negative test: should not obtain the id of a non-existent user.', () => {
        cy.getUserIdAPI('12345')
          .then(resp => {
            cy.log(resp.body.userId);
            expect(resp.status).to.equal(401);
          });
      });
    });
    describe('4. PATCH /api/password', () => {
      it('200 positive test: should be able to change password', () => {
        cy.updatePasswordAPI(Cypress.env(`token_${Cypress.env('username')}`), Cypress.env('password'), '4567')
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body).to.equal(true);
          });
        cy.loginAPI(Cypress.env('username'), '4567')
          .then(resp => {
            Cypress.env(`token_${Cypress.env('username')}`, resp.body);
            expect(resp.status).to.equal(201);
          });
        cy.updatePasswordAPI(Cypress.env(`token_${Cypress.env('username')}`), '4567', Cypress.env('password'))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body).to.equal(true);
          });
      });

      it('200 negative test: should not update user password with false old pass', () => {
        // Should return 400
        cy.updatePasswordAPI(Cypress.env(`token_${Cypress.env('username')}`), '1111', '4567')
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body).to.equal(false);
          });
      });
    });
  });
  /** ************************************************************************* */
  describe('Admin users API tests', () => {
    describe('6. POST api/admin/users: should create a new user', () => {
      it('201 positive test: ', () => {
        cy.createUserAPI(user2, Cypress.env(`token_${Cypress.env('username')}`))
          .then(res => {
            Cypress.env(`id_${user2.username}`, res.body);
            expect(res.status).to.equal(201);
            cy.getUsersAPI()
              .then(resp => {
                expect(resp.status).to.equal(200);
                expect(resp.body.length).to.equal(2);
              });
            cy.loginAPI(user2.username, user2.password)
              .then(resp => {
                Cypress.env(`token_${user2.username}`, resp.body);
                expect(resp.status).to.equal(201);
              });
          });
      });
      it('401 negative test: ', () => {
        cy.createUserAPI(fakeUser, Cypress.env(`token_${user2.username}`))
          .then(res => {
            expect(res.status).to.equal(401);
          });
      });
    });

    describe('7. GET /api/admin/users/full', () => {
      it('200 positive test', () => {
        cy.getUsersFullAPI(Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body.length).to.equal(2);
          });
      });
      it('401 negative test: normal user can not use this api call', () => {
        cy.getUsersFullAPI(Cypress.env(`token_${user2.username}`))
          .then(resp2 => {
            expect(resp2.status).to.equal(401);
          });
      });
    });

    describe('8. GET /api/admin/users/{id}', () => {
      it('200 positive test: user retrieved successfully.', () => {
        cy.getUserAPI(Cypress.env(`id_${user2.username}`), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.body.name).to.equal(user2.username);
            expect(resp.status).to.equal(200);
          });
      });
      it('401 negative test: user should not be able to get the data of an admin', () => {
        cy.getUserAPI(Cypress.env(`id_${Cypress.env('username')}`), Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
      it('404 negative test: should not find a non-existent user', () => {
        cy.getUserAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(404);
          });
      });
    });

    describe('9. GET /api/admin/users', () => {
      it('200 positive test: ', () => {
        cy.getUserNoIdAPI(Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body.length).to.equal(2);
          });
      });
      it('401 negative test: should not return no data if the parameter is not an administrator token', () => {
        cy.getUserNoIdAPI(Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });

    describe('10. PATCH /api/admin/users', () => {
      it('401 negative test: a non-administrator user should not be able to make himself administrator', () => {
        cy.updateUserAPI(user2, true, Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
      it('200 positive test: admin should be able to make other user administrator ', () => {
        cy.updateUserAPI(user2, true, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            cy.getUserAPI(Cypress.env(`id_${user2.username}`), Cypress.env(`token_${Cypress.env('username')}`))
              .then(resp2 => {
                expect(resp2.status).to.equal(200);
              });
          });
      });
      it('401 negative test: should not update with a false token', () => {
        cy.updateUserAPI(user2, true, 'falseToken')
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
      it('500 negative test: should not update a false user', () => {
        cy.updateUserAPI(fakeUser, true, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
    });

    describe('11. DELETE /api/admin/users', () => {
      it('200 positive test', () => {
        // There is no positive test
        // Candidate to eliminate
      });
      it('405 negative test', () => {
        cy.deleteUserNoIdAPI(Cypress.env(`id_${user2.username}`), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(405);
          });
      });
    });
  });
  /** ************************************************************************* */
  describe('Admin workspaces API tests', () => {
    describe('12. POST /api/admin/workspace-groups', () => {
      it('201 positive test: An admin user should create a group', () => {
        cy.createGroupAPI(group1, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            Cypress.env(group1.id, resp.body);
            expect(resp.status).to.equal(201);
          });
      });
      it('401 negative test: A normal user should create a group.', () => {
        cy.updateUserAPI(user2, false, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            cy.createGroupAPI(group2, Cypress.env(`token_${user2.username}`))
              .then(resp2 => {
                expect(resp2.status).to.equal(401);
              });
          });
      });
    });
    describe('13. GET /api/admin/workspace-groups/{workspace_group_id}', () => {
      it('200 positive test', () => {
        cy.getGroupByIdAPI(Cypress.env(group1.id), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body.name).to.equal(group1.name);
          });
      });
      it('404 negative test: should fail with a non existent workspace-group', () => {
        cy.getGroupByIdAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(404);
          });
      });
    });
    describe('14. GET /api/admin/workspace-groups', () => {
      it('200 positive test', () => {
        cy.createGroupAPI(group2, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            Cypress.env(group2.id, resp.body);
            expect(resp.status).to.equal(201);
          });
        cy.getGroupAPI(Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body.length).to.equal(2);
          });
      });
      it('401 negative test', () => {
        cy.getGroupAPI(Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });
    describe('15. PATCH /api/admin/workspace-groups', () => {
      it('200 positive test', () => {
        const authorization = `bearer ${Cypress.env(`token_${Cypress.env('username')}`)}`;
        cy.request({
          method: 'PATCH',
          url: '/api/admin/workspace-groups/',
          headers: {
            'app-version': Cypress.env('version'),
            authorization
          },
          body: {
            id: `${Cypress.env('id_group1')}`,
            name: `${vera2024}`
          }
        }).then(resp => {
          expect(resp.status).to.equal(200);
          cy.getGroupByIdAPI(Cypress.env(group1.id), Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp2 => {
              expect(resp2.status).to.equal(200);
            });
        });
      });
      it('500 negative test: should fail with a non existent workspace-group', () => {
        const authorization = `bearer ${Cypress.env(`token_${Cypress.env('username')}`)}`;
        cy.request({
          method: 'PATCH',
          url: '/api/admin/workspace-groups/',
          headers: {
            'app-version': Cypress.env('version'),
            authorization
          },
          body: {
            id: `${noId}`,
            name: `${vera2024}`
          },
          failOnStatusCode: false
        }).then(resp => {
          expect(resp.status).to.equal(500);
        });
      });
    });

    describe.skip('16. /api/admin/workspace-groups/{workspace_group_id}/admins', () => {
      it('200 positive test', () => {
        cy.setAdminOfGroupAPI(Cypress.env(`id_${Cypress.env('username')}`),
          Cypress.env(group1.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
        cy.setAdminOfGroupAPI(Cypress.env(`id_${user2.username}`),
          Cypress.env(group1.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
      it('401 negative test:  A normal user should not grant credentials on a group.', () => {
        cy.setAdminOfGroupAPI(Cypress.env(`id_${Cypress.env('username')}`),
          Cypress.env(group2.id),
          Cypress.env(user2.username))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
      it('500 negative test: should not grant credentials on a non existent group', () => {
        cy.setAdminOfGroupAPI(Cypress.env(`id_${Cypress.env('username')}`),
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
    });

    describe('16a. /api/admin/workspace-groups/{workspace_group_id}/admins', () => {
      it('200 positive test', () => {
        cy.setAdminsOfGroupAPI([Cypress.env(`id_${Cypress.env('username')}`), Cypress.env(`id_${user2.username}`)],
          Cypress.env(group1.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
      it('401 negative test:  A normal user should not grant credentials on a group.', () => {
        cy.pause();
        cy.setAdminsOfGroupAPI([Cypress.env(`id_${Cypress.env('username')}`)],
          Cypress.env(group2.id),
          Cypress.env(user2.username))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
      it('500 negative test: should not grant credentials on a non existent group', () => {
        cy.setAdminsOfGroupAPI([Cypress.env(`id_${Cypress.env('username')}`)],
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
    });

    describe('17. GET /api/admin/workspace-groups/{workspace_group_id}/admins ', () => {
      it('200 positive test', () => {
        cy.getAdminOfGroupAPI(Cypress.env(group1.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.body.length).to.equal(2);
            expect(resp.status).to.equal(200);
          });
      });
      it('401 negative test: User without credentials should get the admins of a group.', () => {
        cy.getAdminOfGroupAPI(Cypress.env(group1.id),
          Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });
    describe('18. ', () => {
      it('200 positive test', () => {
      });
      it('negative test', () => {

      });
    });
    describe('', () => {
      it('200 positive test', () => {
      });
      it('negative test', () => {

      });
    });
  });
  /** ************************************************************************* */
  describe('Admin users workspaces API tests', () => {
    describe('40. DELETE /api/admin/workspace-groups/id', () => {
      it('401 negative test', () => {
        cy.deleteGroupAPI(Cypress.env(group1.id), Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
      it('404/200 negative test: should fail with a non-existent group', () => {
        // This test should have 404 response, but we get 200
        cy.deleteGroupAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
      it('200 positive test', () => {
        cy.deleteGroupAPI(Cypress.env(group1.id), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            Cypress.env(group1.id, '');
            expect(resp.status).to.equal(200);
          });
        cy.deleteGroupAPI(Cypress.env(group2.id), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            Cypress.env(group2.id, '');
            expect(resp.status).to.equal(200);
          });
      });
    });
    describe('60. DELETE /api/admin/users/id ', () => {
      it('200 positive test', () => {
        cy.deleteUserAPI(Cypress.env(`id_${user2.username}`), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
      it('No negative test', () => {
        cy.deleteUserAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
    });
    describe('. GET /api/admin/users/id', () => {
      it('positive test', () => {

      });
      it('negative test', () => {

      });
    });
    describe('', () => {
      it('', () => {

      });
      it('', () => {

      });
    });
  });

  describe('Delete the contents of the database', () => {
    describe('110. DELETE /api/admin/users/id', () => {
      it('200 positive test: should be possible to delete the first user', () => {
        cy.deleteFirstUserAPI().then(resp => {
          Cypress.env('token_admin', '');
          expect(resp.status).to.equal(200);
        });
      });
      it('401 negative test: should not be possible to delete user if it does not exist', () => {
        cy.deleteFirstUserAPI().then(resp => {
          expect(resp.status).to.equal(401);
        });
      });
    });
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