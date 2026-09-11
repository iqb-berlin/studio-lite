import {
  primaryWorkspace,
  printUnits
} from '../../../support/testData';
import {
  goToWsMenu,
  selectListUnits
} from '../../../support/helpers';

describe('Unit Print Preview – Properties & Last Changes', () => {
  after(() => {
    cy.visitWs(primaryWorkspace);
  });

  it('displays unit key, name and properties in studio-lite-unit-properties', () => {
    cy.visitWs(primaryWorkspace);
    printUnits.forEach(shortname => {
      cy.contains('mat-row', shortname).should('exist');
    });

    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-preview-units"]').click();
    selectListUnits([...printUnits]);

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

    // Verify studio-lite-unit-properties headers
    cy.get('studio-lite-unit-properties').should('have.length', printUnits.length);
    printUnits.forEach((shortname, index) => {
      cy.get('studio-lite-unit-properties').eq(index).within(() => {
        cy.get('.unit-key').should('contain.text', shortname);
      });
    });
    cy.get('studio-lite-unit-properties').eq(0).find('.unit-name').should('contain.text', '1100');
    cy.get('studio-lite-unit-properties').eq(1).find('.unit-name').should('contain.text', '1200');

    // Verify studio-lite-unit-properties table metadata with real Verona module names
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('studio-lite-unit-properties table.metadata').first().within(() => {
        cy.contains('tr', json.print.editor)
          .should('contain.text', 'iqb-editor-aspect');
        cy.contains('tr', json.print.schemer)
          .should('contain.text', 'iqb-schemer');
        cy.contains('tr', json.print.player)
          .should('contain.text', 'iqb-player-aspect');
      });
    });
  });

  it('displays all last-changed timestamps and users in studio-lite-unit-last-changes', () => {
    cy.get('studio-lite-unit-last-changes').should('have.length', printUnits.length);

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('studio-lite-unit-last-changes table.last-changes').first().within(() => {
        cy.contains('tr', json.print['last-changed-definition']).within(() => {
          cy.contains(/\d{2}\.\d{2}\.\d{4}/).should('exist');
        });

        cy.contains('tr', json.print['last-changed-metadata']).within(() => {
          cy.contains(/\d{2}\.\d{2}\.\d{4}/).should('exist');
        });

        cy.contains('tr', json.print['last-changed-scheme']).within(() => {
          cy.contains(/\d{2}\.\d{2}\.\d{4}/).should('exist');
        });
      });
    });
  });

  it('hides unit-last-changes and metadata details when printProperties is unchecked', () => {
    cy.visitWs(primaryWorkspace);
    printUnits.forEach(shortname => {
      cy.contains('mat-row', shortname).should('exist');
    });

    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-preview-units"]').click();
    selectListUnits([...printUnits]);

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
    cy.get('studio-lite-unit-properties').should('have.length', printUnits.length);
    printUnits.forEach((shortname, index) => {
      cy.get('studio-lite-unit-properties').eq(index).within(() => {
        cy.get('.unit-key').should('contain.text', shortname);
        cy.get('table.metadata tr').should('not.exist');
      });
    });
  });
});
