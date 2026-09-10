import {
  primaryWorkspace,
  printTestNames,
  printUnits
} from '../../../support/testData';
import {
  goToWsMenu,
  selectListUnits
} from '../../../support/helpers';

describe('Unit Print Preview – Properties & Last Changes', () => {
  const targetUnits = printUnits;
  let interceptPrintProperties = false;
  let interceptWsgStates = false;

  before(() => {
    // Scoped intercepts that only modify data during print preview tests
    cy.intercept('GET', '**/workspaces/*/units/*/properties', req => {
      delete req.headers['if-none-match'];
      if (interceptPrintProperties) {
        req.continue(res => {
          if (res.body) {
            res.body.groupName = printTestNames.groupName;
            res.body.description = printTestNames.description;
            res.body.transcript = printTestNames.transcript;
            res.body.state = '1';
            res.body.editor = 'iqb-editor-aspect-3.0.1';
            res.body.schemer = 'iqb-schemer-aspect-1.0.0';
            res.body.player = 'iqb-player-aspect-3.0.1';
            res.body.lastChangedDefinition = '2025-05-10T09:15:00.000Z';
            res.body.lastChangedDefinitionUser = 'EditorUser';
            res.body.lastChangedMetadata = '2025-05-11T11:20:00.000Z';
            res.body.lastChangedMetadataUser = 'MetaUser';
            res.body.lastChangedScheme = '2025-05-12T13:45:00.000Z';
            res.body.lastChangedSchemeUser = 'SchemeUser';
          }
        });
      }
    }).as('getUnitProperties');

    cy.intercept('GET', '**/verona-modules*', req => {
      delete req.headers['if-none-match'];
      req.continue(res => {
        if (res.body && Array.isArray(res.body)) {
          const hasAspectPlayer = res.body.some(
            (m: { key?: string }) => m.key?.includes('player-aspect')
          );
          if (!hasAspectPlayer) {
            res.body.push({
              key: 'iqb-player-aspect-3.0.1',
              sortKey: 'iqb-player-aspect-3.0.1',
              metadata: {
                id: 'iqb-player-aspect',
                name: 'iqb-player-aspect',
                type: 'PLAYER',
                version: '3.0.1'
              }
            });
          }
        }
      });
    });

    cy.intercept('GET', '**/workspace-groups/*', req => {
      delete req.headers['if-none-match'];
      if (interceptWsgStates) {
        req.continue(res => {
          if (res.body && res.body.settings) {
            res.body.settings.states = [
              { id: 1, label: 'In Bearbeitung', color: '#ffcc00' }
            ];
          }
        });
      }
    }).as('getWsgStates');
  });

  after(() => {
    interceptPrintProperties = false;
    interceptWsgStates = false;
    cy.visitWs(primaryWorkspace);
  });

  it('displays unit key, name and properties in studio-lite-unit-properties', () => {
    cy.visitWs(primaryWorkspace);
    targetUnits.forEach(shortname => {
      cy.contains('mat-row', shortname).should('exist');
    });

    interceptPrintProperties = true;
    interceptWsgStates = true;

    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-preview-units"]').click();
    selectListUnits([...targetUnits]);

    // Stub window.open so the print view opens within the Cypress runner
    cy.window().then(win => {
      cy.stub(win, 'open')
        .callsFake((url: string) => {
          win.location.hash = url.replace(/^#/, '');
        })
        .as('windowOpen');
    });

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('button[type="submit"]').contains(json.construct).click();
    });

    cy.get('@windowOpen').should('be.called');
    cy.url().should('include', '/print');

    cy.wait('@getUnitProperties');

    // Verify studio-lite-unit-properties headers
    cy.get('studio-lite-unit-properties').should('have.length', targetUnits.length);
    targetUnits.forEach((shortname, index) => {
      cy.get('studio-lite-unit-properties').eq(index).within(() => {
        cy.get('.unit-key').should('contain.text', shortname);
      });
    });

    // Verify studio-lite-unit-properties table metadata
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('studio-lite-unit-properties table.metadata').first().within(() => {
        cy.contains('tr', json.print['group-name'])
          .should('contain.text', printTestNames.groupName);
        cy.contains('tr', json.print.description)
          .should('contain.text', printTestNames.description);
        cy.contains('tr', json.print.transcript)
          .should('contain.text', printTestNames.transcript);
        cy.contains('tr', json.print.stateLabel)
          .should('contain.text', 'In Bearbeitung');
        cy.contains('tr', json.print.editor)
          .should('contain.text', 'iqb-editor-aspect-3.0.1');
        cy.contains('tr', json.print.schemer)
          .should('contain.text', 'iqb-schemer-aspect-1.0.0');
        cy.contains('tr', json.print.player)
          .should('contain.text', 'iqb-player-aspect');
      });
    });
  });

  it('displays all last-changed timestamps and users in studio-lite-unit-last-changes', () => {
    cy.get('studio-lite-unit-last-changes').should('have.length.at.least', 1);

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('studio-lite-unit-last-changes table.last-changes').first().within(() => {
        cy.contains('tr', json.print['last-changed-definition']).within(() => {
          cy.root().should('contain.text', 'EditorUser');
          cy.contains(/\d{2}\.\d{2}\.2025/).should('exist');
        });

        cy.contains('tr', json.print['last-changed-metadata']).within(() => {
          cy.root().should('contain.text', 'MetaUser');
          cy.contains(/\d{2}\.\d{2}\.2025/).should('exist');
        });

        cy.contains('tr', json.print['last-changed-scheme']).within(() => {
          cy.root().should('contain.text', 'SchemeUser');
          cy.contains(/\d{2}\.\d{2}\.2025/).should('exist');
        });
      });
    });

    interceptPrintProperties = false;
    interceptWsgStates = false;
  });

  it('hides unit-last-changes and metadata details when printProperties is unchecked', () => {
    cy.visitWs(primaryWorkspace);
    targetUnits.forEach(shortname => {
      cy.contains('mat-row', shortname).should('exist');
    });

    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-preview-units"]').click();
    selectListUnits([...targetUnits]);

    cy.window().then(win => {
      cy.stub(win, 'open')
        .callsFake((url: string) => {
          win.location.hash = url.replace(/^#/, '');
        })
        .as('windowOpen');
    });

    // Uncheck "Eigenschaften drucken" (printProperties)
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('studio-lite-print-options')
        .contains('mat-checkbox', json.print.printProperties)
        .find('input')
        .uncheck({ force: true });

      cy.get('button[type="submit"]').contains(json.construct).click();
    });

    cy.get('@windowOpen').should('be.called');
    cy.url().should('include', '/print');

    // studio-lite-unit-last-changes should NOT exist
    cy.get('studio-lite-unit-last-changes').should('not.exist');

    // In studio-lite-unit-properties, headings exist but detailed table rows are not populated
    cy.get('studio-lite-unit-properties').should('have.length', targetUnits.length);
    targetUnits.forEach((shortname, index) => {
      cy.get('studio-lite-unit-properties').eq(index).within(() => {
        cy.get('.unit-key').should('contain.text', shortname);
        cy.get('table.metadata tr').should('not.exist');
      });
    });
  });
});
