import {
  DefinitionUnit,
  CopyUnit,
  WsSettings
} from '../../support/testData';
import {
  noId,
  user2,
  user3,
  ws1,
  ws2,
  unit1,
  unit2,
  unit3,
  unit4,
  setEditor,
  group1,
  ws3,
  group2
} from '../../support/util-api';

describe('Unit API tests', () => {
  describe('25. POST /api/workspaces/{id}/units ', () => {
    it('201 positive test: should create a new unit within a regular workspace', () => {
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

    it('500/201 negative test: should return success but fail to duplicate a unit with the same ID', () => {
      // but it returns no error, but neither would insert a new record on the database.
      cy.createUnitAPI(Cypress.env(ws1.id), unit1, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(201);
          // expect(resp.status).to.equal(500);  // should
        });
    });

    it('401 negative test: should deny unit creation when no authentication token is provided', () => {
      cy.createUnitAPI(Cypress.env(ws1.id), unit1, noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should deny unit creation for a user without workspace permissions', () => {
      cy.createUnitAPI(Cypress.env(ws1.id), unit2, Cypress.env(`token_${user3.username}`))
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('500 negative test: should return a server error when creating a unit in a non-existent workspace', () => {
      cy.createUnitAPI(noId, unit1, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });
  });

  describe('26. GET /api/admin/workspace-groups/units', () => {
    it('200 positive test: should retrieve a comprehensive list of all units across all workspaces', () => {
      cy.getUnitsAPI(Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.length).to.equal(2);
        });
    });

    it('401 negative test: should deny unit listing to a non-administrator user', () => {
      cy.getUnitsAPI(Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should deny unit listing when an invalid token is provided', () => {
      cy.getUnitsAPI(noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('27. PATCH /api/workspaces/{workspace_id}/settings', () => {
    it('200 positive test: should allow updating workspace settings and configuration', () => {
      cy.updateWsSettingsAPI(Cypress.env(ws1.id), setEditor, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('500 negative test: should fail to update settings when no workspace group data is provided', () => {
      cy.updateWsSettingsAPI(noId, setEditor, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });

    it('401 negative test: should deny settings update to a user who is not a member of the workspace', () => {
      cy.updateWsSettingsAPI(Cypress.env(ws1.id), setEditor, noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('500/200 negative test: should return success despite providing an invalid workspace settings format', () => {
      cy.updateWsSettingsAPI(Cypress.env(ws1.id), noId, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          // expect(resp.status).to.equal(500); should
        });
    });
  });

  describe('28. GET /api/workspaces/{workspace_id}', () => {
    it('200 positive test: should retrieve detailed workspace information by its ID', () => {
      cy.getWsNormalAPI(Cypress.env(ws2.id),
        Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.body.name).to.equal(ws2.name);
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should deny access to workspace details with an invalid token', () => {
      cy.getWsNormalAPI(Cypress.env(ws2.id),
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('404 negative test: should return error for an invalid workspace ID format', () => {
      cy.getWsNormalAPI('',
        Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.equal(404);
        });
    });

    it('403 negative test: should deny access to workspace details for an unauthorized user', () => {
      cy.getWsNormalAPI(Cypress.env(ws3.id),
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp2 => {
          expect(resp2.status).to.equal(403);
        });
    });
  });

  describe('29. GET /api/workspaces/{workspace_id}/users', () => {
    it('200 positive test: should retrieve the user and administrator list for a workspace', () => {
      cy.getUsersByWsAPI(Cypress.env(ws1.id),
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.users.length).to.equal(0);
          expect(resp.body.admins.length).to.equal(1);
          expect(resp.body.workspaceGroupAdmins.length).to.equal(1);
        });
    });

    it('401 negative test: should deny access to workspace users list when using a fake authentication token', () => {
      cy.getUsersByWsAPI(Cypress.env(ws1.id), noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('500 negative test: should return error when attempting to list users for a non-existent workspace', () => {
      cy.getUsersByWsAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });
  });

  describe('Metadata block', () => {
    describe('30. GET /api/metadata/registry', { defaultCommandTimeout: 100000 }, () => {
      it('200 positive test: should retrieve at least one metadata profile from the registry', () => {
        cy.getRegistryAPI(Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body.length).greaterThan(1);
          });
      });

      it('200 positive test: should successfully extract the URLs for the first two profiles', () => {
        cy.getRegistryAPI(Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            const profile1 = resp.body[0].url.replace('profile-config.json', '') + resp.body[0].profiles[0];
            const profile2 = resp.body[0].url.replace('profile-config.json', '') + resp.body[0].profiles[1];
            Cypress.env('profile1', profile1);
            Cypress.env('profile2', profile2);
          });
      });

      it('401 negative test: should deny access to the metadata registry without credentials', () => {
        cy.getRegistryAPI(noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });

    describe('31. GET /api/metadata/profiles', () => {
      it('200 positive test: should retrieve configuration data for a specific metadata profile', () => {
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

      it('401 negative test: should deny access to profile metadata when no credentials are provided', () => {
        cy.getMetadataAPI(Cypress.env('profile2'), noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500/200 negative test: should return success but fail to retrieve data for a non-existent profile', () => {
        cy.getMetadataAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // expect(resp.status).to.equal(500); // should
          });
      });
    });

    describe('32. UPDATE /api/workspace-groups/{workspace_group_id}', () => {
      it('200 positive test: should allow setting a metadata profile for an entire workspace group', () => {
        cy.updateGroupMetadataAPI(
          Cypress.env(group1.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });

      it('500 negative test: should return error when providing an invalid workspace group ID', () => {
        cy.updateGroupMetadataAPI(
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('401 negative test: should deny group metadata updates for an invalid user', () => {
        cy.updateGroupMetadataAPI(
          Cypress.env(group1.id),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: should deny group metadata updates to a user without administrative privileges', () => {
        cy.updateGroupMetadataAPI(
          Cypress.env(group1.id),
          Cypress.env(`token_${user3.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });

    describe('33. GET /api/metadata/vocabularies', () => {
      it('200 positive test: should retrieve the predefined vocabulary for a metadata profile', () => {
        cy.getVocabularyMetadataAPI(
          Cypress.env('profile1'),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });

      // At sweagger if we pass an incorrect url, it returns 500
      it('500/200 negative test: should return success but fail to retrieve vocabulary for an invalid profile', () => {
        cy.getVocabularyMetadataAPI(
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // expect(resp.status).to.equal(500); // should
          });
      });

      it('401 negative test: should deny access to metadata vocabulary for an invalid user', () => {
        cy.getVocabularyMetadataAPI(
          Cypress.env('profile1'),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
    });

    describe('34. PATCH /api/workspaces/{workspace_id}/settings', () => {
      let newSettings: WsSettings;
      before(() => {
        newSettings = {
          defaultEditor: 'iqb-editor-aspect@2.12',
          defaultPlayer: 'iqb-player-aspect@2.12',
          defaultSchemer: 'iqb-schemer@2.6',
          stableModulesOnly: false,
          unitMDProfile: Cypress.env('profile1'),
          itemMDProfile: Cypress.env('profile2')
        };
      });

      it('401 negative test: should deny metadata settings update to a user with insufficient privileges', () => {
        cy.updateWsMetadataAPI(
          Cypress.env(ws1.id),
          newSettings,
          Cypress.env(`token_${user3.username}`))
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('401 negative test: should deny metadata settings update when no authentication token is provided', () => {
        cy.updateWsMetadataAPI(
          Cypress.env(ws1.id),
          newSettings,
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should return a server error when attempting to update metadata' +
        ' for a non-existent workspace', () => {
        cy.updateWsMetadataAPI(
          noId,
          newSettings,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('200 positive test: should allow an authorized user to set metadata profiles for a workspace', () => {
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

  describe('35. GET /api/workspaces/{workspace_id}/units/{id}/properties ', () => {
    it('200 positive test: should retrieve the configuration properties of a specific unit', () => {
      cy.getUnitPropertiesAPI(
        Cypress.env(ws1.id),
        Cypress.env(unit1.shortname),
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          Cypress.env('unit1_properties', resp.body);
          expect(resp.status).to.equal(200);
        });
    });

    it('500 negative test: should return a server error when requesting unit properties without a workspace ID', () => {
      cy.getUnitPropertiesAPI(
        noId,
        Cypress.env(unit1.shortname),
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });

    it('404 negative test: should return error when requesting properties for a non-existent unit ID', () => {
      cy.getUnitPropertiesAPI(
        Cypress.env(ws1.id),
        noId,
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(404);
        });
    });

    it('401 negative test: should deny access to unit properties when no credentials are provided', () => {
      cy.getUnitPropertiesAPI(
        Cypress.env(ws1.id),
        Cypress.env(unit1.shortname),
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('36. PATCH /api/workspaces/{workspace_id}/units/{id}/properties', () => {
    let entry1: DefinitionUnit;
    before(() => {
      entry1 = {
        id: parseInt(`${Cypress.env(unit1.shortname)}`, 10),
        groupName: 'Bista'
      };
    });

    it('200 positive test: should allow updating the configuration properties of a unit', () => {
      cy.updateUnitPropertiesAPI(Cypress.env(ws1.id),
        Cypress.env(unit1.shortname),
        entry1,
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('500 negative test: should return a server error when attempting to update unit properties' +
      ' without a workspace ID', () => {
      cy.updateUnitPropertiesAPI(noId,
        Cypress.env(unit1.shortname),
        entry1,
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });

    it('500 negative test: should return a server error when attempting to update properties' +
      ' for a non-existent unit', () => {
      cy.updateUnitPropertiesAPI(Cypress.env(ws1.id),
        noId,
        entry1,
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });

    it('500/200 negative test: should return success despite providing an invalid unit properties structure', () => {
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

    it('401 negative test: should deny unit properties update when no valid credentials are provided', () => {
      cy.updateUnitPropertiesAPI(Cypress.env(ws1.id),
        Cypress.env(unit1.shortname),
        entry1,
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should deny unit properties update for a user without workspace permissions', () => {
      cy.updateUnitPropertiesAPI(Cypress.env(ws1.id),
        Cypress.env(unit1.shortname),
        entry1,
        Cypress.env(`token_${user3.username}`))
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });
  });

  describe('37. GET /api/workspaces/{workspace_id}/units', () => {
    it('200 positive test: should retrieve the list of all units associated with a workspace', () => {
      // Sweagger has other parameter, and we get error 521, sweagger needs the version
      // And there is no parameter for version.
      cy.getUnitsByWsAPI(Cypress.env(ws1.id), Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp1 => {
          expect(resp1.status).to.equal(200);
          expect(resp1.body.length).to.equal(1);
        });
    });

    it('401 negative test: should deny units listing when provided with incorrect authentication credentials', () => {
      cy.getUnitsByWsAPI(Cypress.env(ws1.id), noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('500 negative test: should return a server error when attempting to list units' +
      ' for a non-existent workspace ID', () => {
      cy.getUnitsByWsAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });
  });

  describe('38. PATCH /api/workspaces/{workspace_id}/units/workspace-id', () => {
    it('401 negative test: should deny unit relocation for a user without sufficient' +
      ' permissions in the workspace', () => {
      cy.moveToAPI(Cypress.env(ws1.id),
        Cypress.env(ws2.id),
        Cypress.env(unit1.shortname),
        Cypress.env(`token_${user3.username}`))
        .then(resp => {
          expect(resp.status).to.be.equal(401);
        });
    });

    it('500/200 negative test: should return success but fail to move a unit that' +
      ' is already in the target workspace', () => {
      cy.moveToAPI(Cypress.env(ws1.id),
        Cypress.env(ws2.id),
        Cypress.env(unit2.shortname),
        Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.be.equal(200);
          // expect(resp.status).to.be.equal(500); // should
        });
    });

    it('500 negative test: should return a server error when attempting to move a non-existent unit', () => {
      cy.moveToAPI(Cypress.env(ws1.id),
        Cypress.env(ws2.id),
        noId,
        Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.be.equal(500);
        });
    });

    it('200 positive test: should successfully move a unit from its current workspace' +
      ' to another target workspace', () => {
      cy.moveToAPI(Cypress.env(ws1.id),
        Cypress.env(ws2.id),
        Cypress.env(unit1.shortname),
        Cypress.env(`token_${user2.username}`))
        .then(resp => {
          expect(resp.status).to.be.equal(200);
        });
    });
  });

  describe('39. PATCH /api/workspaces/{workspace_id}/name', () => {
    it('200 positive test: should allow an authorized user to rename a workspace', () => {
      cy.renameWsAPI(Cypress.env(ws1.id),
        '01Vorlage-New',
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should deny workspace renaming when no valid credentials are provided', () => {
      cy.renameWsAPI(Cypress.env(ws1.id),
        '02Vorlage-New',
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('500 negative test: should return a server error when attempting to rename' +
      ' a workspace using an invalid ID', () => {
      cy.renameWsAPI(noId,
        '03Vorlage-New',
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });
  });

  describe('40. POST /api/workspaces/{workspace_id}/units', () => {
    let copyUnit: CopyUnit;
    before(() => {
      copyUnit = {
        createForm: parseInt(`${Cypress.env(unit2.shortname)}`, 10),
        groupName: 'Group_Copy',
        key: `${unit2.shortname}_copy`,
        name: unit2.name
      };
    });

    it('401 negative test: should deny unit duplication when no valid authentication token is provided', () => {
      cy.copyToAPI(Cypress.env(ws2.id),
        copyUnit,
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('500/201 negative test: should return success but fail to duplicate a unit' +
      ' when an invalid request structure is provided', () => {
      cy.copyToAPI(Cypress.env(ws2.id),
        noId,
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(201);
          // expect(resp.status).to.equal(500); // should
        });
    });

    it('500 negative test: should return a server error when trying to duplicate' +
      ' a unit to a non-existent workspace', () => {
      cy.copyToAPI(noId,
        copyUnit,
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });

    it('201 positive test: should allow an authorized user to duplicate a unit within a workspace', () => {
      cy.copyToAPI(Cypress.env(ws2.id),
        copyUnit,
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(201);
        });
    });
  });

  describe('41. GET /api/workspaces/{workspace_id}/groups', () => {
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

    it('200 positive test: should retrieve the list of unit groups associated with a workspace', () => {
      cy.getGroupsOfWsAPI(Cypress.env(ws1.id), Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.length).to.equal(3);
        });
    });

    it('401 negative test: should deny unit group listing when no valid credentials are provided', () => {
      cy.getGroupsOfWsAPI(Cypress.env(ws1.id), noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('500 negative test: should return a server error when requesting unit groups' +
      ' for an invalid workspace ID', () => {
      cy.getGroupsOfWsAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });
  });

  describe('42. PATCH /api/workspaces/{workspace_id}/group-name', () => {
    it('200 positive test: should allow an authorized user to add or update a group name for a workspace', () => {
      cy.updateGroupNameOfWsAPI(Cypress.env(ws1.id),
        'new group for w1',
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(200);
        });
    });

    it('401 negative test: should deny group name updates when no credentials are provided', () => {
      cy.updateGroupNameOfWsAPI(Cypress.env(ws1.id), 'no credentials Group', noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('500 negative test: should return a server error when attempting to update' +
      ' a group name for a non-existent workspace', () => {
      cy.updateGroupNameOfWsAPI(noId, 'no valid Ws Group', Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });
  });

  describe('43. GET /api/workspaces/{workspace_id}/units/{id}/scheme', () => {
    it('200 positive test: should retrieve the coding scheme associated with a specific unit', () => {
      cy.getUnitSchemeAPI(
        Cypress.env(unit4.shortname),
        Cypress.env(ws1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it('500 negative test: should return a server error when requesting a unit scheme using an invalid unit ID', () => {
      cy.getUnitSchemeAPI(
        noId,
        Cypress.env(ws1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });

    it('500 negative test: should return a server error when requesting' +
      ' a unit scheme without a valid workspace ID', () => {
      cy.getUnitSchemeAPI(
        Cypress.env(unit4.shortname),
        noId,
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });

    it('401 positive test: should deny access to the unit scheme when no credentials are provided', () => {
      cy.getUnitSchemeAPI(
        Cypress.env(unit4.shortname),
        Cypress.env(ws1.id),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });
  });

  describe('44. PATH /api/workspaces/{workspace_id}/units/{id}/definition', () => {
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

    it('500 negative test: should return a server error when attempting ' +
      'to update a unit definition without a valid unit ID', () => {
      cy.updateUnitDefinitionAPI(
        noId,
        Cypress.env(ws1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });

    it('500 negative test: should return a server error when attempting to update ' +
      'a unit definition without a valid workspace ID', () => {
      cy.updateUnitDefinitionAPI(
        Cypress.env(unit4.shortname),
        noId,
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });

    it('401 positive test: should deny unit definition updates when no authentication token is provided', () => {
      cy.updateUnitDefinitionAPI(
        Cypress.env(unit4.shortname),
        Cypress.env(ws1.id),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('401 negative test: should deny unit definition updates for a user ' +
      'with insufficient workspace privileges', () => {
      cy.updateUnitDefinitionAPI(
        Cypress.env(unit4.shortname),
        Cypress.env(ws1.id),
        Cypress.env(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('200 positive test: should allowed an authorized user to update and ' +
      'save the unit definition in the editor', () => {
      cy.updateUnitDefinitionAPI(
        Cypress.env(unit4.shortname),
        Cypress.env(ws1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('45. GET /api/workspaces/{workspace_id}/units/{id}/definition', () => {
    it('500 negative test: should return a server error when attempting to retrieve ' +
      'a unit definition without a valid unit ID', () => {
      cy.getUnitDefinitionAPI(
        noId,
        Cypress.env(ws1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });

    it('500 negative test: should return a server error when attempting to retrieve ' +
      'a unit definition without a valid workspace ID', () => {
      cy.getUnitDefinitionAPI(
        Cypress.env(unit4.shortname),
        noId,
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });

    it('401 positive test: should deny access to the unit definition when no authentication token is provided', () => {
      cy.getUnitDefinitionAPI(
        Cypress.env(unit4.shortname),
        Cypress.env(ws1.id),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('401 positive test: should deny access to the unit definition for a user without sufficient privileges', () => {
      cy.getUnitDefinitionAPI(
        Cypress.env(unit4.shortname),
        Cypress.env(ws1.id),
        Cypress.env(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('200 positive test: should allow an authorized user to retrieve the full definition of a unit', () => {
      cy.getUnitDefinitionAPI(
        Cypress.env(unit4.shortname),
        Cypress.env(ws1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('46. PATCH /api/workspaces/{workspace_id}/units/{id}/scheme', () => {
    it('500 negative test: should return a server error when attempting to update' +
      ' variable coding without a valid unit ID', () => {
      cy.updateUnitSchemeAPI(
        noId,
        Cypress.env(ws1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });

    it('500 negative test: should return a server error when attempting to update variable coding ' +
      'without a valid workspace ID', () => {
      cy.updateUnitSchemeAPI(
        Cypress.env(unit4.shortname),
        noId,
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });

    it('401 positive test: should deny variable coding updates when no valid credentials are provided', () => {
      cy.updateUnitSchemeAPI(
        Cypress.env(unit4.shortname),
        Cypress.env(ws1.id),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('401 negative test: should deny variable coding updates for a user with ' +
      'insufficient workspace permissions', () => {
      cy.updateUnitSchemeAPI(
        Cypress.env(unit4.shortname),
        Cypress.env(ws1.id),
        Cypress.env(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('200 positive test: should successfully update the variable coding scheme with valid parameters', () => {
      cy.updateUnitSchemeAPI(
        Cypress.env(unit4.shortname),
        Cypress.env(ws1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('47. GET /api/workspaces/{workspace_id}/units/properties', () => {
    it('500 negative test: should return a server error when generating a metadata report' +
      ' without a valid workspace ID', () => {
      cy.generateMetadataReportAPI(
        noId,
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });

    it('401 positive test: should deny metadata report generation when no valid authentication token' +
      ' is provided', () => {
      cy.generateMetadataReportAPI(
        Cypress.env(ws1.id),
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should deny metadata report generation for an unauthorized user', () => {
      cy.generateMetadataReportAPI(
        Cypress.env(ws1.id),
        Cypress.env(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('200 positive test: should successfully generate a metadata properties report' +
      ' for an authorized workspace', () => {
      cy.generateMetadataReportAPI(
        Cypress.env(ws1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body[0].name).to.equal('Tier3');
      });
    });
  });

  describe('48. GET /api/workspaces/{workspace_id}/units/scheme', () => {
    it('500 negative test: should return a server error when generating a variable ' +
      'coding report without a valid workspace ID', () => {
      cy.getWsSchemeAPI(
        noId,
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });

    it('401 positive test: should deny variable coding report generation when no credentials are provided', () => {
      cy.getWsSchemeAPI(
        Cypress.env(ws1.id),
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should deny variable coding report generation for a user' +
      ' without sufficient privileges', () => {
      cy.getWsSchemeAPI(
        Cypress.env(ws1.id),
        Cypress.env(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('200 positive test: should successfully generate a variable coding scheme report' +
      ' for a specified workspace', () => {
      cy.getWsSchemeAPI(
        Cypress.env(ws1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body[1].validation).to.equal('OK');
      });
    });
  });

  describe('49. PATH /api/workspaces/{workspace_id}/units/coding-book', () => {
    it('500 negative test: should return a server error when requesting a coding book' +
      ' without a valid workspace ID', () => {
      cy.getWsCodingBookAPI([Cypress.env(unit3.shortname), Cypress.env(unit4.shortname)],
        noId,
        Cypress.env(`token_${Cypress.env('username')}`))
        .then(resp => {
          expect(resp.status).to.equal(500);
        });
    });

    it('401 positive test: should deny coding book generation when no valid authentication token is provided', () => {
      cy.getWsCodingBookAPI([Cypress.env(unit3.shortname), Cypress.env(unit4.shortname)],
        Cypress.env(ws1.id),
        noId)
        .then(resp => {
          expect(resp.status).to.equal(401);
        });
    });

    it('401 negative test: should deny coding book generation for an unauthorized user', () => {
      cy.getWsCodingBookAPI([Cypress.env(unit3.shortname), Cypress.env(unit4.shortname)],
        Cypress.env(ws1.id),
        Cypress.env(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('200 positive test: should successfully generate a coding book for selected units in a workspace', () => {
      cy.getWsCodingBookAPI([Cypress.env(unit3.shortname), Cypress.env(unit4.shortname)],
        Cypress.env(ws1.id),
        Cypress.env(`token_${Cypress.env('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('States block', () => {
    describe('50. PATCH /api/workspace-groups/{workspace_group_id}', () => {
      it('200 positive test: should successfully add new states to a workspace group with valid credentials', () => {
        cy.updateGroupPropertiesAPI(Cypress.env(group1.id), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });

      it('401 negative test: should deny adding new states to a group when no credentials are provided', () => {
        cy.updateGroupPropertiesAPI(Cypress.env(group2.id), noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should return a server error when attempting to add states' +
        ' for an invalid workspace group ID', () => {
        cy.updateGroupPropertiesAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
    });

    describe('51. GET /api/workspace-groups/{workspace_group_id}', () => {
      // It is used when we enter a ws
      it('200 positive test: should retrieve the properties and configuration for a workspace group', () => {
        cy.getGroupPropertiesAPI(Cypress.env(group1.id), Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });

      it('401 negative test: should deny access to group properties when no credentials are provided', () => {
        cy.getGroupPropertiesAPI(Cypress.env(group2.id), noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should return a server error when attempting to retrieve' +
        ' properties for an invalid group ID', () => {
        cy.updateGroupPropertiesAPI(noId, Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
    });

    describe('52. PATCH /api/workspaces/{workspace_id}/units/{id}/properties ', () => {
      it('200 positive test: should allow assigning a specific workflow state target to a unit', () => {
        cy.updateUnitStateAPI(Cypress.env(group1.id),
          Cypress.env(unit3.shortname),
          '1',
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });

      it('401 negative test: should deny unit state updates when no valid credentials are provided', () => {
        cy.updateUnitStateAPI(Cypress.env(group1.id),
          Cypress.env(unit3.shortname),
          '0',
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });
      // This test should be negative and return 500. The status 5 does not exit.

      it('500/200 negative test: should return success despite attempting to assign a non-existent state ID', () => {
        cy.updateUnitStateAPI(Cypress.env(group1.id),
          Cypress.env(unit3.shortname),
          '5',
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // expect(resp.status).to.equal(500);  // should
          });
      });

      it('500 negative test: should return a server error when attempting to assign' +
        ' an unit state without a valid unit ID', () => {
        cy.updateUnitStateAPI(Cypress.env(group1.id),
          noId,
          '0',
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });
    });

    describe('53. GET /api/workspaces/{workspace_id}/units/{id}/metadata', () => {
      // I can not find the use in studio.
      // To delete, in sweagger, results are always two empty arrays: profiles and items
      it('200 positive test: should retrieve the metadata records associated with a unit in a workspace', () => {
        cy.getUnitMetadataAPI(Cypress.env(ws2.id),
          Cypress.env(unit1.shortname),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // console.log(resp.body);
          });
      });

      it('401 negative test: should deny access to unit metadata when no valid credentials are provided', () => {
        cy.getUnitMetadataAPI(Cypress.env(ws1.id),
          Cypress.env(unit1.shortname),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should return error when attempting to retrieve metadata for ' +
        'a non-existent workspace ID', () => {
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
    describe('54. PATCH /api/workspaces/{workspace_id}/drop-box', () => {
      it('401 negative test: should deny designating a workspace as a dropbox without valid credentials', () => {
        cy.dropboxWsAPI(Cypress.env(ws1.id),
          Cypress.env(ws2.id),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should return error when designating a dropbox for a non-existent workspace', () => {
        cy.dropboxWsAPI(noId,
          Cypress.env(ws2.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('500/200 negative test: should return success despite designating a non-existent workspace' +
        ' as the dropbox target', () => {
        cy.dropboxWsAPI(Cypress.env(ws1.id),
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
            // expect(resp.status).to.equal(500);  // should
          });
      });

      it('200 positive test: should allow an authorized user to designate a workspace as ' +
        'the dropbox for another workspace', () => {
        cy.dropboxWsAPI(Cypress.env(ws1.id),
          Cypress.env(ws2.id),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
    });

    describe('55. PATCH /api/workspaces/{workspace_id}/units/drop-box-history', () => {
      it('401 negative test: should deny unit submission to the dropbox when no credentials are provided', () => {
        cy.submitUnitsAPI(Cypress.env(ws1.id),
          Cypress.env(ws2.id),
          Cypress.env(unit3.shortname),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should return error when attempting to submit units without' +
        ' specifying an origin workspace', () => {
        cy.submitUnitsAPI(noId,
          Cypress.env(ws2.id),
          Cypress.env(unit3.shortname),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('500 negative test: should return error when attempting to submit units without a valid unit ID', () => {
        cy.submitUnitsAPI(Cypress.env(ws1.id),
          Cypress.env(ws2.id),
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('500 negative test: should return error when attempting to submit units ' +
        'without a destination workspace target', () => {
        cy.submitUnitsAPI(Cypress.env(ws1.id),
          noId,
          Cypress.env(unit3.shortname),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('200 positive test: should successfully submit a unit from an origin workspace' +
        ' to a dropbox destination', () => {
        cy.submitUnitsAPI(Cypress.env(ws1.id),
          Cypress.env(ws2.id),
          Cypress.env(unit3.shortname),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(200);
          });
      });
    });

    describe('55a. PATCH /api/workspaces/{workspace_id}/units/drop-box-history', () => {
      it('401 negative test: should deny unit submission retrieval when no valid credentials are provided', () => {
        cy.submitUnitsAPI(Cypress.env(ws2.id),
          '',
          Cypress.env(unit3.shortname),
          noId)
          .then(resp => {
            expect(resp.status).to.equal(401);
          });
      });

      it('500 negative test: should return error when attempting to retrieve unit submission' +
        ' without an origin workspace', () => {
        cy.submitUnitsAPI(noId,
          '',
          Cypress.env(unit3.shortname),
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('500 negative test: should return error when attempting to retrieve unit submission ' +
        'for an invalid unit ID', () => {
        cy.submitUnitsAPI(Cypress.env(ws2.id),
          '',
          noId,
          Cypress.env(`token_${Cypress.env('username')}`))
          .then(resp => {
            expect(resp.status).to.equal(500);
          });
      });

      it('200 positive test: should successfully retrieve unit submission data ' +
        'with proper origin, unit ID, and credentials', () => {
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
});
