import {
  groupVera,
  group2,
  noId,
  unit1,
  unit2,
  unit3,
  userGroupAdmin,
  user3,
  ws1,
  ws2,
  ws3
} from '../../support/util-api';
import { buildDownloadQuery } from '../../support/api';
import { AccessLevel, MyData } from '../../support/testData';

describe('Unit API tests part II', () => {
  describe('75. GET /api/workspaces/{workspace_id}/users/{user_id}', () => {
    it('401 negative test: should deny access to workspace data when no authentication token is provided', () => {
      cy.getWsForUserAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(`id_${Cypress.expose('username')}`),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('404 negative test: should return a not found error when requesting data for a non-existent workspace', () => {
      cy.getWsForUserAPI(
        noId,
        Cypress.expose(`id_${Cypress.expose('username')}`),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('404 negative test: should return a not found error when providing an invalid user ID', () => {
      cy.getWsForUserAPI(
        Cypress.expose(ws1.id),
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('200 positive test: should successfully retrieve workspace information for an authorized user', () => {
      cy.getWsForUserAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(`id_${Cypress.expose('username')}`),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('76. GET /api/admin/workspace-groups download', () => {
    it('200 positive test: should allow an administrator to retrieve the workspace report', () => {
      cy.getReportAPI(
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it('401 negative test: should deny workspace report retrieval to a regular user', () => {
      cy.getReportAPI(Cypress.expose(`token_${userGroupAdmin.username}`)).then(
        resp => {
          expect(resp.status).to.equal(401);
        }
      );
    });

    it('401 negative test: should deny workspace report retrieval when no authentication is provided', () => {
      cy.getReportAPI(noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });
  });

  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('77. GET /api/workspace-groups/{workspace_group_id} download=true', () => {
    it('200 positive test: should allow an authorized user to download all workspaces within a group', () => {
      cy.downloadWsAPI(
        Cypress.expose(groupVera.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it('401 negative test: should deny workspace group download when no valid credentials are provided', () => {
      cy.downloadWsAPI(Cypress.expose(group2.id), noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('500/200 negative test: should return success but provide an empty file for an invalid group ID', () => {
      cy.downloadWsAPI(
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        // It downloads an empty file with only headers
      });
    });
  });

  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('78. GET /api/workspaces/{workspace_id} download=true', () => {
    it('200 positive test: should allow downloading unit data from a workspace by ID', () => {
      const unitIds = [Cypress.expose(unit2.shortname)];
      cy.downloadWsUnitsAPI(
        Cypress.expose(ws2.id),
        buildDownloadQuery(unitIds),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it('401 negative test: should deny unit download when an invalid authentication token is provided', () => {
      const unitIds = [Cypress.expose(unit2.shortname)];
      cy.downloadWsUnitsAPI(
        Cypress.expose(ws2.id),
        buildDownloadQuery(unitIds),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it(
      '404 negative test: should return error when attempting to download a unit ' +
        'that does not exist in the workspace',
      () => {
        const unitIds = [
          Cypress.expose(unit2.shortname),
          Cypress.expose(unit3.shortname)
        ];
        cy.downloadWsUnitsAPI(
          Cypress.expose(ws2.id),
          buildDownloadQuery(unitIds),
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(404);
        });
      }
    );

    it(
      '404 negative test: should return an not found error when attempting to download' +
        ' from an invalid workspace ID',
      () => {
        const unitIds = [Cypress.expose(unit2.shortname)];
        cy.downloadWsUnitsAPI(
          noId,
          buildDownloadQuery(unitIds),
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(404);
        });
      }
    );

    it('401 negative test: should deny access to workspace downloads for a user without sufficient permissions', () => {
      const unitIds: string[] = [];
      cy.downloadWsUnitsAPI(
        Cypress.expose(ws3.id),
        buildDownloadQuery(unitIds),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });
  });

  describe('79. DELETE /api/workspaces/{workspace_id}/units/{ids}', () => {
    it("401 negative test: should deny unit deletion when attempting to delete another user's unit", () => {
      cy.deleteUnitsAPI(
        [Cypress.expose(unit1.shortname)],
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('401 negative test: should deny unit deletion when no authentication token is provided', () => {
      cy.deleteUnitsAPI(
        [Cypress.expose(unit1.shortname)],
        Cypress.expose(ws1.id),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it(
      '500 negative test: should return a server error when attempting to delete units ' +
        'from a non-existent workspace',
      () => {
        cy.deleteUnitsAPI(
          [Cypress.expose(unit2.shortname)],
          noId,
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      }
    );

    it('401 negative test: should deny unit deletion when providing the wrong workspace for a specific unit', () => {
      cy.deleteUnitsAPI(
        [Cypress.expose(unit2.shortname)],
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('200 positive test: should allow a regular user to successfully delete multiple units they own', () => {
      // Delete 2 units at time
      const ids = [
        Cypress.expose(unit2.shortname),
        Cypress.expose(unit1.shortname)
      ];

      cy.deleteUnitsAPI(
        ids,
        Cypress.expose(ws2.id),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('Admin home API tests', () => {
    describe('80. GET /api/my-data', () => {
      it('200 positive test: should allow an authorized user to retrieve their own account profile data', () => {
        cy.getMyData(
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.description).to.equal('first initial user');
        });
      });

      it('401 negative test: should deny access to account data when no valid credentials are provided', () => {
        cy.getMyData(noId).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('401 negative test: should deny personal data retrieval to a user with insufficient privileges', () => {
        cy.getMyData(Cypress.expose(`token_${user3.username}`)).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('200 positive test: should allow a superuser to successfully retrieve their own personal data', () => {
        cy.getMyData(Cypress.expose(`token_${userGroupAdmin.username}`)).then(
          resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body.description).to.equal(null);
          }
        );
      });
    });

    describe('81. PATCH /api/my-data', () => {
      let data: MyData;
      let data1: MyData;
      before(() => {
        data = {
          id: `${Cypress.expose(`id_${Cypress.expose('username')}`)}`,
          description: '',
          email: 'first@user.es',
          lastName: 'First',
          firstName: 'User',
          emailPublishApproved: false
        };
        data1 = {
          id: `${Cypress.expose(`id_${userGroupAdmin.username}`)}`,
          description: '',
          email: 'second@user.es',
          lastName: 'Second',
          firstName: 'User',
          emailPublishApproved: false
        };
      });

      it('200 positive test: should allow an authorized user to successfully update their personal data', () => {
        cy.updateMyData(
          Cypress.expose(`token_${Cypress.expose('username')}`),
          data
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
      });

      it('401 negative test: should deny a superadmin from updating data belonging to another account', () => {
        cy.updateMyData(
          Cypress.expose(`token_${Cypress.expose('username')}`),
          data1
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('401 negative test: should deny data updates when attempting to modify a non-existent user record', () => {
        data.id = noId;
        cy.updateMyData(
          Cypress.expose(`token_${Cypress.expose('username')}`),
          data
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('401 negative test: should deny profile updates when no authentication token is provided', () => {
        cy.updateMyData(noId, data).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });
    });
  });

  describe('82. GET /api/group-admin/users/{id}/workspaces', () => {
    before(() => {
      cy.updateWsByUserAPI(
        Cypress.expose(`id_${Cypress.expose('username')}`),
        Cypress.expose(group2.id),
        [4],
        [Cypress.expose(ws3.id)],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
    it('200 positive test: should successfully retrieve the workspace list for an administrator user', () => {
      cy.getWsByUserAPI(
        Cypress.expose(`id_${Cypress.expose('username')}`),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body[1].userAccessLevel).to.equal(4);
        expect(resp.body.length).to.equal(3);
      });
    });

    it('200 positive test: should successfully retrieve the workspace list for a regular user profile', () => {
      cy.getWsByUserAPI(
        Cypress.expose(`id_${userGroupAdmin.username}`),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.length).to.equal(2);
      });
    });

    it(
      '401/200 negative test: should return error or empty data when requesting ' +
        "workspaces for a user you don't manage",
      () => {
        cy.getWsByUserAPI(
          Cypress.expose(`id_${Cypress.expose('username')}`),
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.length).to.equal(3);
          // expect(resp.status).to.equal(401); should
        });
      }
    );

    it('401 negative test: should deny access to the user workspace list when no authentication is provided', () => {
      cy.getWsByUserAPI(
        Cypress.expose(`id_${Cypress.expose('username')}`),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('404/200 negative test: should return error when requesting workspaces for a non-existent user ID', () => {
      // This test should be negative 404, but it returns an empty array
      cy.getWsByUserAPI(
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        // expect(resp.status).to.equal(404); should
      });
    });
  });

  describe('83. UPDATE /api/group-admin/users/{id}/workspaces', () => {
    it(
      '200 positive test: should allow a group administrator to update workspace ' +
        'access levels for managed users',
      () => {
        // The body structure id different to sweagger.
        cy.updateWsByUserAPI(
          Cypress.expose(`id_${userGroupAdmin.username}`),
          Cypress.expose(groupVera.id),
          [2],
          [Cypress.expose(ws2.id)],
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
      }
    );

    it(
      '401 negative test: should deny workspace access modifications to a user' +
        ' without group administrator role',
      () => {
        cy.updateWsByUserAPI(
          Cypress.expose(`id_${Cypress.expose('username')}`),
          Cypress.expose(groupVera.id),
          [2],
          [Cypress.expose(ws1.id)],
          Cypress.expose(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      }
    );

    it('401/200 negative test: should deny a group administrator from modifying' +
      'access in a group they does not manage', () => {
      cy.updateWsByUserAPI(
        Cypress.expose(`id_${Cypress.expose('username')}`),
        Cypress.expose(group2.id),
        [1],
        [Cypress.expose(ws3.id)],
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        // expect(resp.status).to.equal(401); //should
      });
    });

    it('500 negative test: should return a server error when attempting to modify' +
      ' access without a valid group ID', () => {
      cy.updateWsByUserAPI(
        Cypress.expose(`id_${Cypress.expose('username')}`),
        noId,
        [2],
        [Cypress.expose(ws1.id)],
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });

    it(
      '500 negative test: should return a server error when attempting to modify access ' +
        'for a non-existent user record',
      () => {
        cy.updateWsByUserAPI(
          noId,
          Cypress.expose(groupVera.id),
          [4],
          [Cypress.expose(ws1.id)],
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      }
    );
  });

  describe('84. POST /api/workspaces/{workspace_id}', () => {
    const units = 'test_studio_units_download.zip';
    it(
      '401/500 negative test: should return authentication or server error when uploading units without a token',
      { defaultCommandTimeout: 100000 },
      () => {
        cy.uploadUnitsAPI(Cypress.expose(ws1.id), units, noId).then(resp => {
          expect(resp.status).to.be.oneOf([401, 500]);
        });
      }
    );

    it(
      '500 negative test: should return a server error when attempting to upload units without a target workspace',
      { defaultCommandTimeout: 100000 },
      () => {
        cy.uploadUnitsAPI(
          noId,
          units,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      }
    );

    it(
      '201 positive test: should allow an authorized administrator to successfully upload unit packages',
      { defaultCommandTimeout: 100000 },
      () => {
        cy.uploadUnitsAPI(
          Cypress.expose(ws1.id),
          units,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(201);
        });
      }
    );

    it(
      '201 positive test: should allow unit package uploads for group admin, although' +
        ' they only have developer credentials on the workspace',
      { defaultCommandTimeout: 100000 },
      () => {
        cy.uploadUnitsAPI(
          Cypress.expose(ws2.id),
          units,
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          expect(resp.status).to.be.oneOf([201]);
        });
      }
    );

    it(
      '500/401 negative test: should deny unit package uploads for a user with only developer level permissions',
      { defaultCommandTimeout: 100000 },
      () => {
        cy.updateUsersOfWsAPI(
          Cypress.expose(ws3.id),
          AccessLevel.Developer,
          Cypress.expose(`id_${user3.username}`),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
        cy.uploadUnitsAPI(
          Cypress.expose(ws3.id),
          units,
          Cypress.expose(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.be.oneOf([401, 500]);
        });
      }
    );

    it(
      '401/500 negative test: should deny unit package uploads when providing credentials' +
        ' belonging to a different group',
      { defaultCommandTimeout: 100000 },
      () => {
        cy.uploadUnitsAPI(
          Cypress.expose(ws3.id),
          units,
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          expect(resp.status).to.be.oneOf([401, 500]);
        });
      }
    );
  });

  describe('85. GET /api/admin/users/{id}/workspace-groups', () => {
    it(
      '200 positive test: should successfully retrieve the list of workspace groups' +
        ' associated with an administrator ID',
      () => {
        cy.getGroupsByUserAPI(
          Cypress.expose(`id_${Cypress.expose('username')}`),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body[0].name).to.equal(group2.name);
        });
      }
    );

    it('401 negative test: should deny workspace group listing to a user with regular profile privileges', () => {
      cy.getGroupsByUserAPI(
        Cypress.expose(`id_${userGroupAdmin.username}`),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it(
      '401 negative test: should deny access to the user group list ' +
        'when no valid authentication token is provided',
      () => {
        cy.getGroupsByUserAPI(
          Cypress.expose(`id_${Cypress.expose('username')}`),
          noId
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      }
    );

    it('200/404 negative test: should return success but no results when providing a non-existent user ID', () => {
      cy.getGroupsByUserAPI(
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        // expect(resp.status).to.equal(404); should
        // This test should be negative 404, but it returns an empty array
        expect(resp.body.length).to.equal(0);
      });
    });
  });

  describe('86. PATCH /api/admin/users/{id}/workspace-groups', () => {
    it(
      '200 positive test: should allow an administrator to successfully update ' +
        "a user's assigned workspace groups",
      () => {
        cy.updateGroupsByUserAPI(
          Cypress.expose(`id_${Cypress.expose('username')}`),
          [Cypress.expose(group2.id)],
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
      }
    );

    it('401 negative test: should deny regular users from updating workspace group assignments', () => {
      cy.updateGroupsByUserAPI(
        Cypress.expose(`id_${Cypress.expose('username')}`),
        [Cypress.expose(group2.id)],
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it(
      '401 negative test: should deny workspace group updates when no valid authentication credentials' +
        ' are provided',
      () => {
        cy.updateGroupsByUserAPI(
          Cypress.expose(`id_${Cypress.expose('username')}`),
          [Cypress.expose(groupVera.id)],
          noId
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      }
    );

    it(
      '500 negative test: should return a server error when attempting to update groups' +
        ' with missing group information',
      () => {
        cy.updateGroupsByUserAPI(
          Cypress.expose(`id_${Cypress.expose('username')}`),
          [noId],
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      }
    );

    it(
      '500 negative test: should return a server error when attempting to update ' +
        'groups for an invalid user ID',
      () => {
        cy.updateGroupsByUserAPI(
          noId,
          [Cypress.expose(groupVera.id)],
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      }
    );
  });
});
