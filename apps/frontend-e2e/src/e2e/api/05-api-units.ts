import type { UnitInViewDto } from '@studio-lite-lib/api-dto';
import {
  AccessLevel,
  DefinitionUnit,
  CopyUnit,
  UnitData,
  WsSettings
} from '../../support/testData';
import {
  noId,
  userGroupAdmin,
  user3,
  ws1,
  ws2,
  unit1,
  unit2,
  unit3,
  unit4,
  setEditor,
  groupVera,
  ws3,
  group2
} from '../../support/util-api';

describe('Unit API tests', () => {
  describe('25. POST /api/workspaces/{id}/units ', () => {
    it('201 positive test: should create a new unit within a regular workspace', () => {
      cy.createUnitAPI(
        Cypress.expose(ws1.id),
        unit1,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        Cypress.expose(unit1.shortname, resp.body);
        expect(resp.status).to.equal(201);
      });
      cy.createUnitAPI(
        Cypress.expose(ws2.id),
        unit2,
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        Cypress.expose(unit2.shortname, resp.body);
        expect(resp.status).to.equal(201);
      });
    });

    it('500/201 negative test: should return success but fail to duplicate a unit with the same ID', () => {
      // but it returns no error, but neither would insert a new record on the database.
      cy.createUnitAPI(
        Cypress.expose(ws1.id),
        unit1,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(201);
        // expect(resp.status).to.equal(500);  // should
      });
    });

    it('401 negative test: should deny unit creation when no authentication token is provided', () => {
      cy.createUnitAPI(Cypress.expose(ws1.id), unit1, noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('403 negative test: should deny unit creation for a user without workspace permissions', () => {
      cy.createUnitAPI(
        Cypress.expose(ws1.id),
        unit2,
        Cypress.expose(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(403);
      });
    });

    it('403 negative test: should be refused when creating a unit in a non-existent workspace', () => {
      cy.createUnitAPI(
        noId,
        unit1,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(403);
      });
    });
  });

  describe('26. GET /api/admin/workspace-groups/units', () => {
    it('200 positive test: should retrieve a comprehensive list of all units across all workspaces', () => {
      cy.getUnitsAPI(
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        // Its own units, not the total: a database with leftovers holds more (#1750)
        const ids = (resp.body as UnitInViewDto[]).map(u => u.id);
        expect(ids).to.include.members([Cypress.expose(unit1.shortname), Cypress.expose(unit2.shortname)]);
      });
    });

    it('403 negative test: should deny unit listing to a non-administrator user', () => {
      cy.getUnitsAPI(Cypress.expose(`token_${userGroupAdmin.username}`)).then(
        resp => {
          expect(resp.status).to.equal(403);
        }
      );
    });

    it('401 negative test: should deny unit listing when an invalid token is provided', () => {
      cy.getUnitsAPI(noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });
  });

  describe('27. PATCH /api/workspaces/{workspace_id}/settings', () => {
    it('200 positive test: should allow updating workspace settings and configuration', () => {
      cy.updateWsSettingsAPI(
        Cypress.expose(ws1.id),
        setEditor,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it('500 negative test: should fail to update settings when no workspace group data is provided', () => {
      cy.updateWsSettingsAPI(
        noId,
        setEditor,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(500);
      });
    });

    it('401 negative test: should deny settings update to a user who is not a member of the workspace', () => {
      cy.updateWsSettingsAPI(Cypress.expose(ws1.id), setEditor, noId).then(
        resp => {
          expect(resp.status).to.equal(401);
        }
      );
    });

    it('500/200 negative test: should return success despite providing an invalid workspace settings format', () => {
      cy.updateWsSettingsAPI(
        Cypress.expose(ws1.id),
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        // expect(resp.status).to.equal(500); should
      });
    });
  });

  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('28. GET /api/workspaces/{workspace_id}', () => {
    it('200 positive test: should retrieve detailed workspace information by its ID', () => {
      cy.getWsNormalAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.body.name).to.equal(ws2.name);
        expect(resp.status).to.equal(200);
      });
    });

    it('401 negative test: should deny access to workspace details with an invalid token', () => {
      cy.getWsNormalAPI(Cypress.expose(ws2.id), noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('404 negative test: should return error for an invalid workspace ID format', () => {
      cy.getWsNormalAPI(
        '',
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('200 negative test: should allow access to group admin', () => {
      cy.getWsNormalAPI(
        Cypress.expose(ws3.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('29. GET /api/workspaces/{workspace_id}/users', () => {
    it('200 positive test: should retrieve the user and administrator list for a workspace', () => {
      cy.getUsersByWsAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.users.length).to.equal(0);
        expect(resp.body.admins.length).to.equal(1);
        expect(resp.body.workspaceGroupAdmins.length).to.equal(1);
      });
    });

    it('401 negative test: should deny access to workspace users list when using a fake authentication token', () => {
      cy.getUsersByWsAPI(Cypress.expose(ws1.id), noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('403 negative test: should be refused when attempting to list users for a non-existent workspace', () => {
      cy.getUsersByWsAPI(
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(403);
      });
    });
  });

  describe('Metadata block', () => {
    describe(
      '30. GET /api/metadata/registry',
      { defaultCommandTimeout: 100000 },
      () => {
        it('200 positive test: should retrieve at least one metadata profile from the registry', () => {
          cy.getRegistryAPI(
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.body.length).greaterThan(1);
          });
        });

        it('200 positive test: should successfully extract the URLs for the first two profiles', () => {
          cy.getRegistryAPI(
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(200);
            // New registry format: each entry's url IS the direct profile URL;
            // profiles[] is empty because there are no sub-files to resolve.
            const profile1 = resp.body[0].url;
            const profile2 = resp.body[1].url;
            Cypress.expose('profile1', profile1);
            Cypress.expose('profile2', profile2);
          });
        });

        it('401 negative test: should deny access to the metadata registry without credentials', () => {
          cy.getRegistryAPI(noId).then(resp => {
            expect(resp.status).to.equal(401);
          });
        });
      }
    );

    describe('31. GET /api/metadata/profiles', () => {
      it('200 positive test: should retrieve configuration data for a specific metadata profile', () => {
        cy.getMetadataAPI(
          Cypress.expose('profile1'),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          Cypress.expose('label1', resp.body.label[0].value);
        });
        cy.getMetadataAPI(
          Cypress.expose('profile2'),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          Cypress.expose('label2', resp.body.label[0].value);
        });
      });

      it('401 negative test: should deny access to profile metadata when no credentials are provided', () => {
        cy.getMetadataAPI(Cypress.expose('profile2'), noId).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('500/200 negative test: should return success but fail to retrieve data for a non-existent profile', () => {
        cy.getMetadataAPI(
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          // expect(resp.status).to.equal(500); // should
        });
      });
    });

    describe('32. UPDATE /api/workspace-groups/{workspace_group_id}', () => {
      it('200 positive test: should allow setting a metadata profile for an entire workspace group', () => {
        cy.updateGroupMetadataAPI(
          Cypress.expose(groupVera.id),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
      });

      it('500 negative test: should return error when providing an invalid workspace group ID', () => {
        cy.updateGroupMetadataAPI(
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      });

      it('401 negative test: should deny group metadata updates for an invalid user', () => {
        cy.updateGroupMetadataAPI(Cypress.expose(groupVera.id), noId).then(
          resp => {
            expect(resp.status).to.equal(401);
          }
        );
      });

      it('403 negative test: should deny group metadata updates to a user without administrative privileges', () => {
        cy.updateGroupMetadataAPI(
          Cypress.expose(groupVera.id),
          Cypress.expose(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      });
    });

    describe('33. GET /api/metadata/vocabularies', () => {
      it('200 positive test: should retrieve the predefined vocabulary for a metadata profile', () => {
        cy.getVocabularyMetadataAPI(
          Cypress.expose('profile1'),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
      });

      // At sweagger if we pass an incorrect url, it returns 500
      it('500/200 negative test: should return success but fail to retrieve vocabulary for an invalid profile', () => {
        cy.getVocabularyMetadataAPI(
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          // expect(resp.status).to.equal(500); // should
        });
      });

      it('401 negative test: should deny access to metadata vocabulary for an invalid user', () => {
        cy.getVocabularyMetadataAPI(Cypress.expose('profile1'), noId).then(
          resp => {
            expect(resp.status).to.equal(401);
          }
        );
      });
    });

    describe('34. PATCH /api/workspaces/{workspace_id}/settings', () => {
      let newSettings: WsSettings;
      before(() => {
        newSettings = {
          defaultEditor: 'iqb-editor-aspect@3.0',
          defaultPlayer: 'iqb-player-aspect@3.0',
          defaultSchemer: 'iqb-schemer@2.8',
          stableModulesOnly: false,
          unitMDProfile: Cypress.expose('profile1'),
          itemMDProfile: Cypress.expose('profile2')
        };
      });

      it('403 negative test: should deny metadata settings update to a user with insufficient privileges', () => {
        cy.updateWsMetadataAPI(
          Cypress.expose(ws1.id),
          newSettings,
          Cypress.expose(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      });

      it('401 negative test: should deny metadata settings update when no authentication token is provided', () => {
        cy.updateWsMetadataAPI(Cypress.expose(ws1.id), newSettings, noId).then(
          resp => {
            expect(resp.status).to.equal(401);
          }
        );
      });

      it(
        '500 negative test: should return a server error when attempting to update metadata' +
          ' for a non-existent workspace',
        () => {
          cy.updateWsMetadataAPI(
            noId,
            newSettings,
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(500);
          });
        }
      );

      it('200 positive test: should allow an authorized user to set metadata profiles for a workspace', () => {
        cy.updateWsMetadataAPI(
          Cypress.expose(ws1.id),
          newSettings,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
      });
    });
  });

  describe('35. GET /api/workspaces/{workspace_id}/units/{id}/properties ', () => {
    it('200 positive test: should retrieve the configuration properties of a specific unit', () => {
      cy.getUnitPropertiesAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(unit1.shortname),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        Cypress.expose('unit1_properties', resp.body);
        expect(resp.status).to.equal(200);
      });
    });

    it('403 negative test: should be refused when requesting unit properties without a workspace ID', () => {
      cy.getUnitPropertiesAPI(
        noId,
        Cypress.expose(unit1.shortname),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(403);
      });
    });

    it('404 negative test: should return error when requesting properties for a non-existent unit ID', () => {
      cy.getUnitPropertiesAPI(
        Cypress.expose(ws1.id),
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it('401 negative test: should deny access to unit properties when no credentials are provided', () => {
      cy.getUnitPropertiesAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(unit1.shortname),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });
  });

  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('36. PATCH /api/workspaces/{workspace_id}/units/{id}/properties', () => {
    let entry1: DefinitionUnit;
    before(() => {
      entry1 = {
        id: parseInt(`${Cypress.expose(unit1.shortname)}`, 10),
        groupName: 'Bista'
      };
    });

    it('200 positive test: should allow updating the configuration properties of a unit', () => {
      cy.updateUnitPropertiesAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(unit1.shortname),
        entry1,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it(
      '403 negative test: should be refused when attempting to update unit properties' +
        ' without a workspace ID',
      () => {
        cy.updateUnitPropertiesAPI(
          noId,
          Cypress.expose(unit1.shortname),
          entry1,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );

    it(
      '404 negative test: should refuse to update properties' +
        ' for a non-existent unit',
      () => {
        cy.updateUnitPropertiesAPI(
          Cypress.expose(ws1.id),
          noId,
          entry1,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(404);
        });
      }
    );

    it('500/200 negative test: should return success despite providing an invalid unit properties structure', () => {
      // Should not allow to pass incorrect structure
      cy.updateUnitPropertiesAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(unit1.shortname),
        noId,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        // expect(resp.status).to.equal(500); should
      });
    });

    it('401 negative test: should deny unit properties update when no valid credentials are provided', () => {
      cy.updateUnitPropertiesAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(unit1.shortname),
        entry1,
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('403 negative test: should deny unit properties update for a user without workspace permissions', () => {
      cy.updateUnitPropertiesAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(unit1.shortname),
        entry1,
        Cypress.expose(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(403);
      });
    });
  });
  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('37. GET /api/workspaces/{workspace_id}/units', () => {
    it('200 positive test: should retrieve the list of all units associated with a workspace', () => {
      // Sweagger has other parameter, and we get error 521, sweagger needs the version
      // And there is no parameter for version.
      cy.getUnitsByWsAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp1 => {
        expect(resp1.status).to.equal(200);
        expect(resp1.body.length).to.equal(1);
      });
    });

    it('401 negative test: should deny units listing when provided with incorrect authentication credentials', () => {
      cy.getUnitsByWsAPI(Cypress.expose(ws1.id), noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it(
      '403 negative test: should be refused when attempting to list units' +
        ' for a non-existent workspace ID',
      () => {
        cy.getUnitsByWsAPI(
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );
  });

  describe('38. PATCH /api/workspaces/{workspace_id}/units/workspace-id', () => {
    it(
      '403 negative test: should deny unit relocation for a user without sufficient' +
        ' permissions in the workspace',
      () => {
        cy.moveToAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          Cypress.expose(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(403);
        });
      }
    );

    it(
      '404 negative test: should refuse to move a unit out of a workspace it is not in' +
        ' (it is already in the target workspace)',
      () => {
        cy.moveToAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(ws2.id),
          Cypress.expose(unit2.shortname),
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          // Was 200 until #1775: the units of a move are now held to the workspace of the path.
          expect(resp.status).to.be.equal(404);
        });
      }
    );

    it('404 negative test: should refuse to move a non-existent unit', () => {
      cy.moveToAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(ws2.id),
        noId,
        Cypress.expose(`token_${userGroupAdmin.username}`)
      ).then(resp => {
        expect(resp.status).to.be.equal(404);
      });
    });

    it(
      '200 positive test: should successfully move a unit from its current workspace' +
        ' to another target workspace',
      () => {
        cy.moveToAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          Cypress.expose(`token_${userGroupAdmin.username}`)
        ).then(resp => {
          expect(resp.status).to.be.equal(200);
        });
      }
    );
  });

  describe('#1775 a unit asked for under a workspace it is not in', () => {
    // unit1 lives in ws2 since 38. The admin may enter ws1 as well, so every guard that asks about
    // the workspace alone lets the calls through; what answers 404 is that ws1 does not hold unit1.
    // None of them gets as far as changing anything.
    const routes: {
      method: string;
      route: (unit: string) => string;
      body?: (unit: string) => object;
      action?: string
    }[] = [
      { method: 'GET', route: unit => `units/${unit}/properties` },
      { method: 'GET', route: unit => `units/${unit}/metadata` },
      { method: 'GET', route: unit => `units/${unit}/definition` },
      { method: 'GET', route: unit => `units/${unit}/scheme` },
      { method: 'PATCH', route: unit => `units/${unit}/properties`, body: () => ({}) },
      { method: 'PATCH', route: unit => `units/${unit}/definition`, body: () => ({}) },
      { method: 'PATCH', route: unit => `units/${unit}/scheme`, body: () => ({}) },
      { method: 'DELETE', route: unit => `units/${unit}` },
      { method: 'DELETE', route: unit => `units?id=${unit}` },
      {
        method: 'PATCH',
        route: () => 'units/workspace-id',
        body: unit => ({ ids: [Number(unit)], targetId: Number(Cypress.expose(ws2.id)) })
      },
      {
        method: 'PATCH',
        route: () => 'units/drop-box-history',
        body: unit => ({ ids: [Number(unit)], targetId: Number(Cypress.expose(ws2.id)) }),
        action: 'submit'
      },
      {
        method: 'PATCH',
        route: () => 'units/drop-box-history',
        body: unit => ({ ids: [Number(unit)] }),
        action: 'return'
      },
      { method: 'GET', route: unit => `units/${unit}/rich-notes` },
      { method: 'POST', route: unit => `units/${unit}/rich-notes`, body: unit => ({ unitId: Number(unit) }) },
      { method: 'PATCH', route: unit => `units/${unit}/rich-notes/1`, body: () => ({}) },
      { method: 'PATCH', route: unit => `units/${unit}/rich-notes/1/items`, body: () => ({ itemReferences: [] }) },
      { method: 'DELETE', route: unit => `units/${unit}/rich-notes/1` },
      { method: 'GET', route: unit => `units/${unit}/items` },
      { method: 'POST', route: unit => `units/${unit}/items`, body: () => ({}) },
      { method: 'DELETE', route: unit => `units/${unit}/items/no-item` },
      { method: 'GET', route: unit => `units/${unit}/items/comments` },
      { method: 'GET', route: unit => `units/${unit}/items/no-item/metadata` },
      { method: 'POST', route: unit => `units/${unit}/items/no-item/metadata`, body: () => ({}) },
      { method: 'DELETE', route: unit => `units/${unit}/items/no-item/metadata/1` }
    ];

    routes.forEach(({
      method, route, body, action
    }) => {
      const name = `${method} ${route(':unit_id')}${action ? ` (${action})` : ''}`;
      it(`404 negative test: ${name} should refuse a unit of another workspace`, () => {
        const unit = `${Cypress.expose(unit1.shortname)}`;
        cy.requestWorkspaceAPI(
          method,
          `${Cypress.expose(ws1.id)}/${route(unit)}`,
          Cypress.expose(`token_${Cypress.expose('username')}`),
          body?.(unit)
        ).then(resp => {
          expect(resp.status).to.equal(404);
        });
      });
    });

    it('200 positive test: should still serve the unit under its own workspace', () => {
      // The 404s above are about the workspace, not a unit that is gone.
      cy.requestWorkspaceAPI(
        'GET',
        `${Cypress.expose(ws2.id)}/units/${Cypress.expose(unit1.shortname)}/definition`,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('#1778 an item, a note or a metadata row asked for under another unit', () => {
    // Two units of ws1, so every guard that asks about the workspace, or holds the unit to it, lets
    // the calls through. What answers 404 is that the item, the note or the row is not one of the
    // unit -- or, for the row, of the item -- in the path.
    const unitA: UnitData = { shortname: 'D1778A', name: 'Eigene', group: 'Group1' };
    const unitB: UnitData = { shortname: 'D1778B', name: 'Andere', group: 'Group1' };
    const token = () => Cypress.expose(`token_${Cypress.expose('username')}`);
    const ws = () => Cypress.expose(ws1.id);
    const ids = {
      unitA: '', unitB: '', itemA: '', otherItemA: '', itemB: '', noteA: '', rowA: ''
    };
    const under = (unit: string, route: string) => `${ws()}/units/${unit}/${route}`;
    const noteContent = 'Notiz zu #1778';

    const notesOfA = () => cy.requestWorkspaceAPI('GET', under(ids.unitA, 'rich-notes'), token())
      .then(resp => resp.body.notes as { id: number; content: string; itemReferences: string[] }[]);

    before(() => {
      cy.createUnitAPI(ws(), unitA, token()).then(resp => {
        ids.unitA = `${resp.body}`;
      });
      cy.createUnitAPI(ws(), unitB, token()).then(resp => {
        ids.unitB = `${resp.body}`;
      });
      cy.then(() => {
        cy.requestWorkspaceAPI('POST', under(ids.unitA, 'items'), token(), { id: 'item_1' }).then(resp => {
          expect(resp.status).to.equal(201);
          ids.itemA = resp.body;
        });
        cy.requestWorkspaceAPI('POST', under(ids.unitA, 'items'), token(), { id: 'item_2' }).then(resp => {
          expect(resp.status).to.equal(201);
          ids.otherItemA = resp.body;
        });
        cy.requestWorkspaceAPI('POST', under(ids.unitB, 'items'), token(), { id: 'item_1' }).then(resp => {
          expect(resp.status).to.equal(201);
          ids.itemB = resp.body;
        });
      });
      cy.then(() => {
        cy.requestWorkspaceAPI(
          'POST',
          under(ids.unitA, `items/${ids.itemA}/metadata`),
          token(),
          { profileId: 'profile-1778', entries: [] }
        ).then(resp => {
          expect(resp.status).to.equal(201);
          ids.rowA = `${resp.body}`;
        });
        cy.requestWorkspaceAPI(
          'POST',
          under(ids.unitA, 'rich-notes'),
          token(),
          {
            unitId: Number(ids.unitA), tagId: 'tag-1778', content: noteContent, itemReferences: [ids.itemA]
          }
        ).then(resp => {
          expect(resp.status).to.equal(201);
          ids.noteA = `${resp.body}`;
        });
      });
    });

    after(() => {
      cy.deleteUnitsAPI([ids.unitA, ids.unitB], ws(), token());
    });

    const refused: { name: string; method: string; route: () => string; body?: object }[] = [
      {
        name: 'DELETE an item of A under B',
        method: 'DELETE',
        route: () => under(ids.unitB, `items/${ids.itemA}`)
      },
      {
        name: 'PATCH a note of A under B',
        method: 'PATCH',
        route: () => under(ids.unitB, `rich-notes/${ids.noteA}`),
        body: { content: 'überschrieben' }
      },
      {
        name: 'PATCH the items of a note of A under B',
        method: 'PATCH',
        route: () => under(ids.unitB, `rich-notes/${ids.noteA}/items`),
        body: { itemReferences: [] }
      },
      {
        name: 'DELETE a note of A under B',
        method: 'DELETE',
        route: () => under(ids.unitB, `rich-notes/${ids.noteA}`)
      },
      {
        name: 'GET the metadata of an item of A under B',
        method: 'GET',
        route: () => under(ids.unitB, `items/${ids.itemA}/metadata`)
      },
      {
        name: 'POST metadata to an item of A under B',
        method: 'POST',
        route: () => under(ids.unitB, `items/${ids.itemA}/metadata`),
        body: { profileId: 'profile-1778-b', entries: [] }
      },
      {
        name: 'DELETE a metadata row of A under B',
        method: 'DELETE',
        route: () => under(ids.unitB, `items/${ids.itemA}/metadata/${ids.rowA}`)
      },
      {
        name: 'DELETE a metadata row under another item of its unit',
        method: 'DELETE',
        route: () => under(ids.unitA, `items/${ids.otherItemA}/metadata/${ids.rowA}`)
      },
      {
        name: 'DELETE an item whose uuid is not spelled as one',
        method: 'DELETE',
        route: () => under(ids.unitA, 'items/no-item')
      }
    ];

    refused.forEach(({
      name, method, route, body
    }) => {
      it(`404 negative test: should refuse to ${name}`, () => {
        cy.requestWorkspaceAPI(method, route(), token(), body).then(resp => {
          expect(resp.status).to.equal(404);
        });
      });
    });

    it('200 positive test: should have left the item, its metadata row and the note of A as they were', () => {
      cy.requestWorkspaceAPI('GET', under(ids.unitA, 'items'), token()).then(resp => {
        expect(resp.status).to.equal(200);
        const item = (resp.body as { uuid: string; profiles: { id: number }[] }[])
          .find(unitItem => unitItem.uuid === ids.itemA);
        expect(item?.profiles.map(row => `${row.id}`)).to.deep.equal([ids.rowA]);
      });
      notesOfA().then(notes => {
        expect(notes.map(({ id, content, itemReferences }) => ({ id: `${id}`, content, itemReferences })))
          .to.deep.equal([{ id: ids.noteA, content: noteContent, itemReferences: [ids.itemA] }]);
      });
    });

    it('200 positive test: should not tie a note to an item of another unit', () => {
      cy.requestWorkspaceAPI(
        'PATCH',
        under(ids.unitA, `rich-notes/${ids.noteA}/items`),
        token(),
        { itemReferences: [ids.itemA, ids.itemB] }
      ).its('status').should('equal', 200);
      notesOfA().then(notes => {
        expect(notes[0].itemReferences).to.deep.equal([ids.itemA]);
      });
    });

    it('200 positive test: should still let the note, the row and the item be changed under their own path', () => {
      cy.requestWorkspaceAPI('PATCH', under(ids.unitA, `rich-notes/${ids.noteA}`), token(), { content: 'geändert' })
        .its('status').should('equal', 200);
      cy.requestWorkspaceAPI('DELETE', under(ids.unitA, `items/${ids.itemA}/metadata/${ids.rowA}`), token())
        .its('status').should('equal', 200);
      cy.requestWorkspaceAPI('DELETE', under(ids.unitA, `items/${ids.otherItemA}`), token())
        .its('status').should('equal', 200);
      notesOfA().then(notes => {
        expect(notes[0].content).to.equal('geändert');
      });
    });
  });

  describe('#1816 saving the metadata of a unit with ids of another unit in the body', () => {
    // Saving A's metadata names its items and rows by the ids the body carries. An item of B named
    // there was updated -- renamed, moved into A -- and a row's unitId or unitItemUuid hung it on B.
    const unitA: UnitData = { shortname: 'D1816A', name: 'Eigene', group: 'Group1' };
    const unitB: UnitData = { shortname: 'D1816B', name: 'Andere', group: 'Group1' };
    const token = () => Cypress.expose(`token_${Cypress.expose('username')}`);
    const ws = () => Cypress.expose(ws1.id);
    const ids = {
      unitA: '', unitB: '', itemA: '', itemB: ''
    };
    const saveMetadataOfA = (metadata: object) => cy.requestWorkspaceAPI(
      'PATCH',
      `${ws()}/units/${ids.unitA}/properties`,
      token(),
      { id: Number(ids.unitA), metadata }
    );
    type Row = { profileId: string };
    type Item = { uuid: string; id: string; unitId: number; profiles: Row[] };
    const metadataOf = (unitId: string) => cy.requestWorkspaceAPI('GET', `${ws()}/units/${unitId}/metadata`, token())
      .then(resp => resp.body as { profiles: Row[]; items: Item[] });

    before(() => {
      cy.createUnitAPI(ws(), unitA, token()).then(resp => {
        ids.unitA = `${resp.body}`;
      });
      cy.createUnitAPI(ws(), unitB, token()).then(resp => {
        ids.unitB = `${resp.body}`;
      });
      cy.then(() => {
        cy.requestWorkspaceAPI('POST', `${ws()}/units/${ids.unitB}/items`, token(), { id: 'item_b' }).then(resp => {
          expect(resp.status).to.equal(201);
          ids.itemB = resp.body;
        });
        saveMetadataOfA({
          profiles: [{ profileId: 'unit-profile-1816', entries: [] }],
          items: [{ id: 'item_a', profiles: [{ profileId: 'item-profile-1816', entries: [] }] }]
        }).its('status').should('equal', 200);
      });
      cy.then(() => metadataOf(ids.unitA).then(metadata => {
        ids.itemA = metadata.items[0].uuid;
      }));
    });

    after(() => {
      cy.deleteUnitsAPI([ids.unitA, ids.unitB], ws(), token());
    });

    it('200 positive test: should leave an item of another unit as it was', () => {
      saveMetadataOfA({
        profiles: [{ profileId: 'unit-profile-1816', entries: [] }],
        items: [
          { uuid: ids.itemA, id: 'item_a', profiles: [{ profileId: 'item-profile-1816', entries: [] }] },
          {
            uuid: ids.itemB, id: 'umbenannt', unitId: Number(ids.unitA), profiles: []
          }
        ]
      }).its('status').should('equal', 200);
      metadataOf(ids.unitB).then(metadata => {
        expect(metadata.items.map(item => ({ uuid: item.uuid, id: item.id })))
          .to.deep.equal([{ uuid: ids.itemB, id: 'item_b' }]);
      });
      metadataOf(ids.unitA).then(metadata => {
        expect(metadata.items.map(item => item.uuid)).to.deep.equal([ids.itemA]);
      });
    });

    it('200 positive test: should keep the metadata rows with their unit and item, whatever the body names', () => {
      saveMetadataOfA({
        profiles: [{ profileId: 'unit-profile-1816', unitId: Number(ids.unitB), entries: [] }],
        items: [{
          uuid: ids.itemA,
          id: 'item_a',
          profiles: [{ profileId: 'item-profile-1816', unitItemUuid: ids.itemB, entries: [] }]
        }]
      }).its('status').should('equal', 200);
      metadataOf(ids.unitA).then(metadata => {
        expect(metadata.profiles.map(row => row.profileId)).to.include('unit-profile-1816');
        expect(metadata.items[0].profiles.map(row => row.profileId)).to.deep.equal(['item-profile-1816']);
      });
      metadataOf(ids.unitB).then(metadata => {
        expect(metadata.profiles || []).to.deep.equal([]);
        expect(metadata.items[0].profiles || []).to.deep.equal([]);
      });
    });
  });

  describe('#1779, #1780 units that cross into another workspace', () => {
    // A unit in ws3 (group2), where userzwei has no access. fadmin, who administers group2, is
    // assigned there for the time of these tests; ws3 has no users before and after them.
    const foreignUnit: UnitData = { shortname: 'D1779', name: 'Fremd', group: 'Group1' };
    const adminToken = () => Cypress.expose(`token_${Cypress.expose('username')}`);
    const groupAdminToken = () => Cypress.expose(`token_${userGroupAdmin.username}`);
    const foreignUnitId = () => Number(Cypress.expose(foreignUnit.shortname));

    before(() => {
      cy.setUsersOfWsAPI(
        Cypress.expose(ws3.id),
        [{ id: Cypress.expose(`id_${Cypress.expose('username')}`), access: AccessLevel.Admin }],
        adminToken()
      ).its('status').should('equal', 200);
      cy.createUnitAPI(Cypress.expose(ws3.id), foreignUnit, adminToken()).then(resp => {
        expect(resp.status).to.equal(201);
        Cypress.expose(foreignUnit.shortname, resp.body);
      });
    });

    after(() => {
      cy.deleteUnitsAPI([`${foreignUnitId()}`], Cypress.expose(ws3.id), adminToken());
      cy.setUsersOfWsAPI(Cypress.expose(ws3.id), [], adminToken());
    });

    it('404 negative test: should not copy a unit of a workspace the user cannot enter (#1779)', () => {
      cy.requestWorkspaceAPI(
        'POST',
        `${Cypress.expose(ws1.id)}/units`,
        groupAdminToken(),
        { ids: [foreignUnitId()], addComments: true }
      ).its('status').should('equal', 404);
    });

    it('404 negative test: should not create a unit from one of a workspace the user cannot enter (#1779)', () => {
      cy.requestWorkspaceAPI(
        'POST',
        `${Cypress.expose(ws1.id)}/units`,
        groupAdminToken(),
        { key: 'D1779_FROM', name: 'Fremd', createFrom: foreignUnitId() }
      ).its('status').should('equal', 404);
    });

    it('201 positive test: should create a new unit, not overwrite the one whose id is sent along (#1779)', () => {
      cy.requestWorkspaceAPI(
        'POST',
        `${Cypress.expose(ws1.id)}/units`,
        groupAdminToken(),
        { key: 'D1779_ID', name: 'Fremd', id: foreignUnitId() }
      ).then(resp => {
        expect(resp.status).to.equal(201);
        expect(resp.body).not.to.equal(foreignUnitId());
        cy.deleteUnitsAPI([`${resp.body}`], Cypress.expose(ws1.id), groupAdminToken())
          .its('status').should('equal', 200);
      });
      // The unit of ws3 is still there, unchanged
      cy.requestWorkspaceAPI(
        'GET',
        `${Cypress.expose(ws3.id)}/units/${foreignUnitId()}/properties`,
        adminToken()
      ).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.key).to.equal(foreignUnit.shortname);
      });
    });

    it('201 positive test: should create a unit from one of another workspace the user can enter', () => {
      cy.requestWorkspaceAPI(
        'POST',
        `${Cypress.expose(ws1.id)}/units`,
        adminToken(),
        { key: 'D1779_FROM', name: 'Fremd', createFrom: foreignUnitId() }
      ).then(resp => {
        expect(resp.status).to.equal(201);
        cy.deleteUnitsAPI([`${resp.body}`], Cypress.expose(ws1.id), adminToken())
          .its('status').should('equal', 200);
      });
    });

    it('403 negative test: should not move a unit into a workspace the user cannot manage units in (#1780)', () => {
      cy.moveToAPI(
        Cypress.expose(ws2.id),
        Cypress.expose(ws3.id),
        Cypress.expose(unit2.shortname),
        groupAdminToken()
      ).its('status').should('equal', 403);
      // Nothing was moved: unit2 is still in ws2
      cy.requestWorkspaceAPI(
        'GET',
        `${Cypress.expose(ws2.id)}/units/${Cypress.expose(unit2.shortname)}/properties`,
        groupAdminToken()
      ).its('status').should('equal', 200);
    });
  });

  // A unit submitted to a drop box from one workspace, returned, and later submitted to the same
  // drop box from another, has two submissions there. Returning it picked either of them, so it
  // could go back to the first workspace instead of the one it came from (#1806).
  describe('#1806 returning a unit from a drop box', () => {
    const token = () => Cypress.expose(`token_${Cypress.expose('username')}`);
    const unit: UnitData = { shortname: 'D1806', name: 'Abgabe', group: '' };
    const ids = {
      first: '', second: '', dropBox: '', unit: ''
    };
    const createWorkspace = (name: string, assign: (id: string) => void) => cy
      .createWsAPI(Cypress.expose(groupVera.id), { id: '', name }, token())
      .then(resp => {
        expect(resp.status).to.equal(201);
        assign(`${resp.body}`);
        const adminId = Cypress.expose(`id_${Cypress.expose('username')}`);
        cy.updateUsersOfWsAPI(`${resp.body}`, AccessLevel.Admin, adminId, token());
      });
    const submit = (from: string, to: string) => cy.submitUnitsAPI(from, to, ids.unit, token())
      .its('status').should('equal', 200);
    const unitKeysOf = (wsId: string) => cy.getUnitsByWsAPI(wsId, token())
      .then(resp => (resp.body as { key: string }[]).map(u => u.key));

    before(() => {
      createWorkspace('Erster-1806', id => { ids.first = id; });
      createWorkspace('Zweiter-1806', id => { ids.second = id; });
      createWorkspace('Ablage-1806', id => { ids.dropBox = id; });
      cy.then(() => {
        cy.createUnitAPI(ids.first, unit, token()).then(resp => {
          ids.unit = `${resp.body}`;
        });
        // First submission, from the first workspace, and its return
        cy.dropboxWsAPI(ids.first, ids.dropBox, token()).its('status').should('equal', 200);
        cy.dropboxWsAPI(ids.second, ids.dropBox, token()).its('status').should('equal', 200);
      });
      cy.then(() => {
        submit(ids.first, ids.dropBox);
        submit(ids.dropBox, '');
        // To the second workspace without leaving the history behind: as a submission, too
        cy.dropboxWsAPI(ids.first, ids.second, token()).its('status').should('equal', 200);
        submit(ids.first, ids.second);
        // Second submission to the drop box, from the second workspace
        submit(ids.second, ids.dropBox);
      });
    });

    after(() => {
      cy.deleteWsAPI([ids.first, ids.second, ids.dropBox], token());
    });

    it('200 positive test: should return the unit to the workspace of its latest submission', () => {
      submit(ids.dropBox, '');
      unitKeysOf(ids.second).should('include', unit.shortname);
      unitKeysOf(ids.first).should('not.include', unit.shortname);
    });
  });

  describe('39. PATCH /api/workspaces/{workspace_id}/name', () => {
    it('200 positive test: should allow an authorized user to rename a workspace', () => {
      cy.renameWsAPI(
        Cypress.expose(ws1.id),
        '01Vorlage-New',
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it('401 negative test: should deny workspace renaming when no valid credentials are provided', () => {
      cy.renameWsAPI(Cypress.expose(ws1.id), '02Vorlage-New', noId).then(
        resp => {
          expect(resp.status).to.equal(401);
        }
      );
    });

    it(
      '403 negative test: should be refused when attempting to rename' +
        ' a workspace using an invalid ID',
      () => {
        cy.renameWsAPI(
          noId,
          '03Vorlage-New',
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );
  });

  describe('40. POST /api/workspaces/{workspace_id}/units', () => {
    let copyUnit: CopyUnit;
    before(() => {
      copyUnit = {
        createFrom: parseInt(`${Cypress.expose(unit2.shortname)}`, 10),
        groupName: 'Group_Copy',
        key: `${unit2.shortname}_copy`,
        name: unit2.name
      };
    });

    it('401 negative test: should deny unit duplication when no valid authentication token is provided', () => {
      cy.copyToAPI(Cypress.expose(ws2.id), copyUnit, noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it(
      '500/201 negative test: should return success but fail to duplicate a unit' +
        ' when an invalid request structure is provided',
      () => {
        cy.copyToAPI(
          Cypress.expose(ws2.id),
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(201);
          // expect(resp.status).to.equal(500); // should
        });
      }
    );

    it(
      '403 negative test: should be refused when trying to duplicate' +
        ' a unit to a non-existent workspace',
      () => {
        cy.copyToAPI(
          noId,
          copyUnit,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );

    it('201 positive test: should allow an authorized user to duplicate a unit within a workspace', () => {
      cy.copyToAPI(
        Cypress.expose(ws2.id),
        copyUnit,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(201);
      });
    });
  });

  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('41. GET /api/workspaces/{workspace_id}/groups', () => {
    before(() => {
      cy.createUnitAPI(
        Cypress.expose(ws1.id),
        unit3,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        Cypress.expose(unit3.shortname, resp.body);
        expect(resp.status).to.equal(201);
      });
      cy.createUnitAPI(
        Cypress.expose(ws1.id),
        unit4,
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        Cypress.expose(unit4.shortname, resp.body);
        expect(resp.status).to.equal(201);
      });
    });

    it('200 positive test: should retrieve the list of unit groups associated with a workspace', () => {
      cy.getGroupsOfWsAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.length).to.equal(3);
      });
    });

    it('401 negative test: should deny unit group listing when no valid credentials are provided', () => {
      cy.getGroupsOfWsAPI(Cypress.expose(ws1.id), noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it(
      '403 negative test: should be refused when requesting unit groups' +
        ' for an invalid workspace ID',
      () => {
        cy.getGroupsOfWsAPI(
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );
  });

  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('42. PATCH /api/workspaces/{workspace_id}/group-name', () => {
    it('200 positive test: should allow an authorized user to add or update a group name for a workspace', () => {
      cy.updateGroupNameOfWsAPI(
        Cypress.expose(ws1.id),
        'new group for w1',
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it('401 negative test: should deny group name updates when no credentials are provided', () => {
      cy.updateGroupNameOfWsAPI(
        Cypress.expose(ws1.id),
        'no credentials Group',
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it(
      '500 negative test: should return a server error when attempting to update' +
        ' a group name for a non-existent workspace',
      () => {
        cy.updateGroupNameOfWsAPI(
          noId,
          'no valid Ws Group',
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(500);
        });
      }
    );
  });

  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('43. GET /api/workspaces/{workspace_id}/units/{id}/scheme', () => {
    it('200 positive test: should retrieve the coding scheme associated with a specific unit', () => {
      cy.getUnitSchemeAPI(
        Cypress.expose(unit4.shortname),
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });

    it('404 negative test: should refuse to return a unit scheme for an invalid unit ID', () => {
      cy.getUnitSchemeAPI(
        noId,
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(404);
      });
    });

    it(
      '403 negative test: should be refused when requesting' +
        ' a unit scheme without a valid workspace ID',
      () => {
        cy.getUnitSchemeAPI(
          Cypress.expose(unit4.shortname),
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );

    it('401 positive test: should deny access to the unit scheme when no credentials are provided', () => {
      cy.getUnitSchemeAPI(
        Cypress.expose(unit4.shortname),
        Cypress.expose(ws1.id),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });
  });

  describe('44. PATH /api/workspaces/{workspace_id}/units/{id}/definition', () => {
    before(() => {
      // 41, but with different parameters in body
      const authorization = `bearer ${Cypress.expose(
        `token_${Cypress.expose('username')}`
      )}`;
      const nu = parseInt(`${Cypress.expose(unit4.shortname)}`, 10);
      cy.request({
        method: 'PATCH',
        url: `/api/workspaces/${Cypress.expose(ws1.id)}/units/${Cypress.expose(
          unit4.shortname
        )}/properties`,
        headers: {
          'app-version': Cypress.expose('version'),
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

    it(
      '404 negative test: should refuse ' +
        'to update a unit definition without a valid unit ID',
      () => {
        cy.updateUnitDefinitionAPI(
          noId,
          Cypress.expose(ws1.id),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(404);
        });
      }
    );

    it(
      '403 negative test: should be refused when attempting to update ' +
        'a unit definition without a valid workspace ID',
      () => {
        cy.updateUnitDefinitionAPI(
          Cypress.expose(unit4.shortname),
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );

    it('401 positive test: should deny unit definition updates when no authentication token is provided', () => {
      cy.updateUnitDefinitionAPI(
        Cypress.expose(unit4.shortname),
        Cypress.expose(ws1.id),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it(
      '403 negative test: should deny unit definition updates for a user ' +
        'with insufficient workspace privileges',
      () => {
        cy.updateUnitDefinitionAPI(
          Cypress.expose(unit4.shortname),
          Cypress.expose(ws1.id),
          Cypress.expose(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );

    it(
      '200 positive test: should allowed an authorized user to update and ' +
        'save the unit definition in the editor',
      () => {
        cy.updateUnitDefinitionAPI(
          Cypress.expose(unit4.shortname),
          Cypress.expose(ws1.id),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
      }
    );
  });

  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('45. GET /api/workspaces/{workspace_id}/units/{id}/definition', () => {
    it(
      '404 negative test: should refuse to retrieve ' +
        'a unit definition without a valid unit ID',
      () => {
        cy.getUnitDefinitionAPI(
          noId,
          Cypress.expose(ws1.id),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(404);
        });
      }
    );

    it(
      '403 negative test: should be refused when attempting to retrieve ' +
        'a unit definition without a valid workspace ID',
      () => {
        cy.getUnitDefinitionAPI(
          Cypress.expose(unit4.shortname),
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );

    it('401 positive test: should deny access to the unit definition when no authentication token is provided', () => {
      cy.getUnitDefinitionAPI(
        Cypress.expose(unit4.shortname),
        Cypress.expose(ws1.id),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('403 negative test: should deny access to the unit definition for a user without sufficient privileges', () => {
      cy.getUnitDefinitionAPI(
        Cypress.expose(unit4.shortname),
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(403);
      });
    });

    it('200 positive test: should allow an authorized user to retrieve the full definition of a unit', () => {
      cy.getUnitDefinitionAPI(
        Cypress.expose(unit4.shortname),
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('46. PATCH /api/workspaces/{workspace_id}/units/{id}/scheme', () => {
    it(
      '404 negative test: should refuse to update' +
        ' variable coding without a valid unit ID',
      () => {
        cy.updateUnitSchemeAPI(
          noId,
          Cypress.expose(ws1.id),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(404);
        });
      }
    );

    it(
      '403 negative test: should be refused when attempting to update variable coding ' +
        'without a valid workspace ID',
      () => {
        cy.updateUnitSchemeAPI(
          Cypress.expose(unit4.shortname),
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );

    it('401 positive test: should deny variable coding updates when no valid credentials are provided', () => {
      cy.updateUnitSchemeAPI(
        Cypress.expose(unit4.shortname),
        Cypress.expose(ws1.id),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it(
      '403 negative test: should deny variable coding updates for a user with ' +
        'insufficient workspace permissions',
      () => {
        cy.updateUnitSchemeAPI(
          Cypress.expose(unit4.shortname),
          Cypress.expose(ws1.id),
          Cypress.expose(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );

    it('200 positive test: should successfully update the variable coding scheme with valid parameters', () => {
      cy.updateUnitSchemeAPI(
        Cypress.expose(unit4.shortname),
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('47. GET /api/workspaces/{workspace_id}/units/properties', () => {
    it(
      '403 negative test: should be refused when generating a metadata report' +
        ' without a valid workspace ID',
      () => {
        cy.generateMetadataReportAPI(
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );

    it(
      '401 positive test: should deny metadata report generation when no valid authentication token' +
        ' is provided',
      () => {
        cy.generateMetadataReportAPI(Cypress.expose(ws1.id), noId).then(
          resp => {
            expect(resp.status).to.equal(401);
          }
        );
      }
    );

    it('403 negative test: should deny metadata report generation for an unauthorized user', () => {
      cy.generateMetadataReportAPI(
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(403);
      });
    });

    it(
      '200 positive test: should successfully generate a metadata properties report' +
        ' for an authorized workspace',
      () => {
        cy.generateMetadataReportAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body[0].name).to.equal('Tier3');
        });
      }
    );
  });

  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('48. GET /api/workspaces/{workspace_id}/units/scheme', () => {
    it(
      '403 negative test: should be refused when generating a variable ' +
        'coding report without a valid workspace ID',
      () => {
        cy.getWsSchemeAPI(
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );

    it('401 positive test: should deny variable coding report generation when no credentials are provided', () => {
      cy.getWsSchemeAPI(Cypress.expose(ws1.id), noId).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it(
      '403 negative test: should deny variable coding report generation for a user' +
        ' without sufficient privileges',
      () => {
        cy.getWsSchemeAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(`token_${user3.username}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );

    it(
      '200 positive test: should successfully generate a variable coding scheme report' +
        ' for a specified workspace',
      () => {
        cy.getWsSchemeAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body[1].validation).to.equal('OK');
        });
      }
    );
  });

  // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
  describe('49. GET /api/workspaces/{workspace_id}/units/coding-book', () => {
    it(
      '403 negative test: should be refused when requesting a coding book' +
        ' without a valid workspace ID',
      () => {
        cy.getWsCodingBookAPI(
          [Cypress.expose(unit3.shortname), Cypress.expose(unit4.shortname)],
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      }
    );

    it('401 positive test: should deny coding book generation when no valid authentication token is provided', () => {
      cy.getWsCodingBookAPI(
        [Cypress.expose(unit3.shortname), Cypress.expose(unit4.shortname)],
        Cypress.expose(ws1.id),
        noId
      ).then(resp => {
        expect(resp.status).to.equal(401);
      });
    });

    it('403 negative test: should deny coding book generation for an unauthorized user', () => {
      cy.getWsCodingBookAPI(
        [Cypress.expose(unit3.shortname), Cypress.expose(unit4.shortname)],
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${user3.username}`)
      ).then(resp => {
        expect(resp.status).to.equal(403);
      });
    });

    it('200 positive test: should successfully generate a coding book for selected units in a workspace', () => {
      cy.getWsCodingBookAPI(
        [Cypress.expose(unit3.shortname), Cypress.expose(unit4.shortname)],
        Cypress.expose(ws1.id),
        Cypress.expose(`token_${Cypress.expose('username')}`)
      ).then(resp => {
        expect(resp.status).to.equal(200);
      });
    });
  });

  describe('States block', () => {
    describe('50. PATCH /api/workspace-groups/{workspace_group_id}', () => {
      it('200 positive test: should successfully add new states to a workspace group with valid credentials', () => {
        cy.updateGroupPropertiesAPI(
          Cypress.expose(groupVera.id),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
      });

      it('401 negative test: should deny adding new states to a group when no credentials are provided', () => {
        cy.updateGroupPropertiesAPI(Cypress.expose(group2.id), noId).then(
          resp => {
            expect(resp.status).to.equal(401);
          }
        );
      });

      it(
        '500 negative test: should return a server error when attempting to add states' +
          ' for an invalid workspace group ID',
        () => {
          cy.updateGroupPropertiesAPI(
            noId,
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(500);
          });
        }
      );
    });

    // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
    describe('51. GET /api/workspace-groups/{workspace_group_id}', () => {
      // It is used when we enter a ws
      it('200 positive test: should retrieve the properties and configuration for a workspace group', () => {
        cy.getGroupPropertiesAPI(
          Cypress.expose(groupVera.id),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
      });

      it('401 negative test: should deny access to group properties when no credentials are provided', () => {
        cy.getGroupPropertiesAPI(Cypress.expose(group2.id), noId).then(
          resp => {
            expect(resp.status).to.equal(401);
          }
        );
      });

      it(
        '500 negative test: should return a server error when attempting to retrieve' +
          ' properties for an invalid group ID',
        () => {
          cy.updateGroupPropertiesAPI(
            noId,
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(500);
          });
        }
      );
    });

    // ***************** IMPORTANT: changes MUST be reported to METHOD TEAM **********************
    describe('52. PATCH /api/workspaces/{workspace_id}/units/{id}/properties ', () => {
      it('200 positive test: should allow assigning a specific workflow state target to a unit', () => {
        cy.updateUnitStateAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(unit3.shortname),
          '1',
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
        });
      });

      it('401 negative test: should deny unit state updates when no valid credentials are provided', () => {
        cy.updateUnitStateAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(unit3.shortname),
          '0',
          noId
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });
      // This test should be negative and return 500. The status 5 does not exit.

      it('500/200 negative test: should return success despite attempting to assign a non-existent state ID', () => {
        cy.updateUnitStateAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(unit3.shortname),
          '5',
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          // expect(resp.status).to.equal(500);  // should
        });
      });

      it(
        '404 negative test: should refuse to assign' +
          ' an unit state without a valid unit ID',
        () => {
          cy.updateUnitStateAPI(
            Cypress.expose(ws1.id),
            noId,
            '0',
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(404);
          });
        }
      );
    });

    describe('53. GET /api/workspaces/{workspace_id}/units/{id}/metadata', () => {
      // I can not find the use in studio.
      // To delete, in sweagger, results are always two empty arrays: profiles and items
      it('200 positive test: should retrieve the metadata records associated with a unit in a workspace', () => {
        cy.getUnitMetadataAPI(
          Cypress.expose(ws2.id),
          Cypress.expose(unit1.shortname),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(200);
          // console.log(resp.body);
        });
      });

      it('401 negative test: should deny access to unit metadata when no valid credentials are provided', () => {
        cy.getUnitMetadataAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(unit1.shortname),
          noId
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it(
        '403 negative test: should be refused when attempting to retrieve metadata for ' +
          'a non-existent workspace ID',
        () => {
          cy.getUnitMetadataAPI(
            noId,
            Cypress.expose(unit1.shortname),
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(403);
          });
        }
      );
    });
  });

  describe('Dropbox block', () => {
    describe('54. PATCH /api/workspaces/{workspace_id}/drop-box', () => {
      it('401 negative test: should deny designating a workspace as a dropbox without valid credentials', () => {
        cy.dropboxWsAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(ws2.id),
          noId
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it('403 negative test: should be refused when designating a dropbox for a non-existent workspace', () => {
        cy.dropboxWsAPI(
          noId,
          Cypress.expose(ws2.id),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      });

      // A drop box is another workspace of the same group; one that does not exist, one of another
      // group and the workspace itself are answered alike, as not found (#1805)
      it('404 negative test: should refuse a non-existent workspace as the dropbox target', () => {
        cy.dropboxWsAPI(
          Cypress.expose(ws1.id),
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).its('status').should('equal', 404);
      });

      it('404 negative test: should refuse a workspace of another group as the dropbox target', () => {
        cy.dropboxWsAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(ws3.id),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).its('status').should('equal', 404);
      });

      it('404 negative test: should refuse the workspace itself as its dropbox', () => {
        cy.dropboxWsAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(ws1.id),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).its('status').should('equal', 404);
      });

      it(
        '200 positive test: should allow an authorized user to designate a workspace as ' +
          'the dropbox for another workspace',
        () => {
          cy.dropboxWsAPI(
            Cypress.expose(ws1.id),
            Cypress.expose(ws2.id),
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(200);
          });
        }
      );
    });

    describe('55. PATCH /api/workspaces/{workspace_id}/units/drop-box-history', () => {
      it('401 negative test: should deny unit submission to the dropbox when no credentials are provided', () => {
        cy.submitUnitsAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(ws2.id),
          Cypress.expose(unit3.shortname),
          noId
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it(
        '403 negative test: should be refused when attempting to submit units without' +
          ' specifying an origin workspace',
        () => {
          cy.submitUnitsAPI(
            noId,
            Cypress.expose(ws2.id),
            Cypress.expose(unit3.shortname),
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(403);
          });
        }
      );

      it('404 negative test: should refuse to submit units without a valid unit ID', () => {
        cy.submitUnitsAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(ws2.id),
          noId,
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(404);
        });
      });

      it(
        '403 negative test: should refuse to submit units to a workspace that does not exist',
        () => {
          cy.submitUnitsAPI(
            Cypress.expose(ws1.id),
            noId,
            Cypress.expose(unit3.shortname),
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            // Was 500 until #1780: the target has to be the drop box of the workspace.
            expect(resp.status).to.equal(403);
          });
        }
      );

      it('403 negative test: should refuse to submit units to a workspace that is not the drop box (#1780)', () => {
        cy.submitUnitsAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(ws3.id),
          Cypress.expose(unit3.shortname),
          Cypress.expose(`token_${Cypress.expose('username')}`)
        ).then(resp => {
          expect(resp.status).to.equal(403);
        });
      });

      it(
        '200 positive test: should successfully submit a unit from an origin workspace' +
          ' to a dropbox destination',
        () => {
          cy.submitUnitsAPI(
            Cypress.expose(ws1.id),
            Cypress.expose(ws2.id),
            Cypress.expose(unit3.shortname),
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(200);
          });
        }
      );
    });

    describe('55a. PATCH /api/workspaces/{workspace_id}/units/drop-box-history', () => {
      it('401 negative test: should deny unit submission retrieval when no valid credentials are provided', () => {
        cy.submitUnitsAPI(
          Cypress.expose(ws2.id),
          '',
          Cypress.expose(unit3.shortname),
          noId
        ).then(resp => {
          expect(resp.status).to.equal(401);
        });
      });

      it(
        '403 negative test: should be refused when attempting to retrieve unit submission' +
          ' without an origin workspace',
        () => {
          cy.submitUnitsAPI(
            noId,
            '',
            Cypress.expose(unit3.shortname),
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(403);
          });
        }
      );

      it(
        '404 negative test: should refuse to return a unit submission ' +
          'for an invalid unit ID',
        () => {
          cy.submitUnitsAPI(
            Cypress.expose(ws2.id),
            '',
            noId,
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(404);
          });
        }
      );

      it(
        '200 positive test: should successfully retrieve unit submission data ' +
          'with proper origin, unit ID, and credentials',
        () => {
          cy.submitUnitsAPI(
            Cypress.expose(ws2.id),
            '',
            Cypress.expose(unit3.shortname),
            Cypress.expose(`token_${Cypress.expose('username')}`)
          ).then(resp => {
            expect(resp.status).to.equal(200);
          });
        }
      );

      // unit2 was created in ws2, the drop box of ws1: it was never submitted, so it has nowhere to
      // go back to. Until #1793 that ended the whole request in a 500.
      it('200 positive test: should return the submitted units and report one that was never submitted (#1793)', () => {
        const token = Cypress.expose(`token_${Cypress.expose('username')}`);
        cy.submitUnitsAPI(
          Cypress.expose(ws1.id),
          Cypress.expose(ws2.id),
          Cypress.expose(unit3.shortname),
          token
        ).its('status').should('equal', 200);
        cy.requestWorkspaceAPI(
          'PATCH',
          `${Cypress.expose(ws2.id)}/units/drop-box-history`,
          token,
          { ids: [Number(Cypress.expose(unit3.shortname)), Number(Cypress.expose(unit2.shortname))] }
        ).then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.body.messages).to.deep.equal([
            { objectKey: unit2.shortname, messageKey: 'unit-patch.not-submitted' }
          ]);
        });
        // unit3 is back in ws1, unit2 stays in ws2
        cy.requestWorkspaceAPI(
          'GET',
          `${Cypress.expose(ws1.id)}/units/${Cypress.expose(unit3.shortname)}/properties`,
          token
        ).its('status').should('equal', 200);
        cy.requestWorkspaceAPI(
          'GET',
          `${Cypress.expose(ws2.id)}/units/${Cypress.expose(unit2.shortname)}/properties`,
          token
        ).its('status').should('equal', 200);
      });
    });
  });
});
