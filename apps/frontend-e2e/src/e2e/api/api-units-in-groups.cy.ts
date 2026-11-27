import type { WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import {
  AccessLevel, baseGroup, groupAdminUser, primaryWorkspace, secondaryWorkspace, standardUser, UnitData
} from '../../support/testData';
import { buildDownloadQuery } from '../../support/api';
import { createGroupAdminBaseAPI } from '../../support/helpers/test-base';

// What the views of a group admin read across the workspaces of a group, and what a workspace
// reads of a unit's items. The base: the first user, an administrator; a group admin who is in
// none of the two workspaces of the group; a developer in both. Besides, a second group whose unit
// must not appear in the first.
describe('Units and items of a group and of a workspace', () => {
  const unitA: UnitData = { shortname: 'D2239A', name: 'Erste', group: 'Block 1' };
  const unitB: UnitData = { shortname: 'D2239B', name: 'Zweite', group: 'Block 1' };
  const unitC: UnitData = { shortname: 'D2239C', name: 'Dritte', group: '' };
  const unitD: UnitData = { shortname: 'D2239D', name: 'Im zweiten Bereich', group: 'Block 1' };
  const unitE: UnitData = { shortname: 'D2239E', name: 'Einer anderen Gruppe', group: '' };
  const ids = {
    groupId: '', otherGroupId: '', wsId: '', secondaryWsId: '', otherWsId: '', itemA: '', itemE: '', commentA: ''
  };
  const unitIds: Record<string, string> = {};
  const tokens = { admin: '', groupAdmin: '', developer: '' };

  const createUnit = (wsId: string, unit: UnitData) => cy.createUnitAPI(wsId, unit, tokens.admin).then(resp => {
    expect(resp.status, unit.shortname).to.equal(201);
    unitIds[unit.shortname] = String(resp.body);
  });
  const createItem = (wsId: string, unit: UnitData) => cy.requestWorkspaceAPI(
    'POST',
    `${wsId}/units/${unitIds[unit.shortname]}/items`,
    tokens.admin,
    { id: 'item_1' }
  ).then(resp => {
    expect(resp.status, `item of ${unit.shortname}`).to.equal(201);
    return String(resp.body);
  });

  before(() => {
    createGroupAdminBaseAPI({
      users: [{ user: groupAdminUser, groupAdmin: true }, { user: standardUser, access: AccessLevel.Developer }],
      firstUserAccess: AccessLevel.Admin
    }).then(base => {
      tokens.admin = base.token;
      ids.wsId = base.wsId;
      ids.secondaryWsId = base.secondaryWsId;
    });
    cy.then(() => {
      cy.getWsGroupsAPI(tokens.admin).then(resp => {
        expect(resp.status, 'groups').to.equal(200);
        const group = (resp.body as WorkspaceGroupInListDto[]).find(({ name }) => name === baseGroup);
        expect(group, baseGroup).not.to.equal(undefined);
        ids.groupId = String(group?.id);
      });
      [unitA, unitB, unitC].forEach(unit => createUnit(ids.wsId, unit));
      createUnit(ids.secondaryWsId, unitD);
      cy.createGroupAPI({ id: '', name: 'Andere Gruppe' }, tokens.admin).then(group => {
        expect(group.status, 'other group').to.equal(201);
        ids.otherGroupId = String(group.body);
        cy.createWsAPI(String(group.body), { id: '', name: 'Anderer Bereich' }, tokens.admin).then(ws => {
          expect(ws.status, 'workspace of the other group').to.equal(201);
          ids.otherWsId = String(ws.body);
          // creating units and items takes write access, which being an administrator does not give
          cy.getUserIdAPI(tokens.admin).then(authData => {
            expect(authData.status, 'id of the first user').to.equal(200);
            cy.setUsersOfWsAPI(
              ids.otherWsId,
              [{ id: String(authData.body.userId), access: AccessLevel.Admin }],
              tokens.admin
            ).its('status').should('equal', 200);
          });
          createUnit(ids.otherWsId, unitE);
        });
      });
      [[groupAdminUser, 'groupAdmin'], [standardUser, 'developer']].forEach(([user, key]) => {
        const { username, password } = user as typeof standardUser;
        cy.loginAPI(username, password).then(resp => {
          expect(resp.status, `login of ${username}`).to.equal(201);
          tokens[key as 'groupAdmin' | 'developer'] = resp.body.accessToken;
        });
      });
    });
    cy.then(() => {
      createItem(ids.wsId, unitA).then(uuid => {
        ids.itemA = uuid;
        cy.requestWorkspaceAPI(
          'POST',
          `${ids.wsId}/units/${unitIds[unitA.shortname]}/items/${uuid}/metadata`,
          tokens.admin,
          { profileId: 'profile-2239', entries: [] }
        ).its('status').should('equal', 201);
      });
      createItem(ids.otherWsId, unitE).then(uuid => {
        ids.itemE = uuid;
      });
      cy.postCommentAPI(ids.wsId, unitIds[unitA.shortname], { body: 'Zum Item', userName: 'Admin' }, tokens.admin)
        .then(resp => {
          expect(resp.status, 'comment').to.equal(201);
          ids.commentA = String(resp.body);
        });
    });
  });

  describe('GET /api/workspace-groups/{workspace_group_id}/units', () => {
    it('200 positive test: should list the units of every workspace of the group, and only those', () => {
      cy.getGroupUnitsAPI(ids.groupId, tokens.groupAdmin).then(resp => {
        expect(resp.status).to.equal(200);
        const units = (resp.body as { key: string, workspaceName: string }[])
          .map(({ key, workspaceName }) => `${key} ${workspaceName}`);
        expect(units).to.deep.equal([
          `${unitA.shortname} ${primaryWorkspace}`,
          `${unitB.shortname} ${primaryWorkspace}`,
          `${unitC.shortname} ${primaryWorkspace}`,
          `${unitD.shortname} ${secondaryWorkspace}`
        ]);
      });
    });

    it('403 negative test: should keep them from a user who is no admin of the group', () => {
      cy.getGroupUnitsAPI(ids.groupId, tokens.developer).its('status').should('equal', 403);
    });

    it('403 negative test: should keep them from the admin of another group', () => {
      cy.getGroupUnitsAPI(ids.otherGroupId, tokens.groupAdmin).its('status').should('equal', 403);
    });
  });

  describe('GET /api/workspace-groups/{workspace_group_id}/unit-items', () => {
    it('200 positive test: should list the items of the group\'s units with their unit and workspace', () => {
      cy.getGroupUnitItemsAPI(ids.groupId, tokens.groupAdmin).then(resp => {
        expect(resp.status).to.equal(200);
        const items = resp.body as { uuid: string, unitKey: string, workspaceId: number, workspaceName: string }[];
        expect(items.map(({
          uuid, unitKey, workspaceId, workspaceName
        }) => ({
          uuid, unitKey, workspaceId: String(workspaceId), workspaceName
        }))).to.deep.equal([{
          uuid: ids.itemA, unitKey: unitA.shortname, workspaceId: ids.wsId, workspaceName: primaryWorkspace
        }]);
      });
    });

    it('403 negative test: should keep them from a user who is no admin of the group', () => {
      cy.getGroupUnitItemsAPI(ids.groupId, tokens.developer).its('status').should('equal', 403);
    });

    it('403 negative test: should keep them from the admin of another group', () => {
      cy.getGroupUnitItemsAPI(ids.otherGroupId, tokens.groupAdmin).its('status').should('equal', 403);
    });
  });

  describe('POST /api/workspaces/{workspace_id}/download-units', () => {
    // a POST, as the settings go in the body, and so answered with 201 though it creates nothing
    it('201 positive test: should export the units as JSON to a group admin outside the workspace', () => {
      cy.downloadUnitsJsonAPI(ids.wsId, buildDownloadQuery([unitIds[unitA.shortname]]), tokens.groupAdmin)
        .then(resp => {
          expect(resp.status).to.equal(201);
          expect(resp.headers['content-type']).to.contain('application/zip');
          // the zip lists its file names uncompressed
          expect(resp.body).to.include(`${unitA.shortname}.json`);
          expect(resp.body).not.to.include(`${unitA.shortname}.xml`);
        });
    });

    it('403 negative test: should refuse a user who is neither in the workspace nor an admin of its group', () => {
      cy.downloadUnitsJsonAPI(ids.otherWsId, buildDownloadQuery([unitIds[unitE.shortname]]), tokens.developer)
        .its('status').should('equal', 403);
    });

    it('403 negative test: should refuse the admin of another group', () => {
      cy.downloadUnitsJsonAPI(ids.otherWsId, buildDownloadQuery([unitIds[unitE.shortname]]), tokens.groupAdmin)
        .its('status').should('equal', 403);
    });
  });

  describe('GET /api/workspaces/{workspace_id}/units/{unit_id}/items', () => {
    const itemsOfA = (withoutMetadata?: boolean) => cy
      .getUnitItemsAPI(ids.wsId, unitIds[unitA.shortname], tokens.developer, withoutMetadata);

    it('200 positive test: should hand out the items with their metadata', () => {
      itemsOfA().then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.map((item: { uuid: string }) => item.uuid)).to.deep.equal([ids.itemA]);
        expect(resp.body[0].profiles.map((row: { profileId: string }) => row.profileId))
          .to.deep.equal(['profile-2239']);
      });
    });

    it('200 positive test: should leave the metadata out when asked to', () => {
      itemsOfA(true).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.map((item: { uuid: string }) => item.uuid)).to.deep.equal([ids.itemA]);
        expect(resp.body[0]).not.to.have.property('profiles');
      });
    });
  });

  describe('GET /api/workspaces/{workspace_id}/units/{unit_id}/items/comments', () => {
    it('200 positive test: should tell which comment is about which item', () => {
      const unitId = unitIds[unitA.shortname];
      cy.getUnitItemCommentsAPI(ids.wsId, unitId, tokens.developer).then(before => {
        expect(before.status).to.equal(200);
        expect(before.body).to.deep.equal([]);
      });
      cy.patchCommentItemsAPI(ids.wsId, unitId, ids.commentA, [ids.itemA], tokens.admin)
        .its('status').should('equal', 200);
      cy.getUnitItemCommentsAPI(ids.wsId, unitId, tokens.developer).then(resp => {
        expect(resp.status).to.equal(200);
        expect(resp.body.map((link: { unitItemUuid: string, unitCommentId: number }) => (
          `${link.unitCommentId} ${link.unitItemUuid}`
        ))).to.deep.equal([`${ids.commentA} ${ids.itemA}`]);
      });
    });
  });

  // Last, as it changes the groups of the units
  describe('PATCH /api/workspaces/{workspace_id}/units/group-name', () => {
    const groupsIn = (wsId: string) => cy.getUnitsByWsAPI(wsId, tokens.admin).then(resp => {
      expect(resp.status).to.equal(200);
      return (resp.body as { key: string, groupName: string }[])
        .map(({ key, groupName }) => `${key} ${groupName || '-'}`);
    });

    it('200 positive test: should give the group to the units sent, and take it from its others', () => {
      cy.patchUnitsGroupNameAPI(ids.wsId, 'Block 1', [unitIds[unitC.shortname]], tokens.admin)
        .its('status').should('equal', 200);
      groupsIn(ids.wsId).then(groups => {
        expect(groups).to.deep.equal([
          `${unitA.shortname} -`,
          `${unitB.shortname} -`,
          `${unitC.shortname} Block 1`
        ]);
      });
      // a group of the same name in another workspace is another group
      groupsIn(ids.secondaryWsId).then(groups => {
        expect(groups).to.deep.equal([`${unitD.shortname} Block 1`]);
      });
    });

    it('403 negative test: should not let a developer group the units', () => {
      cy.patchUnitsGroupNameAPI(ids.wsId, 'Block 2', [unitIds[unitA.shortname]], tokens.developer)
        .its('status').should('equal', 403);
    });
  });
});
