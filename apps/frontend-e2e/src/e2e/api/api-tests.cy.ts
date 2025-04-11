import {
  AccessLevel,
  AccessUser,
  CommentData, CopyUnit, DefinitionUnit,
  GroupData, MyData, ReviewData,
  UnitData,
  UserData,
  WsData,
  WsSettings
} from '../../support/testData';

function getNameAt(initialName: string): string {
  return initialName.replace(/-+(?=[^-\d]*\d)/, '@').replace(/.html$/, '');
}
describe('Studio API tests', () => {
  const noId: string = '9988';
  const modules:string[] = ['iqb-schemer-2.5.3.html',
    'iqb-editor-aspect-2.9.1.html',
    'iqb-player-aspect-2.9.1.html'];
  const fakeUser: UserData = {
    username: 'falseuser',
    password: 'paso',
    isAdmin: false
  };
  const user2: UserData = {
    username: 'user',
    password: 'paso',
    isAdmin: false
  };
  const user3: UserData = {
    username: 'userTh',
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
  const ws1: WsData = {
    id: 'id_ws1',
    name: '01Vorlage',
    state: ['Initial', 'Final']
  };
  const ws2: WsData = {
    id: 'id_ws2',
    name: '02Vorlage'
  };
  const ws3: WsData = {
    id: 'id_ws3',
    name: '03Lesen'
  };
  const unit1: UnitData = {
    shortname: 'D01',
    name: 'Maus',
    group: 'Group1'
  };
  const unit2: UnitData = {
    shortname: 'D02',
    name: 'Hund',
    group: 'Group2'
  };
  const unit3: UnitData = {
    shortname: 'D03',
    name: 'Tier3',
    group: 'Group3'
  };
  const unit4: UnitData = {
    shortname: 'D04',
    name: 'Tier4',
    group: 'Group1'
  };
  // const t1: TextWithLanguage = {
  //   lang: 'de',
  //   value: 'Entwickler:in'
  // };
  // const t2: TextWithLanguage = {
  //   lang: 'de',
  //   value: 'Ana Maier'
  // };
  // const entry: MetadataValuesEntry = {
  //   id: 'iqb_author',
  //   label: [t1],
  //   value: [t2],
  //   valueAsText: [t2]
  // };

  const setEditor: WsSettings = {
    defaultEditor: 'iqb-editor-aspect@2.9',
    defaultPlayer: 'iqb-player-aspect@2.9',
    defaultSchemer: 'iqb-schemer@2.5',
    unitGroups: ['Bista1', 'Bista2'],
    stableModulesOnly: false,
    unitMDProfile: '',
    itemMDProfile: ''
  };

  describe('Auth API tests', () => {
    describe('1. POST /api/init-login', () => {
      it('201 positive test: should create a first user.', () => {
        cy.addFirstUserAPI(Cypress.env('username'), Cypress.env('password'))
          .then(resp => {
            Cypress.env(`token_${Cypress.env('username')}`, resp.body);
            // console.log(resp.body);
            expect(resp.status).to.equal(201);
          });
      });

      it('403 negative test: should not create a second first user with the same user data.', () => {
        cy.addFirstUserAPI(Cypress.env('username'), Cypress.env('password'))
          .then(resp => {
            expect(resp.status).to.equal(403);
          });
      });

      it('403 negative test: should not create a second first user with the different' +
        ' user data.', () => {
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
      it('401 negative test: should not get the id of a non-existent user.', () => {
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

      it('200/500 negative test: should not update user password with false old pass', () => {
        cy.updatePasswordAPI(Cypress.env(`token_${Cypress.env('username')}`), '1111', '4567')
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body).to.equal(false);
            // expect(resp.status).to.equal(500); should
          });
      });

      it('401 negative test: should not update user password with wrong token', () => {
        cy.updatePasswordAPI(noId, Cypress.env('password'), '4567')
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });
  });

  describe('Admin users API tests', () => {
    describe('6. POST api/admin/users: should create a new user', () => {
      it('201 positive test: creates a new user', () => {
        cy.createUserAPI(user2, Cypress.env(`token_${Cypress.env('username')}`))
          .then(res => {
            Cypress.env(`id_${user2.username}`, res.body);
            expect(res.status).to.equal(201);
            cy.getUsersFullAPI(false, Cypress.env(`token_${Cypress.env('username')}`))
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

      it('401 negative test: without credentials should not create a new user', () => {
        cy.createUserAPI(fakeUser, noId)
          .then(res => {
            expect(res.status).to.equal(401);
          });
      });
    });

    describe('7. GET /api/group-admin/users', () => {
      // TO DO check the difference between full and not full
      it('200 positive test: admin user can retrieve all users data', () => {
        cy.getUsersFullAPI(false, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body.length).to.equal(2);
          });
      });

      it('401 negative test: normal user can not use this api call', () => {
        cy.getUsersFullAPI(false, Cypress.env(`token_${user2.username}`))
          .then(resp2 => {
            expect(resp2.status).to.equal(401);
          });
      });
    });

    describe('10. PATCH /api/admin/users/{id}', () => {
      it('401 negative test: a non-administrator user should not be able to make himself administrator', () => {
        cy.updateUserAPI(Cypress.env(`id_${user2.username}`), user2, true, Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('200 positive test: admin should be able to make other user administrator ', () => {
        cy.updateUserAPI(Cypress.env(`id_${user2.username}`),
          user2,
          true,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });

      it('401 negative test: should not update with a false token', () => {
        cy.updateUserAPI(Cypress.env(`id_${user2.username}`), user2, false, 'falseToken')
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('404 negative test: should not update a non existent user', () => {
        cy.updateUserAPI(noId, fakeUser, true, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(404);
          });
      });
    });
  });

  describe('Admin workspaces API tests', () => {
    describe('12. POST /api/admin/workspace-groups', () => {
      it('201 positive test: An admin user should create a group', () => {
        cy.createGroupAPI(group1, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            Cypress.env(group1.id, resp.body);
            expect(resp.status).to.equal(201);
          });
      });

      it('401 negative test: A normal user should not able to create a group.', () => {
        cy.updateUserAPI(Cypress.env(`id_${user2.username}`),
          user2,
          false,
          Cypress.env(`token_${Cypress.env('username')}`))
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
      it('200 positive test: should return the group by passing the group id', () => {
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

      it('401 negative test: should fail with non admin user', () => {
        cy.getGroupByIdAPI(Cypress.env(group1.id), Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: should fail with non token', () => {
        cy.getGroupByIdAPI(Cypress.env(group1.id), noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });

    describe('14. GET /api/admin/workspace-groups', () => {
      it('200 positive test: should retrieve the groups for an admin user', () => {
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

      it('401 negative test: A normal user can not retrieve the groups', () => {
        cy.getGroupAPI(Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: A non existent user can not retrieve the groups', () => {
        cy.getGroupAPI(noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });

    describe('15. PATCH /api/admin/workspace-groups', () => {
      it('200 positive test: should modify data for a workspace-group.', () => {
        cy.updateGroupAPI(Cypress.env(group1.id),
          vera2024,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });

      it('500 negative test: should fail with a non existent workspace-group.', () => {
        cy.updateGroupAPI(noId,
          'vera2025',
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('401 negative test: should fail with a false token', () => {
        cy.updateGroupAPI(Cypress.env(group1.id),
          'vera2026',
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: should fail with a false token', () => {
        cy.updateGroupAPI(Cypress.env(group1.id),
          'vera2027',
          Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });

    describe('16. PATCH /api/admin/workspace-groups/{workspace_group_id}/admins', () => {
      it('200 positive test: should set a list of admin users for workspace-group', () => {
        cy.setAdminsOfGroupAPI([Cypress.env(`id_${Cypress.env('username')}`), Cypress.env(`id_${user2.username}`)],
          Cypress.env(group1.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });

      it('401 negative test:  A normal user should not grant credentials on a group.', () => {
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

    describe('8. GET /api/admin/users/{id}/workspace-groups', () => {
      it('200 positive test: get the workspaces of the actual user.', () => {
        cy.getUserAPI(Cypress.env(`id_${user2.username}`), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
        cy.getUserAPI(Cypress.env(`id_${Cypress.env('username')}`), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });

      it('401 negative test: user should not be able to get the data of an admin', () => {
        cy.getUserAPI(Cypress.env(`id_${Cypress.env('username')}`), Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500/200 negative test: should not find a non-existent user', () => {
        // A new user id, will return am emtpy array [].
        cy.getUserAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // expect(resp.status).to.equal(500); should
            expect(resp.body.length).to.eq(0);
          });
      });
    });

    describe('17. GET /api/admin/workspace-groups/{workspace_group_id}/admins', () => {
      it('200 positive test: should retrieve the list of admins for workspace-group group1', () => {
        cy.getAdminOfGroupAPI(Cypress.env(group1.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.body.length).to.equal(2);
            expect(resp.status).to.equal(200);
          });
      });

      it('200 positive test: should retrieve the list of admins for workspace-group group2', () => {
        cy.getAdminOfGroupAPI(Cypress.env(group2.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.body.length).to.equal(0);
            expect(resp.status).to.equal(200);
          });
      });

      it('401 negative test: User without admin credentials should not get the admins of a group.', () => {
        cy.getAdminOfGroupAPI(Cypress.env(group1.id),
          Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });

    describe('18. POST /api/group-admin/workspaces', () => {
      it('201 positive test: an group admin should create an ws', () => {
        cy.createWsAPI(Cypress.env(group1.id), ws1, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            Cypress.env(ws1.id, resp.body);
            expect(resp.status).to.equal(201);
          });
      });

      it('201 positive test: a normal user should create an ws', () => {
        cy.createWsAPI(Cypress.env(group1.id), ws2, Cypress.env(`token_${user2.username}`))
          .then(resp => {
            Cypress.env(ws2.id, resp.body);
            expect(resp.status).to.equal(201);
          });
      });

      it('401/201 negative test: an user with no credentials in der group can not create a ws', () => {
        cy.createWsAPI(Cypress.env(group2.id), ws3, Cypress.env(`token_${user2.username}`))
          .then(resp => {
            // expect(resp.status).to.equal(401); should
            Cypress.env(ws3.id, resp.body);
            expect(resp.status).to.equal(201);
          });
      });

      it('401 negative test: an false user can not create a ws', () => {
        cy.createWsAPI(Cypress.env(group2.id), ws1, noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: an admin user should not create a ws in a non-existing group', () => {
        cy.createWsAPI(noId, ws1, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
    });

    describe('19. PATCH /api/group-admin/workspaces/group-id', () => {
      it('200 positive test: should move ws1 from group1 to group2', () => {
        cy.setAdminsOfGroupAPI([Cypress.env(`id_${Cypress.env('username')}`), Cypress.env(`id_${user2.username}`)],
          Cypress.env(group2.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            cy.moveWsAPI(Cypress.env(ws1.id), Cypress.env(group2.id), Cypress.env(`token_${Cypress.env('username')}`))
              .then(resp2 => {
                expect(resp2.status).to.equal(200);
              });
          });
      });

      it('200 positive test: should move back ws1 from group2 to group1', () => {
        cy.moveWsAPI(Cypress.env(ws1.id), Cypress.env(group1.id), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp2 => {
            expect(resp2.status).to.equal(200);
          });
      });

      it('500 negative test: should not move to a non-existing group', () => {
        cy.moveWsAPI(Cypress.env(ws1.id), noId, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp2 => {
            expect(resp2.status).to.equal(500);
          });
      });

      it('500 negative test: should no update with no workspace data structure', () => {
        cy.moveWsAPI('', Cypress.env(group2.id), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp2 => {
            expect(resp2.status).to.equal(500);
          });
      });

      it('403 negative test: should no move ws1 to another group without credentials', () => {
        cy.setAdminsOfGroupAPI([Cypress.env(`id_${Cypress.env('username')}`)],
          Cypress.env(group2.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            cy.moveWsAPI(Cypress.env(ws3.id), Cypress.env(group1.id), Cypress.env(`token_${user2.username}`))
              .then(resp1 => {
                expect(resp1.status).to.equal(403);
              });
          });
      });

      it('401 negative test: should no move ws1 to another group without credentials', () => {
        cy.moveWsAPI(Cypress.env(ws1.id), Cypress.env(group2.id), noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });

    describe('20. GET /api/group-admin/workspaces/{id}', () => {
      it('200 positive test: should retrieve the a ws by id', () => {
        cy.createUserAPI(user3, Cypress.env(`token_${Cypress.env('username')}`))
          .then(res => {
            Cypress.env(`id_${user3.username}`, res.body);
            expect(res.status).to.equal(201);
            cy.getUsersFullAPI(false, Cypress.env(`token_${Cypress.env('username')}`))
              .then(resp => {
                expect(resp.status).to.equal(200);
                expect(resp.body.length).to.equal(3);
                cy.updateUsersOfWsAPI(Cypress.env(ws1.id),
                  AccessLevel.Developer,
                  Cypress.env(`id_${user3.username}`),
                  Cypress.env(`token_${Cypress.env('username')}`))
                  .then(resp2 => {
                    expect(resp2.status).to.equal(200);
                  });
                cy.loginAPI(user3.username, user3.password)
                  .then(resp3 => {
                    Cypress.env(`token_${user3.username}`, resp.body);
                    expect(resp3.status).to.equal(201);
                  });
              });
          });
        cy.getWsAPI(Cypress.env(ws1.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.body.name).to.equal(ws1.name);
            expect(resp.status).to.equal(200);
          });
      });

      it('401 negative test: should not return workspace if we do not pass a correct token', () => {
        cy.getWsAPI(Cypress.env(ws1.id),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('404 negative test: should not return workspace if we do not pass a correct id format', () => {
        cy.getWsAPI('',
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(404);
          });
      });

      it('404 negative test: should not return workspace if we do not pass a correct id ', () => {
        cy.getWsAPI(noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(404);
          });
      });
    });

    describe('21. PATCH /api/group-admin/workspaces/{id}/users', () => {
      it('401 negative test: should not update with incorrect token', () => {
        cy.updateUsersOfWsAPI(Cypress.env(ws1.id),
          AccessLevel.Developer,
          Cypress.env(`id_${Cypress.env('username')}`),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should not update a non existing user', () => {
        // #851 The internal error causes that the workspace do not have any user with credentials
        // when we run this test at the end of this block describe
        cy.updateUsersOfWsAPI(Cypress.env(ws1.id),
          AccessLevel.Basic,
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('500 negative test: should not update a non existing existing workspace', () => {
        cy.updateUsersOfWsAPI(noId,
          AccessLevel.Developer,
          Cypress.env(`id_${Cypress.env('username')}`),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('200 positive test: should update the user of a workspace', () => {
        const ac: AccessUser = {
          id: Cypress.env(`id_${Cypress.env('username')}`),
          access: AccessLevel.Admin
        };
        const ac2: AccessUser = {
          id: Cypress.env(`id_${user2.username}`),
          access: AccessLevel.Admin
        };
        cy.updateUserListOfWsAPI(Cypress.env(ws1.id), [ac, ac2], Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
        cy.updateUserListOfWsAPI(Cypress.env(ws2.id), [ac, ac2], Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
    });

    describe('22. GET /api/group-admin/workspaces/{id}/users', () => {
      it('200 positive test: should get the users of a workspace', () => {
        cy.getUsersOfWsAdminAPI(Cypress.env(ws1.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.body.length).to.equal(2);
            expect(resp.status).to.equal(200);
          });
      });

      it('401 negative test: should not return the users without an admin token', () => {
        cy.getUsersOfWsAdminAPI(Cypress.env(ws1.id),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('200/404 negative test: should not retrieve with a false ws id', () => {
        // #852 it should return a 404 error code, but it returns an ok.
        cy.getUsersOfWsAdminAPI(noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // expect(resp.status).to.equal(404); should
          });
      });
    });

    describe('23. GET /api/admin/workspace-groups/{id}/workspaces', () => {
      it('200 positive test: should get the workspaces of a workspace group', () => {
        cy.getWsByGroupAPI(Cypress.env(group1.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body.length).to.equal(2);
          });
      });

      it('401 negative test: without a valid token, should not return any workspace', () => {
        cy.getWsByGroupAPI(Cypress.env(group1.id),
          Cypress.env(`token_${user3.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: without token, should not return any workspace', () => {
        cy.getWsByGroupAPI(Cypress.env(group1.id),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: should fail with a invalid group workspace id', () => {
        cy.getWsByGroupAPI(noId,
          Cypress.env(`id_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });

    /** ************************************************************************* */
    describe('Admin verona API tests', () => {
      describe('25. POST /api/verona-modules', () => {
        it('201 positive test: Add schemer, player and editor with credentials ', () => {
          modules.forEach(m => {
            cy.addModuleAPI(m, Cypress.env(`token_${Cypress.env('username')}`))
              .then(resp => {
                expect(resp.status).to.equal(201);
              });
          });
        });
        it('401 negative test: should not add a module a false user', () => {
          cy.addModuleAPI(modules[0], noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
      });

      describe('26. GET /api/verona-modules', () => {
        it('200 positive test', () => {
          cy.getModulesAPI(Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              expect(resp.body.length).equal(3);
            });
        });

        it('401 negative test: should not get modules without token', () => {
          cy.getModulesAPI(noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
      });

      describe('27. GET /api/verona-modules/{key}', () => {
        it('200 positive test', () => {
          cy.getModuleAPI('iqb-schemer%402.5', Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              // const parser = new DOMParser();
              // mString(resp.body, 'text/html');
              // console.log(dom);
            });
        });

        it('401 negative test', () => {
          cy.getModuleAPI('iqb-schemer%402.0.0-beta', noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('404 negative test', () => {
          cy.getModuleAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(404);
            });
        });
      });
    });

    describe('Admin workspace unit API tests', () => {
      describe('30. POST /api/workspaces/{id}/units ', () => {
        it('201 positive test: should create a unit inside in ws1', () => {
          cy.createUnitAPI(Cypress.env(ws1.id), unit1, Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              Cypress.env(unit1.shortname, resp.body);
              expect(resp.status).to.equal(201);
            });
          cy.createUnitAPI(Cypress.env(ws2.id), unit2, Cypress.env(`token_${user2.username}`))
            .then(resp => {
              Cypress.env(unit2.shortname, resp.body);
              expect(resp.status).to.equal(201);
            });
        });

        it('500/201 negative test: should return try to create a second unit with same id within a ws', () => {
        // but it returns no error, but neither would insert a new record on the database.
          cy.createUnitAPI(Cypress.env(ws1.id), unit1, Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(201);
              // expect(resp.status).to.equal(500);  // should
            });
        });

        it('401 negative test: should not create the unit without valid token', () => {
          cy.createUnitAPI(Cypress.env(ws1.id), unit1, noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('401 negative test: should not create the unit without user with no credentials in the ws', () => {
          cy.createUnitAPI(Cypress.env(ws1.id), unit2, Cypress.env(`token_${user3.username}`))
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('500 negative test: should not create a unit in a non existent workspace', () => {
          cy.createUnitAPI(noId, unit1, Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });
      });

      describe('31. GET /api/admin/workspace-groups/units', () => {
        it('200 positive test: should return all units and the workspaces where they are located.', () => {
          cy.getUnitsAPI(Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              expect(resp.body.length).to.equal(2);
            });
        });

        it('401 negative test: normal user should not get the data', () => {
          cy.getUnitsAPI(Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('401 negative test: false token should not get the data', () => {
          cy.getUnitsAPI(noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
      });

      describe('32. PATCH /api/workspaces/{workspace_id}/settings', () => {
        it('200 positive test: should update the ws data', () => {
          cy.updateWsSettingsAPI(Cypress.env(ws1.id), setEditor, Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });

        it('500 negative test:  should not update the workspace with no group data', () => {
          cy.updateWsSettingsAPI(noId, setEditor, Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });

        it('401 negative test: should not update the workspace of which you are not a user', () => {
          cy.updateWsSettingsAPI(Cypress.env(ws1.id), setEditor, noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('500/200 negative test: should not update the workspace with wrong ws data format', () => {
          cy.updateWsSettingsAPI(Cypress.env(ws1.id), noId, Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              // expect(resp.status).to.equal(500); should
            });
        });
      });
    });

    describe('33. GET /api/workspaces/{workspace_id}', () => {
      // TODO ask achim other uses of this api
      it('200 positive test: should retrieve the a ws by id', () => {
        cy.getWsNormalAPI(Cypress.env(ws2.id),
          Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.body.name).to.equal(ws2.name);
            expect(resp.status).to.equal(200);
          });
      });

      it('401 negative test: should not return workspace if we do not pass a correct token', () => {
        cy.getWsNormalAPI(Cypress.env(ws2.id),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('404 negative test: should not return workspace if we do not pass a correct ws id ', () => {
        cy.getWsNormalAPI('',
          Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(404);
          });
      });

      it('403 negative test: should not return data if we are not users of that ws', () => {
        cy.getWsNormalAPI(Cypress.env(ws3.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp2 => {
            expect(resp2.status).to.equal(403);
          });
      });
    });

    describe('34. GET /api/workspaces/{workspace_id}/users', () => {
      it('200 positive test: retrieve the user of a ws', () => {
        cy.getUsersByWsAPI(Cypress.env(ws1.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body.users.length).to.equal(0);
            expect(resp.body.admins.length).to.equal(1);
            expect(resp.body.workspaceGroupAdmins.length).to.equal(1);
          });
      });

      it('401 negative test: should not return data passing a fake user', () => {
        cy.getUsersByWsAPI(Cypress.env(ws1.id), noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should not return data passing a wrong ws id', () => {
        cy.getUsersByWsAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
    });

    describe('Metadata block', () => {
      describe('35. GET /api/metadata/registry', () => {
        it('200 positive test: should get at least one profile', () => {
          cy.getRegistryAPI(Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              expect(resp.body.length).greaterThan(1);
            });
        });

        it('200 positive test: should get the first profile', () => {
          cy.getRegistryAPI(Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              const profile1 = resp.body[0].url.replace('profile-config.json', '') + resp.body[0].profiles[0];
              const profile2 = resp.body[0].url.replace('profile-config.json', '') + resp.body[0].profiles[1];
              Cypress.env('profile1', profile1);
              Cypress.env('profile2', profile2);
            });
        });

        it('401 negative test: without credentials is not allowed to get profiles', () => {
          cy.getRegistryAPI(noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
      });

      describe('36. GET /api/metadata/profiles', () => {
        it('200 positive test: should get data from the profile', () => {
          cy.getMetadataAPI(Cypress.env('profile1'), Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              Cypress.env('label1', resp.body.label[0].value);
            });
          cy.getMetadataAPI(Cypress.env('profile2'), Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              Cypress.env('label2', resp.body.label[0].value);
            });
        });

        it('401 negative test: without credentials is not allowed to get profiles', () => {
          cy.getMetadataAPI(Cypress.env('profile2'), noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('500/200 negative test: should fail if we ask for an inexistent profile', () => {
          cy.getMetadataAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              // expect(resp.status).to.equal(500); should
            });
        });
      });

      describe('37. UPDATE /api/workspace-groups/{workspace_group_id}', () => {
        it('200 positive test: should set metadata profile for a group ', () => {
          cy.updateGroupMetadataAPI(
            Cypress.env(group1.id),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });

        it('500 negative test: should not work with false group', () => {
          cy.updateGroupMetadataAPI(
            noId,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });

        it('401 negative test: should not work with false user', () => {
          cy.updateGroupMetadataAPI(
            Cypress.env(group1.id),
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('401 negative test: should not work without admin privileges', () => {
          cy.updateGroupMetadataAPI(
            Cypress.env(group1.id),
            Cypress.env(`token_${user3.username}`))
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
      });

      describe('38. GET /api/metadata/vocabularies', () => {
        it('200 positive test: should get the vocabulary of a specific profile', () => {
          cy.getVocabularyMetadataAPI(
            Cypress.env('profile1'),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });

        // At sweagger if we pass an incorrect url, it returns 500
        it('500/200 negative test: should fail with a false profile', () => {
          cy.getVocabularyMetadataAPI(
            noId,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });

        it('401 negative test: should fail with a false user', () => {
          cy.getVocabularyMetadataAPI(
            Cypress.env('profile1'),
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
      });

      describe('39. PATCH /api/workspaces/{workspace_id}/settings', () => {
        let newSettings: WsSettings;
        before(() => {
          newSettings = {
            defaultEditor: 'iqb-editor-aspect@2.9',
            defaultPlayer: 'iqb-player-aspect@2.9',
            defaultSchemer: 'iqb-schemer@2.5',
            stableModulesOnly: false,
            unitMDProfile: Cypress.env('profile1'),
            itemMDProfile: Cypress.env('profile2')
          };
        });

        it('401 negative test: should not load metadata with admin privileges in the ws', () => {
          cy.updateWsMetadataAPI(
            Cypress.env(ws1.id),
            newSettings,
            Cypress.env(`token_${user3.username}`))
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('401 negative test: should not load metadata with no token', () => {
          cy.updateWsMetadataAPI(
            Cypress.env(ws1.id),
            newSettings,
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('500 negative test: should not load metadata if we pass an non-existent ws', () => {
          cy.updateWsMetadataAPI(
            noId,
            newSettings,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });

        it('200 positive test: set metadata for a ws', () => {
          cy.updateWsMetadataAPI(
            Cypress.env(ws1.id),
            newSettings,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });
      });
    });

    describe('40. GET /api/workspaces/{workspace_id}/units/{id}/properties ', () => {
      it('200 positive test: should get the properties of an unit. ', () => {
        cy.getUnitPropertiesAPI(
          Cypress.env(ws1.id),
          Cypress.env(unit1.shortname),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            Cypress.env('unit1_properties', resp.body);
            expect(resp.status).to.equal(200);
          });
      });

      it('500 negative test: should not get the properties of an unit without ws id ', () => {
        cy.getUnitPropertiesAPI(
          noId,
          Cypress.env(unit1.shortname),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('404 negative test: should not get the properties of an unit without unit id ', () => {
        cy.getUnitPropertiesAPI(
          Cypress.env(ws1.id),
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(404);
          });
      });
      it('401 negative test: should not get the properties of an unit without credentials. ', () => {
        cy.getUnitPropertiesAPI(
          Cypress.env(ws1.id),
          Cypress.env(unit1.shortname),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });

    describe('41. PATCH /api/workspaces/{workspace_id}/units/{id}/properties', () => {
      let entry1: DefinitionUnit;
      before(() => {
        entry1 = {
          id: parseInt(`${Cypress.env(unit1.shortname)}`, 10),
          groupName: 'Bista'
        };
      });

      it('200 positive test: should be possible update unit definition', () => {
        cy.updateUnitPropertiesAPI(Cypress.env(ws1.id),
          Cypress.env(unit1.shortname),
          entry1,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });

      it('500 negative test: should return error 500 not passing the ws', () => {
        cy.updateUnitPropertiesAPI(noId,
          Cypress.env(unit1.shortname),
          entry1,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('500 negative test: should return error 500 not passing the the unit id', () => {
        cy.updateUnitPropertiesAPI(Cypress.env(ws1.id),
          noId,
          entry1,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('200/500 negative test: should return an error with incorrect data', () => {
        // Should not allow to pass incorrect structure
        cy.updateUnitPropertiesAPI(Cypress.env(ws1.id),
          Cypress.env(unit1.shortname),
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // expect(resp.status).to.equal(500); should
          });
      });

      it('401 negative test: should return error with no credentials', () => {
        cy.updateUnitPropertiesAPI(Cypress.env(ws1.id),
          Cypress.env(unit1.shortname),
          entry1,
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: should return error with user with no credentials on the ws', () => {
        cy.updateUnitPropertiesAPI(Cypress.env(ws1.id),
          Cypress.env(unit1.shortname),
          entry1,
          Cypress.env(`token_${user3.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });

    describe('42. GET /api/workspaces/{workspace_id}/units', () => {
      it('200 positive test: should get the units from a workspace', () => {
        // Sweagger has other parameter and we get error 521, sweagger needs the version
        // TO ASK parameters
        cy.getUnitsByWsAPI(Cypress.env(ws1.id), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp1 => {
            expect(resp1.status).to.equal(200);
            expect(resp1.body.length).to.equal(1);
          });
      });

      it('401 negative test: should fail with wrong credentials', () => {
        cy.getUnitsByWsAPI(Cypress.env(ws1.id), noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should fail with false workspace id', () => {
        cy.getUnitsByWsAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
    });

    describe('50. PATCH /api/workspaces/{workspace_id}/units/workspace-id', () => {
      it('401 negative test: should not move a test a user without credentials in the ws', () => {
        cy.moveToAPI(Cypress.env(ws1.id),
          Cypress.env(ws2.id),
          Cypress.env(unit1.shortname),
          Cypress.env(`token_${user3.username}`))
          .then(resp => {
            expect(resp.status).to.be.equal(401);
          });
      });

      it('200/500 negative test: this test should return 500, because unit2 is already ws2', () => {
        cy.moveToAPI(Cypress.env(ws1.id),
          Cypress.env(ws2.id),
          Cypress.env(unit2.shortname),
          Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.be.equal(200);
          });
      });

      it('500 negative test: should not move a non-existent unit', () => {
        cy.moveToAPI(Cypress.env(ws1.id),
          Cypress.env(ws2.id),
          noId,
          Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.be.equal(500);
          });
      });

      it('200 positive test: should able to move a unit from one ws to another', () => {
        cy.moveToAPI(Cypress.env(ws1.id),
          Cypress.env(ws2.id),
          Cypress.env(unit1.shortname),
          Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.be.equal(200);
          });
      });
    });

    describe('51. PATCH /api/workspaces/{workspace_id}/name', () => {
      it('200 positive test: should able rename a workspace with credentials', () => {
        cy.renameWsAPI(Cypress.env(ws1.id),
          '01Vorlage-New',
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });

      it('401 negative test: should not rename a workspace with no credentials', () => {
        cy.renameWsAPI(Cypress.env(ws1.id),
          '02Vorlage-New',
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should not rename any ws without valid id', () => {
        cy.renameWsAPI(noId,
          '03Vorlage-New',
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
    });

    describe('52. POST /api/workspaces/{workspace_id}/units', () => {
      let copyUnit: CopyUnit;
      before(() => {
        copyUnit = {
          createForm: parseInt(`${Cypress.env(unit2.shortname)}`, 10),
          groupName: 'Group_Copy',
          key: `${unit2.shortname}_copy`,
          name: unit2.name
        };
      });

      it('401 negative test: should not rename a workspace with no credentials', () => {
        cy.copyToAPI(Cypress.env(ws2.id),
          copyUnit,
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500/201 negative test: should return a internal error', () => {
        cy.copyToAPI(Cypress.env(ws2.id),
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(201);
            // expect(resp.status).to.equal(500); // should
          });
      });

      it('500 negative test: should return with a non-existent ws id', () => {
        cy.copyToAPI(noId,
          copyUnit,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('201 positive test: should able rename a workspace with credentials', () => {
        cy.copyToAPI(Cypress.env(ws2.id),
          copyUnit,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(201);
          });
      });
    });

    describe('54. GET /api/workspaces/{workspace_id}/groups', () => {
      before(() => {
        cy.createUnitAPI(Cypress.env(ws1.id), unit3, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            Cypress.env(unit3.shortname, resp.body);
            expect(resp.status).to.equal(201);
          });
        cy.createUnitAPI(Cypress.env(ws1.id), unit4, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            Cypress.env(unit4.shortname, resp.body);
            expect(resp.status).to.equal(201);
          });
      });
      it('200 positive test: should get the groups of a workspace', () => {
        cy.getGroupsOfWsAPI(Cypress.env(ws1.id), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body.length).to.equal(3);
          });
      });
      it('401 negative test: should not get the groups of a workspace without credentials', () => {
        cy.getGroupsOfWsAPI(Cypress.env(ws1.id), noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
      it('500 negative test: should not get the groups on a ws without a valid ws id', () => {
        cy.getGroupsOfWsAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
    });

    describe('55. PATCH /api/workspaces/{workspace_id}/group-name', () => {
      it('200 positive test: should add a group name for a workspace', () => {
        cy.updateGroupNameOfWsAPI(Cypress.env(ws1.id),
          'new group for w1',
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
      it('401 negative test: should not add a groups name for a workspace without credentials', () => {
        cy.updateGroupNameOfWsAPI(Cypress.env(ws1.id), 'no credentials Group', noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
      it('500 negative test: should not add a groups name for a workspace without a valid ws id', () => {
        cy.updateGroupNameOfWsAPI(noId, 'no valid Ws Group', Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
    });

    describe('55a. GET /api/workspaces/{workspace_id}/units/{id}/scheme', () => {
      it('200 positive test: should retrieve the scheme for a unit with credentials', () => {
        cy.getUnitSchemeAPI(
          Cypress.env(unit4.shortname),
          Cypress.env(ws1.id),
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
      });

      it('500 negative test: should not retrieve scheme without a valid unit id ', () => {
        cy.getUnitSchemeAPI(
          noId,
          Cypress.env(ws1.id),
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      });

      it('500 negative test: should not retrieve scheme without a valid ws id ', () => {
        cy.getUnitSchemeAPI(
          Cypress.env(unit4.shortname),
          noId,
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      });

      it('401 positive test: should not retrieve scheme with credentials', () => {
        cy.getUnitSchemeAPI(
          Cypress.env(unit4.shortname),
          Cypress.env(ws1.id),
          noId
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });
    });

    describe('55b. PATH /api/workspaces/{workspace_id}/units/{id}/definition', () => {
      before(() => {
        // 41, but with different parameters in body
        const authorization = `bearer ${Cypress.env(`token_${Cypress.env('username')}`)}`;
        const nu = parseInt(`${Cypress.env(unit4.shortname)}`, 10);
        cy.request({
          method: 'PATCH',
          url: `/api/workspaces/${Cypress.env(ws1.id)}/units/${Cypress.env(unit4.shortname)}/properties`,
          headers: {
            'app-version': Cypress.env('version'),
            authorization
          },
          body: {
            id: nu,
            editor: setEditor.defaultEditor,
            player: setEditor.defaultPlayer,
            schemer: setEditor.defaultSchemer
          }
        }).then(resp => {
          expect(resp.status).to.equal(200);
        });
      });

      it('500 negative test: should not add any text_area in the editor without a valid unit id ', () => {
        cy.updateUnitDefinitionAPI(
          noId,
          Cypress.env(ws1.id),
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      });

      it('500 negative test: should not add any text_area in the editor without a valid ws id ', () => {
        cy.updateUnitDefinitionAPI(
          Cypress.env(unit4.shortname),
          noId,
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      });

      it('401 positive test: should not add any textarea in the editor without credentials', () => {
        cy.updateUnitDefinitionAPI(
          Cypress.env(unit4.shortname),
          Cypress.env(ws1.id),
          noId
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('401 negative test: should not add any text area in the editor without a user with non credentials', () => {
        cy.updateUnitDefinitionAPI(
          Cypress.env(unit4.shortname),
          Cypress.env(ws1.id),
          Cypress.env(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('200 positive test: should be able to add a text area in the editor and save', () => {
        cy.updateUnitDefinitionAPI(
          Cypress.env(unit4.shortname),
          Cypress.env(ws1.id),
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
      });
    });

    describe('55c. GET /api/workspaces/{workspace_id}/units/{id}/definition', () => {
      it('500 negative test: should not retrieve an unit definition without a valid unit id ', () => {
        cy.getUnitDefinitionAPI(
          noId,
          Cypress.env(ws1.id),
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      });

      it('500 negative test: should not retrieve an unit definition without a valid ws id ', () => {
        cy.getUnitDefinitionAPI(
          Cypress.env(unit4.shortname),
          noId,
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      });

      it('401 positive test: should not retrieve an unit definition without credentials', () => {
        cy.getUnitDefinitionAPI(
          Cypress.env(unit4.shortname),
          Cypress.env(ws1.id),
          noId
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('401 positive test: should not retrieve an unit definition a user without credentials in the ws', () => {
        cy.getUnitDefinitionAPI(
          Cypress.env(unit4.shortname),
          Cypress.env(ws1.id),
          Cypress.env(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('200 positive test: should retrieve an unit definition', () => {
        cy.getUnitDefinitionAPI(
          Cypress.env(unit4.shortname),
          Cypress.env(ws1.id),
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
      });
    });

    describe('55d. UPDATE /api/workspaces/{workspace_id}/units/{id}/scheme', () => {
      it('500 negative test: should not code variable without a valid unit id ', () => {
        cy.updateUnitSchemeAPI(
          noId,
          Cypress.env(ws1.id),
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      });

      it('500 negative test: should not code variable without a valid ws id ', () => {
        cy.updateUnitSchemeAPI(
          Cypress.env(unit4.shortname),
          noId,
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      });

      it('401 positive test: should not code variable without credentials', () => {
        cy.updateUnitSchemeAPI(
          Cypress.env(unit4.shortname),
          Cypress.env(ws1.id),
          noId
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('401 negative test: should not code variable with a user with non credentials', () => {
        cy.updateUnitSchemeAPI(
          Cypress.env(unit4.shortname),
          Cypress.env(ws1.id),
          Cypress.env(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('200 positive test: should code variable with right credentials, unit, and ws', () => {
        cy.updateUnitSchemeAPI(
          Cypress.env(unit4.shortname),
          Cypress.env(ws1.id),
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
      });
    });

    describe('55e GET /api/workspaces/{workspace_id}/units/properties', () => {
      it('500 negative test: should not generate metadata report without a valid ws id ', () => {
        cy.getWsMetadataAPI(
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('401 positive test: should not generate metadata report without credentials', () => {
        cy.getWsMetadataAPI(
          Cypress.env(ws1.id),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: should not generate metadata report with a user with non credentials', () => {
        cy.getWsMetadataAPI(
          Cypress.env(ws1.id),
          Cypress.env(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('200 positive test: should generate metadata report with right credentials, unit, and ws', () => {
        cy.getWsMetadataAPI(
          Cypress.env(ws1.id),
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          // console.log(resp.body);
          expect(resp.body[0].name).to.equal('Tier3');
        });
      });
    });

    describe('55f GET /api/workspaces/{workspace_id}/units/scheme', () => {
      it('500 negative test: should not generate code variable report without a valid ws id ', () => {
        cy.getWsSchemeAPI(
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('401 positive test: should not generate code variable report without credentials', () => {
        cy.getWsSchemeAPI(
          Cypress.env(ws1.id),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: should not generate code variable report with a user with non credentials', () => {
        cy.getWsSchemeAPI(
          Cypress.env(ws1.id),
          Cypress.env(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('200 positive test: should generate code variable report with right credentials, unit, and ws', () => {
        cy.getWsSchemeAPI(
          Cypress.env(ws1.id),
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body[1].validation).to.equal('OK');
        });
      });
    });

    describe('55g PATH /api/workspaces/{workspace_id}/units/coding-book', () => {
      it('500 negative test: should not generate ws coding book without a valid ws id ', () => {
        cy.getWsCodingBookAPI([Cypress.env(unit3.shortname), Cypress.env(unit4.shortname)],
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('401 positive test: should not generate ws coding book without credentials', () => {
        cy.getWsCodingBookAPI([Cypress.env(unit3.shortname), Cypress.env(unit4.shortname)],
          Cypress.env(ws1.id),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: should not generate ws coding book with a user with non credentials', () => {
        cy.getWsCodingBookAPI([Cypress.env(unit3.shortname), Cypress.env(unit4.shortname)],
          Cypress.env(ws1.id),
          Cypress.env(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('200 positive test: should generate ws coding book with right credentials, unit, and ws', () => {
        cy.getWsCodingBookAPI([Cypress.env(unit3.shortname), Cypress.env(unit4.shortname)],
          Cypress.env(ws1.id),
          Cypress.env(`token_${Cypress.env('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          // console.log(resp.body);
        });
      });
    });
    // STATES
    describe('States block', () => {
      describe('58. PATCH /api/workspace-groups/{workspace_group_id}', () => {
        it('200 positive test: should add new states in a group with credentials', () => {
          cy.updateGroupPropertiesAPI(Cypress.env(group1.id), Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });

        it('401 negative test: should not add new states in a group without credentials', () => {
          cy.updateGroupPropertiesAPI(Cypress.env(group2.id), noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('500 negative test: should not add any new states with a invalid group id', () => {
          cy.updateGroupPropertiesAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });
      });
      describe('58a. GET /api/workspace-groups/{workspace_group_id}', () => {
        // It is used when we enter a ws
        it('200 positive test: should get the properties of a group with credentials', () => {
          cy.getGroupPropertiesAPI(Cypress.env(group1.id), Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });

        it('401 negative test: should not get the properties of a  group without credentials', () => {
          cy.getGroupPropertiesAPI(Cypress.env(group2.id), noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('500 negative test: should not add any new states with a invalid group id', () => {
          cy.updateGroupPropertiesAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });
      });

      // 41
      describe('59. PATCH /api/workspaces/{workspace_id}/units/{id}/properties ', () => {
        it('200 positive test: should assign the state 1 to the unit', () => {
          cy.updateUnitStateAPI(Cypress.env(group1.id),
            Cypress.env(unit3.shortname),
            '1',
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });

        it('401 negative test: should not assign the state 0 without credentials', () => {
          cy.updateUnitStateAPI(Cypress.env(group1.id),
            Cypress.env(unit3.shortname),
            '0',
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
        // This test should be negative and return 500. The status 5 does not exit.

        it('200/500 negative test: should not assign a not existent state', () => {
          cy.updateUnitStateAPI(Cypress.env(group1.id),
            Cypress.env(unit3.shortname),
            '5',
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });

        it('500 negative test: should not assign state without valid unit id ', () => {
          cy.updateUnitStateAPI(Cypress.env(group1.id),
            noId,
            '0',
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });

        it('500 negative test: should not assign a valid ws id', () => {
          cy.updateUnitStateAPI(noId,
            Cypress.env(unit3.shortname),
            '0',
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });
      });

      describe('61. GET /api/workspaces/{workspace_id}/units/{id}/metadata', () => {
        // I can not find the use in studio.
        // To delete, in sweagger, results are always two empty arrays: profiles and items
        it('200 positive test: should get the metadata of a workspace.', () => {
          cy.getUnitMetadataAPI(Cypress.env(ws2.id),
            Cypress.env(unit1.shortname),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              // console.log(resp.body);
            });
        });

        it('401 negative test: should not return the metadata of a ws without credentials', () => {
          cy.getUnitMetadataAPI(Cypress.env(ws1.id),
            Cypress.env(unit1.shortname),
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('500 negative test: should not return the metadata without specify an existent ws Id', () => {
          cy.getUnitMetadataAPI(noId,
            Cypress.env(unit1.shortname),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });
      });
    });

    describe('Dropbox block', () => {
      describe('62. PATCH /api/workspaces/{workspace_id}/drop-box', () => {
        it('401 negative test: should not assign as ws a dropbox without credentials', () => {
          cy.dropboxWsAPI(Cypress.env(ws1.id),
            Cypress.env(ws2.id),
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
        it('500 negative test: should not assign as dropbox ws for a non existent ws', () => {
          cy.dropboxWsAPI(noId,
            Cypress.env(ws2.id),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });
        it('500/200 negative test: should not assign as dropbox a non existent ws', () => {
          cy.dropboxWsAPI(Cypress.env(ws1.id),
            noId,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              // expect(resp.status).to.equal(500);  // should
            });
        });
        it('200 positive test: should assign ws as dropbox ws', () => {
          cy.dropboxWsAPI(Cypress.env(ws1.id),
            Cypress.env(ws2.id),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });
      });

      describe('63. PATCH /api/workspaces/{workspace_id}/units/drop-box-history', () => {
        it('401 negative test: should not submit units without credentials ', () => {
          cy.submitUnitsAPI(Cypress.env(ws1.id),
            Cypress.env(ws2.id),
            Cypress.env(unit3.shortname),
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
        it('500 negative test: should not submit without a ws origin', () => {
          cy.submitUnitsAPI(noId,
            Cypress.env(ws2.id),
            Cypress.env(unit3.shortname),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });
        it('500 negative test: should not submit units without a valid unit id', () => {
          cy.submitUnitsAPI(Cypress.env(ws1.id),
            Cypress.env(ws2.id),
            noId,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });
        it('500 negative test: should not submit a unit without a ws destination', () => {
          cy.submitUnitsAPI(Cypress.env(ws1.id),
            noId,
            Cypress.env(unit3.shortname),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });
        it('200 positive test: should submit a unit with ws origin, ws destination, unit id and credentials', () => {
          cy.submitUnitsAPI(Cypress.env(ws1.id),
            Cypress.env(ws2.id),
            Cypress.env(unit3.shortname),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });
      });

      describe('63b. PATCH /api/workspaces/{workspace_id}/units/drop-box-history', () => {
        it('401 negative test: should not return a submit unit without credentials', () => {
          cy.submitUnitsAPI(Cypress.env(ws2.id),
            '',
            Cypress.env(unit3.shortname),
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
        it('500 negative test: should not return a submit unit without origin ws', () => {
          cy.submitUnitsAPI(noId,
            '',
            Cypress.env(unit3.shortname),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });
        it('500 negative test: should not return a submit unit without valid unit id', () => {
          cy.submitUnitsAPI(Cypress.env(ws2.id),
            '',
            noId,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });
        it('200 positive test: should return a submit unit with ws origin, unit id and credentials', () => {
          cy.submitUnitsAPI(Cypress.env(ws2.id),
            '',
            Cypress.env(unit3.shortname),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });
      });
    });

    describe('Comments block', {}, () => {
      let comment: CommentData;
      before(() => {
        comment = {
          body: '<p>Kommentare 1 zur Aufgabe 1</p>',
          userName: `${user2.username}`,
          userId: parseInt(`${Cypress.env(`id_${user2.username}`)}`, 10),
          unitId: parseInt(`${Cypress.env(unit1.shortname)}`, 10)
        };
      });

      describe('65. POST /api/workspaces/{workspace_id}/units/{id}/comments', () => {
        it('201 positive test: should add a comment to a unit', () => {
          cy.postCommentAPI(Cypress.env(ws2.id),
            Cypress.env(unit1.shortname),
            comment,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              Cypress.env('comment1', resp.body);
              expect(resp.status).to.equal(201);
            });
        });

        it('401 negative test: should not add a comment without credentials in the ws', () => {
          cy.postCommentAPI(Cypress.env(ws2.id),
            Cypress.env(unit1.shortname),
            comment,
            Cypress.env(`token_${user3.username}`))
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('401 negative test: should not add a comment without credentials and wrong ws', () => {
          cy.postCommentAPI(Cypress.env(ws2.id),
            Cypress.env(unit1.shortname),
            comment,
            Cypress.env(`token_${user3.username}`))
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('201/500 negative test: should not add a comment if we pass a wrong ws but it does', () => {
          // Passing the wrong workspace doesn't affect to insert comment if we pass a valid unit
          // Should be 500
          const comment2: CommentData = {
            body: '<p>Kommentare 2 zur Aufgabe 1</p>',
            userName: `${user2.username}`,
            userId: parseInt(`${Cypress.env(`id_${user2.username}`)}`, 10),
            unitId: parseInt(`${Cypress.env(unit1.shortname)}`, 10)
          };
          cy.postCommentAPI(Cypress.env(ws1.id),
            Cypress.env(unit1.shortname),
            comment2,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              Cypress.env('comment2', resp.body);
              expect(resp.status).to.equal(201);
            });
        });

        it('500 negative test: should not add a comment if we pass no ws', () => {
          // Passing the wrong workspace doesn't affect to insert comment if we pass a valid unit
          const comment3: CommentData = {
            body: '<p>Kommentare 3 zur Aufgabe 1</p>',
            userName: `${user2.username}`,
            userId: parseInt(`${Cypress.env(`id_${user2.username}`)}`, 10),
            unitId: parseInt(`${Cypress.env(unit1.shortname)}`, 10)
          };
          cy.postCommentAPI(noId,
            Cypress.env(unit1.shortname),
            comment3,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });

        it('500 negative test: should not add a comment with wrong format', () => {
          cy.postCommentAPI(Cypress.env(ws2.id),
            Cypress.env(unit1.shortname),
            noId,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });
      });

      describe('66. GET /api/workspaces/{workspace_id}/units/{id}/comments', () => {
        it('200 positive test: should get all comments of the unit', () => {
          cy.getCommentsAPI(Cypress.env(ws2.id),
            Cypress.env(unit1.shortname),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.be.equal(200);
              expect(resp.body.length).to.be.equal(2);
            });
        });

        it('401 negative test: should not retrieve with no credentials', () => {
          cy.getCommentsAPI(Cypress.env(ws2.id),
            Cypress.env(unit1.shortname),
            noId)
            .then(resp => {
              expect(resp.status).to.be.equal(401);
            });
        });

        it('200 negative test: should not retrieve with wrong unit id', () => {
          cy.getCommentsAPI(Cypress.env(ws2.id),
            noId,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.be.equal(200);
              expect(resp.body.length).to.be.equal(0);
            });
        });

        it('500 negative test: should not retrieve with wrong ws id', () => {
          cy.getCommentsAPI(noId,
            Cypress.env(unit1.shortname),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.be.equal(500);
            });
        });
      });

      describe('67. PATCH /api/workspaces/{workspace_id}/units/{id}/comments', () => {
        it('200 positive test: should change the time stamp', () => {
          comment.lastSeenCommentChangedAt = new Date();
          cy.updateCommentTimeAPI(Cypress.env(ws1.id),
            Cypress.env(unit1.shortname),
            comment,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.be.equal(200);
            });
        });

        it('401 negative test: should not update the time stamp without credentials', () => {
          comment.lastSeenCommentChangedAt = new Date();
          cy.updateCommentTimeAPI(Cypress.env(ws1.id),
            Cypress.env(unit1.shortname),
            comment,
            noId)
            .then(resp => {
              expect(resp.status).to.be.equal(401);
            });
        });

        it('500 negative test: should not update the time stamp with wrong data', () => {
          comment.lastSeenCommentChangedAt = new Date();
          cy.updateCommentTimeAPI(noId,
            Cypress.env(unit1.shortname),
            comment,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.be.equal(500);
            });
        });
      });

      describe('67a. GET /api/workspaces/{workspace_id}/units/{id}/comments/last-seen', () => {
        it('200 positive test: should retrieve the last last seen time of comments of a unit', () => {
          cy.getCommentTimeAPI(Cypress.env(ws1.id),
            Cypress.env(unit1.shortname),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.be.equal(200);
            });
        });

        it('401 negative test: should not get last seen time of comments of a unit without credentials', () => {
          cy.getCommentTimeAPI(Cypress.env(ws1.id),
            Cypress.env(unit1.shortname),
            noId)
            .then(resp => {
              expect(resp.status).to.be.equal(401);
            });
        });

        it('500 negative test: should not get last seen time of comments of a unit with ws id', () => {
          cy.getCommentTimeAPI(noId,
            Cypress.env(unit1.shortname),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.be.equal(500);
            });
        });
      });

      describe('68. PATCH /api/workspaces/{workspace_id}/units/{id}/comments/{id}', () => {
        it('401 negative test: should not update comment although you were an admin', () => {
          comment.body = '<p>Kommentare 4 zur Aufgabe 1</p>';
          cy.updateCommentAPI(Cypress.env(ws2.id),
            Cypress.env(unit1.shortname),
            Cypress.env('comment1'),
            comment,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.be.equal(401);
            });
        });

        it('500 negative test: should not able to update a comment passing then wrong ws', () => {
          comment.body = '<p>Kommentare 4 zur Aufgabe 1</p>';
          cy.updateCommentAPI(noId,
            Cypress.env(unit1.shortname),
            Cypress.env('comment1'),
            comment,
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.be.equal(500);
            });
        });

        it('200/500 negative test: should not able to update a comment passing no unit', () => {
          // If we want to update a comment without unit id, return a 200, should 500
          comment.body = '<p>Kommentare 4 zur Aufgabe 1</p>';
          cy.updateCommentAPI(Cypress.env(ws2.id),
            noId,
            Cypress.env('comment1'),
            comment,
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.be.equal(200);
            });
        });

        it('401 negative test: should not able to update a comment if we dont pass the comment but the id', () => {
          comment.body = '<p>Kommentare 4 zur Aufgabe 1</p>';
          cy.updateCommentAPI(Cypress.env(ws2.id),
            Cypress.env(unit1.shortname),
            Cypress.env('comment1'),
            noId,
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.be.equal(401);
            });
        });

        it('200 positive test: should able to update a comment if you wrote it', () => {
          comment.body = '<p>Kommentare 48 zur Aufgabe 1</p>';
          cy.updateCommentAPI(Cypress.env(ws2.id),
            Cypress.env(unit1.shortname),
            Cypress.env('comment1'),
            comment,
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.be.equal(200);
            });
        });
      });

      describe('69. DELETE /api/workspaces/{workspace_id}/units/{id}/comments/{id}', () => {
        it('401 negative test: user with no credentials should not delete a comment', () => {
          cy.deleteCommentAPI(Cypress.env(ws2.id),
            Cypress.env(unit1.shortname),
            Cypress.env('comment2'),
            Cypress.env(`token_${user3.username}`))
            .then(resp => {
              expect(resp.status).to.be.equal(401);
            });
        });

        it('500 negative test: using false ws id, should us not allow to delete the comment', () => {
          cy.deleteCommentAPI(noId,
            Cypress.env(unit1.shortname),
            Cypress.env('comment2'),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.be.equal(500);
            });
        });

        it('200/500 negative test: using false comment id, should us not allow to delete the comment', () => {
          // it should be negative, but we get 200. But at least it deletes nothing
          cy.deleteCommentAPI(Cypress.env(ws2.id),
            Cypress.env(unit1.shortname),
            noId,
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.be.equal(200);
            });
        });

        it('200/500 negative test: using false unit id, should us not allow to delete the comment', () => {
          // This test get 200, but maybe should be 500, because we are using a no existent unit.
          // It does not need the unit.
          // to delete the comment. The check was only the right workspace and have the credentials
          cy.deleteCommentAPI(Cypress.env(ws2.id),
            noId,
            Cypress.env('comment2'),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.be.equal(200);
            });
        });

        it('200 positive test: admin should be able to delete comments', () => {
          cy.deleteCommentAPI(Cypress.env(ws2.id),
            Cypress.env(unit1.shortname),
            Cypress.env('comment1'),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.be.equal(200);
            });
        });
      });
    });

    describe('Review block', {}, () => {
      const reviewName1:string = 'Teil1';
      const reviewName2:string = 'Teil2';

      describe('70. POST /api/workspaces/{workspace_id}/reviews', () => {
        it('201 positive test: should add a new review in a workspace with credentials', () => {
          cy.addReviewAPI(Cypress.env(ws1.id),
            reviewName1,
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.be.equal(201);
              Cypress.env('id_review1', resp.body);
            });
          cy.addReviewAPI(Cypress.env(ws1.id),
            reviewName2,
            Cypress.env(`token_${user2.username}`))
            .then(res => {
              expect(res.status).to.be.equal(201);
              Cypress.env('id_review2', res.body);
            });
        });

        it('500 negative test: should not add a new review without a valid ws id', () => {
          cy.addReviewAPI(noId,
            reviewName2,
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.be.equal(500);
            });
        });

        it('401 negative test: should not add a new review without token', () => {
          cy.addReviewAPI(Cypress.env(ws1.id),
            reviewName2,
            noId)
            .then(resp => {
              expect(resp.status).to.be.equal(401);
            });
        });
      });

      describe('71. GET /api/workspaces/{workspace_id}/reviews/{ids}', () => {
        it('200 positive test: should get the reviews of a workspace with credentials', () => {
          cy.getReviewAPI(Cypress.env(ws1.id),
            Cypress.env('id_review1'),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.be.equal(200);
              Cypress.env('link_review1', resp.body.link);
            });
          cy.getReviewAPI(Cypress.env(ws1.id),
            Cypress.env('id_review2'),
            Cypress.env(`token_${user2.username}`))
            .then(resp2 => {
              expect(resp2.status).to.be.equal(200);
              Cypress.env('link_review2', resp2.body.link);
            });
        });

        it('500 negative test: should not get the reviews without a valid workspace', () => {
          cy.getReviewAPI(noId,
            Cypress.env('id_review1'),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.be.equal(500);
            });
        });

        it('401 negative test: should not get the reviews without credentials', () => {
          cy.getReviewAPI(Cypress.env(ws1.id),
            Cypress.env('id_review1'),
            noId)
            .then(resp => {
              expect(resp.status).to.be.equal(401);
            });
        });

        it('401 negative test: should not get the reviews without credentials', () => {
          cy.getReviewAPI(Cypress.env(ws1.id),
            Cypress.env('id_review1'),
            noId)
            .then(resp => {
              expect(resp.status).to.be.equal(401);
            });
        });
      });

      describe('72. PATCH /api/workspaces/{workspace_id}/reviews/{id}', () => {
        let review1: ReviewData;
        before(() => {
          review1 = {
            link: Cypress.env('link_review1'),
            id: parseInt(Cypress.env('id_review1'), 10),
            name: 'Teil1',
            units: [Cypress.env(unit4.shortname)]
          };
        });

        it('200 positive test: should update a review with credentials', () => {
          cy.updateReviewAPI(Cypress.env(ws1.id),
            review1,
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });

        it('500 negative test: should not update a review without ws id', () => {
          cy.updateReviewAPI(noId,
            review1,
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });

        it('401 negative test: should not update a review without credentials', () => {
          cy.updateReviewAPI(Cypress.env(ws1.id),
            review1,
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
      });

      describe('73. GET /api/workspaces/{workspace_id}/reviews/', () => {
        it('200 positive test: should get all reviews with credentials', () => {
          cy.getAllReviewAPI(Cypress.env(ws1.id),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              expect(resp.body.length).to.equal(2);
            });
        });

        it('500 negative test: should not get reviews without ws id', () => {
          cy.getAllReviewAPI(noId,
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });

        it('401 negative test: should not retrieve reviews without credentials', () => {
          cy.getAllReviewAPI(Cypress.env(ws1.id),
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
      });

      describe('74. GET /api/reviews/{review_id}', () => {
        it('200 positive test: should all reviews with credentials', () => {
          cy.getReviewWindowAPI(Cypress.env('id_review1'), Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              expect(resp.body.units[0]).equal(parseInt(Cypress.env(unit4.shortname), 10));
            });
        });

        it('404 negative test: should not get reviews without review id', () => {
          cy.getReviewWindowAPI(noId, Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(404);
            });
        });

        it('401 negative test: should not retrieve reviews without credentials', () => {
          cy.getReviewWindowAPI(Cypress.env('id_review1'), noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
      });

      describe('75. GET /api/reviews/{review_id}/units/{id}/properties', () => {
        it('200 positive test: should get the review properties with credentials', () => {
          cy.getReviewPropertiesAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              expect(resp.body.name).to.equal('Tier4');
            });
        });

        it('500 negative test: should not get review properties without review id', () => {
          // it returns 200 instead of 500
          cy.getReviewPropertiesAPI(noId,
            Cypress.env(unit4.shortname),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });

        it('500 negative test: should not get review properties without unit id', () => {
          cy.getReviewDefinitionAPI(Cypress.env('id_review1'),
            noId,
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });

        it('401 negative test: should not get review properties without credentials', () => {
          cy.getReviewDefinitionAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
      });

      describe('76. GET /api/reviews/{review_id}/units/{id}/definition', () => {
        it('200 positive test: should the review definition with credentials', () => {
          cy.getReviewDefinitionAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              expect(resp.body.variables[1].id).to.be.oneOf(['text_1', 'text-area_1']);
            });
        });

        it('200/500 negative test: should not get reviews without review id', () => {
          // it returns 200 instead of 500
          cy.getReviewDefinitionAPI(noId,
            Cypress.env(unit4.shortname),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              // expect(resp.status).to.equal(500); should
            });
        });

        it('500 negative test: should not get reviews without unit id', () => {
          cy.getReviewDefinitionAPI(Cypress.env('id_review1'),
            noId,
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });

        it('401 negative test: should not retrieve reviews without credentials', () => {
          cy.getReviewDefinitionAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
      });

      describe('77. GET /api/reviews/{review_id}/units/{id}/scheme', () => {
        it('200 positive test: should the review scheme with credentials', () => {
          cy.getReviewSchemeAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              expect(resp.body.schemeType).to.equal('iqb@3.0');
              expect(resp.body.variables[1].id).to.be.oneOf(['text_1', 'text-area_1']);
            });
        });

        it('500 negative test: should not get review scheme without review id', () => {
          // it returns 200 instead of 500
          cy.getReviewSchemeAPI(noId,
            Cypress.env(unit4.shortname),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              // expect(resp.status).to.equal(500); should
            });
        });

        it('500 negative test: should not get review scheme without unit id', () => {
          cy.getReviewSchemeAPI(Cypress.env('id_review1'),
            noId,
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });

        it('401 negative test: should not retrieve review scheme without credentials', () => {
          cy.getReviewSchemeAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
      });

      describe('78. POST /api/reviews/{review_id}/units/{unit_id}/comments}', () => {
        let cd: CommentData;
        before(() => {
          cd = {
            body: 'New comment from review',
            parentId: undefined,
            unitId: parseInt(Cypress.env(unit4.shortname), 10),
            userId: parseInt(Cypress.env(`id_${Cypress.env('username')}`), 10),
            userName: Cypress.env('username')
          };
        });

        it('201/500 negative test: should not create comment in review without review id', () => {
          // It creates a comment in the db. But it should be 500 instead of 201
          cd.body = 'New comment review created without review id in the path';
          cy.createCommentReviewAPI(noId,
            Cypress.env(unit4.shortname),
            cd,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(201);
              Cypress.env('id_commentReview_neg1', resp.body);
              // expect(resp.status).to.equal(500); should
            });
        });

        it('201/500 negative test: should not create comment in review without unit id', () => {
          // It creates a comment in the db. But it should be 500 instead of 201
          cd.body = 'New comment review created without unit id in the path';
          cy.createCommentReviewAPI(Cypress.env('id_review1'),
            noId,
            cd,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(201);
              Cypress.env('id_commentReview_neg2', resp.body);
              // expect(resp.status).to.equal(500); //should
            });
        });

        it('401 negative test: should not create comment in review without credentials', () => {
          cy.createCommentReviewAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            cd,
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('201 positive test: should create a comment in review with credentials', () => {
          cd.body = 'New comment review';
          cy.createCommentReviewAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            cd,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(201);
              Cypress.env('id_commentReview', resp.body);
            });
        });
      });

      describe('79. GET /api/reviews/{review_id}/units/{unit_id}/comments}', () => {
        it('500 negative test: should not get comment in review without review id', () => {
          cy.getCommentReviewAPI(noId,
            Cypress.env(unit4.shortname),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              expect(resp.body.length).to.equal(3);
              // expect(resp.status).to.equal(500); //should
              // it returns an array with three comment reviews, but it should return an error
            });
        });

        it('500 negative test: should not create comment review without unit id', () => {
          cy.getCommentReviewAPI(Cypress.env('id_review1'),
            noId,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              expect(resp.body.length).to.equal(0);
              // expect(resp.status).to.equal(500); //should
              // it returns an empty array and should return an error
            });
        });

        it('401 negative test: should not get comment review without credentials', () => {
          cy.getCommentReviewAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('200 positive test: should get comment review with credentials', () => {
          cy.getCommentReviewAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              expect(resp.body.length).to.equal(3);
            });
        });
      });

      describe('80. PATCH /api/reviews/{review_id}/units/{unit_id}/comments/{id}', () => {
        let mcd: CommentData;
        before(() => {
          mcd = {
            body: 'New comment from review',
            userId: parseInt(Cypress.env(`id_${Cypress.env('username')}`), 10)
          };
        });
        it('200/500 negative test: should not update comment review without review id', () => {
          mcd.body = 'Update comment review created without review id in the path';
          cy.updateCommentReviewAPI(noId,
            Cypress.env(unit4.shortname),
            Cypress.env('id_commentReview_neg1'),
            mcd,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              // expect(resp.status).to.equal(500); //should
            });
        });

        it('200/500 negative test: should ot update comment review without unit id', () => {
          mcd.body = 'Update comment review created without unit id in the path';
          cy.updateCommentReviewAPI(Cypress.env('id_review1'),
            noId,
            Cypress.env('id_commentReview_neg2'),
            mcd,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              // expect(resp.status).to.equal(500); //should
            });
        });

        it('404 negative test: should not update comment review without comment id', () => {
          cy.updateCommentReviewAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            noId,
            mcd,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(404);
            });
        });

        it('200/500 negative test: should not update comment review without comment data', () => {
          // It does not update the database, but it should return an error 400
          cy.updateCommentReviewAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            Cypress.env('id_commentReview_neg2'),
            noId,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              // expect(resp.status).to.equal(400); should
            });
        });

        it('401 negative test: should not update comment review without credentials', () => {
          cy.updateCommentReviewAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            Cypress.env('id_commentReview'),
            mcd,
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('200 positive test: should update comment review with credentials', () => {
          mcd.body = 'Update comment from review';
          cy.updateCommentReviewAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            Cypress.env('id_commentReview'),
            mcd,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });
      });

      describe('80A. DELETE /api/reviews/{review_id}/units/{unit_id}/comments/{id}', () => {
        it('200/500 negative test: should not delete comment review without review id', () => {
          // The test deletes record in the db
          cy.deleteCommentReviewAPI(noId,
            Cypress.env(unit4.shortname),
            Cypress.env('id_commentReview_neg1'),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              // expect(resp.status).to.equal(500); //should
            });
        });

        it('200/500 negative test: should ot update comment review without unit id', () => {
          // The test deletes record in the db
          cy.deleteCommentReviewAPI(Cypress.env('id_review1'),
            noId,
            Cypress.env('id_commentReview_neg2'),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
              // expect(resp.status).to.equal(500); //should
            });
        });

        it('200 negative test: should not delete comment review without comment id', () => {
          // The test deletes record in the db
          cy.deleteCommentReviewAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            noId,
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });

        it('401 negative test: should not delete comment review without credentials', () => {
          cy.deleteCommentReviewAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            Cypress.env('id_commentReview'),
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });

        it('200 positive test: should update comment review with credentials', () => {
          cy.deleteCommentReviewAPI(Cypress.env('id_review1'),
            Cypress.env(unit4.shortname),
            Cypress.env('id_commentReview'),
            Cypress.env(`token_${Cypress.env('username')}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });
      });

      describe('81. DELETE /api/workspaces/{workspace_id}/reviews/{ids}', () => {
        it('200 positive test: should delete a review with credentials', () => {
          cy.deleteReviewAPI(Cypress.env(ws2.id),
            Cypress.env('id_review1'),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(200);
            });
        });

        it('500 negative test: should not delete already deleted', () => {
          cy.deleteReviewAPI(noId,
            Cypress.env('id_review2'),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });

        it('500 negative test: should not delete a review without ws id', () => {
          cy.deleteReviewAPI(noId,
            Cypress.env('id_review2'),
            Cypress.env(`token_${user2.username}`))
            .then(resp => {
              expect(resp.status).to.equal(500);
            });
        });

        it('401 negative test: should not delete a review without credentials', () => {
          cy.deleteReviewAPI(Cypress.env(ws2.id),
            Cypress.env('id_review2'),
            noId)
            .then(resp => {
              expect(resp.status).to.equal(401);
            });
        });
      });
    });

    describe('82. GET /api/workspaces/{workspace_id}/users/{user_id}', () => {
      it('401 negative test: should not retrieve the ws data for the user without token ', () => {
        cy.getWsForUserAPI(Cypress.env(ws1.id),
          Cypress.env(`id_${Cypress.env('username')}`),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should not retrieve with non existent workspace', () => {
        cy.getWsForUserAPI(noId,
          Cypress.env(`id_${Cypress.env('username')}`),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('500 negative test: should not retrieve without a valid workspace', () => {
        cy.getWsForUserAPI(noId,
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
      it('200 positive test: should a user get the workspace by ws id', () => {
        cy.getWsForUserAPI(Cypress.env(ws1.id),
          Cypress.env(`id_${Cypress.env('username')}`),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
    });

    describe('83. DELETE /api/workspaces/{workspace_id}/units/{ids}', () => {
      it('401 negative test: should not delete the unit from other user', () => {
        cy.deleteUnitsAPI([Cypress.env(unit1.shortname)],
          Cypress.env(ws1.id),
          Cypress.env(`token_${user3.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: should not delete the unit without token ', () => {
        cy.deleteUnitsAPI([Cypress.env(unit1.shortname)],
          Cypress.env(ws1.id),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should not delete the unit with non existent workspace', () => {
        cy.deleteUnitsAPI([Cypress.env(unit2.shortname)],
          noId,
          Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('401 negative test: should not delete the unit with wrong workspace', () => {
        cy.deleteUnitsAPI([Cypress.env(unit2.shortname)],
          Cypress.env(ws1.id),
          Cypress.env(`token_${user3.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('200 positive test: a normal user should delete their own unit', () => {
        // Delete 2 units at time
        const ids = [
          Cypress.env(unit2.shortname),
          Cypress.env(unit1.shortname)];

        cy.deleteUnitsAPI(ids,
          Cypress.env(ws2.id),
          Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
    });
  });

  /** ************************************************************************* */
  describe('Admin home API tests', () => {
    describe('84. GET /api/my-data', () => {
      it('200 positive test: should be able to get own data', () => {
        cy.getMyData(Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body.description).to.equal('first initial user');
          });
      });

      it('401 negative test: should not retrieve own data without credentials', () => {
        cy.getMyData(noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: a normal user should not retrieve their own data', () => {
        cy.getMyData(Cypress.env(`token_${user3.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('200 positive test: a super user should retrieve their own data', () => {
        cy.getMyData(Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body.description).to.equal(null);
          });
      });
    });

    describe('85. PATCH /api/my-data', () => {
      let data: MyData;
      let data1: MyData;
      before(() => {
        data = {
          id: `${Cypress.env(`id_${Cypress.env('username')}`)}`,
          description: '',
          email: 'first@user.es',
          lastName: 'First',
          firstName: 'User',
          emailPublishApproved: false
        };
        data1 = {
          id: `${Cypress.env(`id_${user2.username}`)}`,
          description: '',
          email: 'second@user.es',
          lastName: 'Second',
          firstName: 'User',
          emailPublishApproved: false
        };
      });

      it('200 positive test: should update own data', () => {
        cy.updateMyData(Cypress.env(`token_${Cypress.env('username')}`), data)
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });

      it('401 negative test: should able to update other superadmin data', () => {
        cy.updateMyData(Cypress.env(`token_${Cypress.env('username')}`), data1)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: should not able to modify a non-existent user data', () => {
        data.id = noId;
        cy.updateMyData(Cypress.env(`token_${Cypress.env('username')}`), data)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: should not modify data without credentials', () => {
        cy.updateMyData(noId, data)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });
  });

  /** ************************************************************************* */
  describe('Admin users workspaces API tests', () => {
    describe('86. GET /api/group-admin/users/{id}/workspaces', () => {
      it('200 positive test: should get the workspaces by admin user id', () => {
        cy.getWsByUserAPI(Cypress.env(`id_${Cypress.env('username')}`),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body[1].userAccessLevel).to.equal(4);
          });
      });

      it('200 positive test: should get the workspaces by normal user id', () => {
        cy.getWsByUserAPI(Cypress.env(`id_${user2.username}`),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body[1].name).to.equal(ws2.name);
          });
      });

      it('200/401 negative test: should not get the workspaces of which you are not a user', () => {
        // This test should be negative 401, we can not retrieve if we only have the token from other user
        cy.getWsByUserAPI(Cypress.env(`id_${Cypress.env('username')}`),
          Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body[0].userAccessLevel).to.equal(4);
            // expect(resp.status).to.equal(401); should
          });
      });

      it('401 negative test: should not get the workspaces without token', () => {
        cy.getWsByUserAPI(Cypress.env(`id_${Cypress.env('username')}`),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('404/200 negative test: should not get the workspaces with a false user Id', () => {
        // This test should be negative 404, but it returns an empty array
        cy.getWsByUserAPI(noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // expect(resp.status).to.equal(404); should
          });
      });
    });

    describe('86a. UPDATE /api/group-admin/users/{id}/workspaces', () => {
      it('200 positive test: should an group-admin user modify the access level for other users', () => {
        // The body structure id different to sweagger.
        cy.updateWsByUserAPI(Cypress.env(`id_${user2.username}`),
          Cypress.env(group1.id),
          [Cypress.env(ws2.id)],
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });

      it('401 positive test: a non-eligible user should not modify the access level for other users.', () => {
        cy.updateWsByUserAPI(Cypress.env(`id_${Cypress.env('username')}`),
          Cypress.env(group1.id),
          [Cypress.env(ws1.id)],
          Cypress.env(`token_${user3.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should an group-admin user not modify ' +
        'the access level for a workspace without a valid groupId', () => {
        cy.updateWsByUserAPI(Cypress.env(`id_${Cypress.env('username')}`),
          noId,
          [Cypress.env(ws1.id)],
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('500 negative test: should an group-admin user not modify the access level for no-existent user', () => {
        cy.updateWsByUserAPI(noId,
          Cypress.env(group1.id),
          [Cypress.env(ws1.id)],
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
    });

    describe('87. GET /api/admin/users/{id}/workspace-groups', () => {
      it('200 positive test: should get the workspace-group by admin user id', () => {
        cy.getGroupsByUserAPI(Cypress.env(`id_${Cypress.env('username')}`),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body[0].name).to.equal(group2.name);
          });
      });

      it('401 negative test: should not get the workspace-groups by normal user id', () => {
        cy.getGroupsByUserAPI(Cypress.env(`id_${user2.username}`),
          Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: should not get the workspace-groups  without token', () => {
        cy.getGroupsByUserAPI(Cypress.env(`id_${Cypress.env('username')}`),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('200/404 negative test: should not get the workspace-groups with a false user Id', () => {
        // This test should be negative 404, but it returns an empty array
        cy.getGroupsByUserAPI(noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // expect(resp.status).to.equal(404); should
            expect(resp.body.length).to.equal(0);
          });
      });
    });

    describe('87a. PATCH /api/admin/users/{id}/workspace-groups', () => {
      it('200 positive test: should update the workspace-groups accessible for the user', () => {
        cy.updateGroupsByUserAPI(Cypress.env(`id_${Cypress.env('username')}`),
          [Cypress.env(group2.id)],
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });

      it('401 negative test: should not update the workspace-groups accessible for a user a normal user', () => {
        cy.updateGroupsByUserAPI(Cypress.env(`id_${Cypress.env('username')}`),
          [Cypress.env(group2.id)],
          Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: should not update the workspace-groups accessible' +
        ' for a user without a valid token', () => {
        cy.updateGroupsByUserAPI(Cypress.env(`id_${Cypress.env('username')}`),
          [Cypress.env(group1.id)],
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should not update the user workspace-groups without group ids', () => {
        cy.updateGroupsByUserAPI(Cypress.env(`id_${Cypress.env('username')}`),
          [noId],
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('500 negative test: should not get the workspace-groups with a false user Id', () => {
        cy.updateGroupsByUserAPI(noId,
          [Cypress.env(group1.id)],
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
    });

    describe('88. DELETE /api/group-admin/workspaces/{ids}', () => {
      it('200/500 negative test: should fail by not passing the workspace', () => {
        cy.deleteWsAPI([noId], Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // expect(resp.status).to.equal(500); should
          });
      });
      it('401 negative test: should fail without token', () => {
        cy.deleteWsAPI([Cypress.env(ws2.id)], noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
      it('200 positive test: should delete a list of workspaces ', () => {
        cy.deleteWsAPI([Cypress.env(ws1.id), Cypress.env(ws2.id)], Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
      it('200/500 negative test: should fail if you try to delete an already deleted workspace', () => {
        cy.deleteWsAPI([Cypress.env(ws2.id)], Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // expect(resp.status).to.equal(500); should
          });
      });
    });

    describe('89. DELETE /api/admin/workspace-groups', () => {
      let qs: string[];
      before(() => {
        qs = [Cypress.env(group1.id), Cypress.env(group2.id)];
      });
      it('401 negative test: should not delete workspace groups a normal user', () => {
        cy.deleteGroupsAPI(qs, Cypress.env(`token_${user2.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('404/200 negative test: should fail with a non-existent group', () => {
        // This test should have 404 response, but we get 200
        cy.deleteGroupsAPI([noId], Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // expect(resp.status).to.equal(404); // should
          });
      });

      it('200 positive test: should delete workspace groups an admin', () => {
        cy.deleteGroupsAPI(qs, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            Cypress.env(group2.id, '');
            Cypress.env(group1.id, '');
            expect(resp.status).to.equal(200);
          });
      });
    });

    describe('90. DELETE /api/admin/verona-modules', () => {
      let qs: string[];
      before(() => {
        qs = [];
        modules.forEach(mo => {
          qs.push(getNameAt(mo));
        });
      });
      it('401 negative test: should not delete a module without credentials', () => {
        cy.deleteModulesAPI([getNameAt('iqb-schemer@2.0.0-beta')], noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
      it('500/200 negative test: should not allow delete a non existent module', () => {
        cy.deleteModulesAPI([noId], Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // expect(resp.status).to.equal(500); should
          });
      });
      it('200 positive test: should delete the list of modules', () => {
        cy.deleteModulesAPI(qs, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
    });

    describe('91. DELETE /api/admin/users/id ', () => {
      it('404/200 negative test: should return user not found if we pass a false id', () => {
        cy.deleteUserAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // expect(resp.status).to.equal(404); should
          });
      });

      it('401 negative test: should not delete a user without credentials', () => {
        cy.deleteUserAPI(Cypress.env(`id_${user3.username}`), noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('200 positive test: should delete user', () => {
        cy.deleteUserAPI(Cypress.env(`id_${user2.username}`), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
        cy.deleteUserAPI(Cypress.env(`id_${user3.username}`), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
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
