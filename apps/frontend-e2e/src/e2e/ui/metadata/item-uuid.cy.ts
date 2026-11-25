import { AccessLevel, CommentData } from '../../../support/testData';
import { addFirstUser, FIRST_WORKSPACE_REQUEST_TIMEOUT } from '../../../support/helpers';

// A new item gets its uuid from the server when the unit is saved. Until #1830 the frontend did not
// take it over: the next save in the same view sent the item as a new one, the server deleted it and
// created it anew, and the links of comments and notes to it were gone. The metadata have a tab and a
// route of their own since #2200, and the save answers them as stored, the uuids included.
describe('An item saved a second time in the same view', () => {
  const group = { id: '', name: 'ItemUuidGroup' };
  const ws = { id: '', name: 'ItemUuidWorkspace' };
  const unit = { shortname: 'ITEMUUID1', name: 'Item mit UUID', group: '' };
  let token = '';
  let userId = 0;
  let wsId = '';
  let unitId = '';

  before(() => {
    addFirstUser();
    cy.window().then(win => {
      token = win.localStorage.getItem('id_token') || '';
      cy.getUserIdAPI(token).then(authData => {
        userId = authData.body.userId;
        cy.createGroupAPI(group, token).then(createdGroup => {
          const groupId = String(createdGroup.body);
          cy.createWsAPI(groupId, ws, token).then(createdWs => {
            wsId = String(createdWs.body);
            cy.updateUsersOfWsAPI(wsId, AccessLevel.Admin, String(userId), token)
              .its('status').should('equal', 200);
            cy.createUnitAPI(wsId, unit, token).then(createdUnit => {
              expect(createdUnit.status).to.equal(201);
              unitId = String(createdUnit.body);
            });
          });
        });
      });
    });
  });

  it('keeps its uuid and the comment linked to it', () => {
    let itemUuid = '';
    cy.intercept('PATCH', `/api/workspaces/${wsId}/units/${unitId}/metadata`).as('saveMetadata');
    cy.intercept('GET', `/api/workspaces/${wsId}/units/${unitId}/metadata`).as('loadMetadata');
    cy.visit(`/#/a/${wsId}/${unitId}/metadata`);
    cy.wait('@loadMetadata', { requestTimeout: FIRST_WORKSPACE_REQUEST_TIMEOUT });

    cy.get('.add-item-button').click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.contains('studio-lite-item mat-expansion-panel-header', json.metadata['without-id']).click();
    });
    cy.contains('studio-lite-item mat-form-field', 'Item ID').find('input').type('A1');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
    cy.wait('@saveMetadata').then(save => {
      expect(save.request.body.items[0].uuid).to.equal(undefined);
      // the save answers the item with the uuid the server gave it
      expect(save.response?.body.items[0].uuid).to.be.a('string');
    });

    cy.getUnitMetadataAPI(wsId, unitId, token).then(saved => {
      itemUuid = saved.body.items[0].uuid;
      const comment: CommentData = {
        body: 'Zu Item A1', userName: Cypress.expose('username'), userId, unitId: Number(unitId)
      };
      cy.postCommentAPI(wsId, unitId, comment, token).then(posted => {
        cy.patchCommentItemsAPI(wsId, unitId, String(posted.body), [itemUuid], token)
          .its('status').should('equal', 200);
      });
    });

    // the items are drawn anew with what was read back, so the panel is closed again -- and the unit
    // counts as saved
    cy.contains('studio-lite-item mat-expansion-panel-header', 'A1')
      .should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-cy="workspace-unit-save-button"]').should('be.disabled');
    cy.contains('studio-lite-item mat-expansion-panel-header', 'A1').click();
    cy.contains('studio-lite-item mat-form-field', 'Item ID').find('input').clear().type('A2');
    cy.get('[data-cy="workspace-unit-save-button"]').click();
    cy.wait('@saveMetadata').then(save => {
      expect(save.request.body.items[0].uuid).to.equal(itemUuid);
    });

    cy.getUnitMetadataAPI(wsId, unitId, token).then(saved => {
      expect(saved.body.items).to.have.length(1);
      expect(saved.body.items[0]).to.include({ id: 'A2', uuid: itemUuid });
    });
    cy.getCommentsAPI(wsId, unitId, token).then(comments => {
      expect(comments.body[0].itemUuids).to.deep.equal([itemUuid]);
    });
  });
});
