import { AccessLevel } from '../../../support/testData';
import { addFirstUser } from '../../../support/helpers';

describe('Coding instructions saved through the Schemer', () => {
  const group = { id: '', name: 'RichTextGroup' };
  const workspace = { id: '', name: 'RichTextWorkspace' };
  const unit = { shortname: 'RICH_TEXT', name: 'Rich text instruction', group: '' };
  const variableId = 'response_1';
  const instruction = 'Formatierte Kodieranweisung';
  const schemerKey = 'iqb-schemer@2.9';
  let token = '';
  let workspaceId = '';
  let unitId = '';
  let savedScheme = '';

  const openInstruction = () => cy.get('var-coding .instructions').closest('mat-card').find('button')
    .filter((_, button) => button.querySelector('mat-icon')?.textContent?.trim() === 'edit')
    .click();

  before(() => {
    addFirstUser();
    cy.window().then(win => {
      token = win.localStorage.getItem('id_token') || '';
      cy.addModuleAPI('iqb-schemer-2.9.0.html', token).its('status').should('equal', 201);
      cy.getUserIdAPI(token).then(authData => {
        cy.createGroupAPI(group, token).then(createdGroup => {
          const groupId = String(createdGroup.body);
          cy.createWsAPI(groupId, workspace, token).then(createdWorkspace => {
            workspaceId = String(createdWorkspace.body);
            cy.updateUsersOfWsAPI(workspaceId, AccessLevel.Admin, String(authData.body.userId), token)
              .its('status').should('equal', 200);
            cy.request({
              method: 'POST',
              url: `/api/workspaces/${workspaceId}/units`,
              headers: { 'app-version': Cypress.expose('version'), authorization: `bearer ${token}` },
              body: {
                key: unit.shortname,
                name: unit.name,
                groupName: unit.group,
                schemer: schemerKey,
                variables: [{
                  id: variableId,
                  alias: variableId,
                  type: 'string',
                  format: '',
                  multiple: false,
                  nullable: false,
                  values: [],
                  valuePositionLabels: []
                }]
              }
            }).then(createdUnit => {
              expect(createdUnit.status).to.equal(201);
              unitId = String(createdUnit.body);
            });
          });
        });
      });
    });
  });

  it('preserves formatting in the API and reopened editor, and discards cancelled changes', () => {
    const schemeUrl = `/api/workspaces/${workspaceId}/units/${unitId}/scheme`;
    cy.intercept('GET', schemeUrl).as('loadScheme');
    cy.intercept('PATCH', schemeUrl).as('saveScheme');
    cy.visit(`/#/a/${workspaceId}/${unitId}/schemer`);
    cy.wait('@loadScheme', { requestTimeout: 30000 });

    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('.var-list-entry', variableId, { timeout: 30000 }).click();
      openInstruction();
      cy.get('.ProseMirror').type(`{selectall}${instruction}{selectall}`);
      cy.get('aspect-rich-text-editor button')
        .filter((_, button) => button.querySelector('mat-icon')?.textContent?.trim() === 'format_bold')
        .click();
      cy.get('.ProseMirror strong').should('have.text', instruction);
      cy.contains('button', 'Speichern').click();
      cy.get('mat-dialog-container').should('not.exist');
    });

    cy.get('[data-cy="workspace-unit-save-button"]').should('be.enabled').click();
    cy.wait('@saveScheme').then(({ request, response }) => {
      expect(response?.statusCode).to.equal(200);
      savedScheme = request.body.scheme;
      const scheme: { variableCodings: { id: string; manualInstruction: string }[] } = JSON.parse(savedScheme);
      const coding = scheme.variableCodings.find(variable => variable.id === variableId);
      expect(coding?.manualInstruction).to.contain(`<strong>${instruction}</strong>`);
    });
    cy.get('[data-cy="workspace-unit-save-button"]').should('be.disabled');
    cy.getUnitSchemeAPI(unitId, workspaceId, token).then(response => {
      expect(response.body.scheme).to.equal(savedScheme);
    });

    cy.reload();
    cy.wait('@loadScheme', { requestTimeout: 30000 });
    cy.getIFrameBody('iframe.unitHost').within(() => {
      cy.contains('.var-list-entry', variableId, { timeout: 30000 }).click();
      openInstruction();
      cy.get('.ProseMirror strong').should('have.text', instruction);
      cy.get('.ProseMirror').type('{selectall}Verworfene Aenderung');
      cy.contains('button', 'Abbrechen').click();
      cy.get('mat-dialog-container').should('not.exist');
      openInstruction();
      cy.get('.ProseMirror strong').should('have.text', instruction);
      cy.contains('button', 'Abbrechen').click();
    });
    cy.get('[data-cy="workspace-unit-save-button"]').should('be.disabled');
    cy.getUnitSchemeAPI(unitId, workspaceId, token).then(response => {
      expect(response.body.scheme).to.equal(savedScheme);
    });
  });

  // The reset before the next spec does not take the modules.
  it('removes its module', () => {
    cy.deleteModulesAPI([schemerKey], token).its('status').should('equal', 200);
  });
});
