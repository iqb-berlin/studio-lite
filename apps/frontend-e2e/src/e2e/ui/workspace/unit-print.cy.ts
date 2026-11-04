import {
  CommentData,
  primaryWorkspace,
  printUnits,
  unitCrudUnits
} from '../../../support/testData';
import {
  clickIndexTabWorkspace,
  goToWsMenu,
  selectListUnits,
  selectUnit
} from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI, TestBase } from '../../../support/helpers/test-base';

describe('Unit Print Preview', () => {
  let base: TestBase;

  before(() => {
    createTestBaseAPI({ zip: 'test_studio_units_download.zip', units: [unitCrudUnits.crudPrint] })
      .then(created => {
        base = created;
      });
  });

  after(() => {
    deleteTestBaseAPI();
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

  // The orientation is one `@page` rule for the whole print; landscape comes after the portrait rule of
  // styles.scss, so the last one decides (#1765).
  describe('orientation of the sheet', () => {
    const pageRules = (doc: Document): string[] => Array.from(doc.styleSheets)
      .flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules);
        } catch {
          return []; // a stylesheet of another origin does not show its rules
        }
      })
      .map(rule => rule.cssText)
      .filter(text => text.startsWith('@page'));

    const openPrintView = (landscape: boolean): void => {
      cy.visitWs(primaryWorkspace);
      goToWsMenu();
      cy.get('[data-cy="workspace-edit-unit-preview-units"]').click();
      selectListUnits([printUnits[0]]);
      cy.window().then(win => {
        cy.stub(win, 'open')
          .callsFake((url: string) => {
            win.location.hash = url.replace(/^#/, '');
          })
          .as('windowOpen');
      });
      cy.translate(Cypress.expose('locale')).then(json => {
        if (landscape) {
          cy.get('studio-lite-print-options')
            .contains('mat-checkbox', json.print.printLandscape)
            .find('input')
            .check({ force: true });
        }
        cy.get('button[type="submit"]').contains(json.construct).click();
      });
      cy.get('@windowOpen').should('be.called');
      cy.url().should('include', '/print');
      cy.get('studio-lite-unit-properties').should('have.length', 1);
    };

    it('keeps the sheet in portrait by default', () => {
      openPrintView(false);
      cy.document().then(doc => {
        const rules = pageRules(doc);
        // Chrome writes `A4 portrait` back as `a4`: portrait is what a size without orientation means
        expect(rules[rules.length - 1].toLowerCase()).to.contain('a4');
        expect(rules.join(' ')).not.to.contain('landscape');
      });
    });

    it('turns the sheet to landscape when chosen in the print options', () => {
      openPrintView(true);
      cy.document().then(doc => {
        const rules = pageRules(doc);
        expect(rules[rules.length - 1]).to.contain('landscape');
      });
    });
  });

  it('verifies print options dialog opens from preview bar', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(printUnits[0]);
    clickIndexTabWorkspace('preview');
    cy.get('.wait-animation', { timeout: 30000 }).should('not.exist');
    cy.get('[data-cy="preview-bar-print"]', { timeout: 30000 }).should('be.visible').click();
    cy.get('mat-mdc-dialog-container, mat-dialog-container', {
      timeout: 15000
    }).should('be.visible');

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('mat-dialog-actions, .mat-mdc-dialog-actions')
        .contains('button', json.cancel || json.close)
        .click({ force: true });
    });
    cy.get('mat-mdc-dialog-container, mat-dialog-container').should('not.exist');
  });

  it('displays print preview for units with coding and comments', () => {
    cy.intercept('GET', '**/workspaces/*/units/*/scheme', {
      body: {
        scheme: JSON.stringify({
          variableCodings: [
            {
              id: 'var1',
              alias: 'Variable_1',
              sourceType: 'BASE',
              codes: [
                {
                  id: 111,
                  type: 'FULL_CREDIT',
                  score: 1,
                  ruleSetOperatorAnd: true,
                  ruleSets: [
                    {
                      ruleOperatorAnd: false,
                      rules: [
                        {
                          method: 'MATCH',
                          parameters: ['adios']
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        })
      }
    }).as('getUnitScheme');

    // A reply written after a later comment was printed under that later comment (#2109).
    const unitId = base.unitIds[0];
    const comment = (body: string, parentId?: number): CommentData => ({
      body: `<p>${body}</p>`,
      userName: Cypress.expose('username'),
      userId: Number(base.userId),
      unitId: Number(unitId),
      parentId
    });
    cy.postCommentAPI(base.wsId, unitId, comment('Kommentar A'), base.token).then(commentA => {
      expect(commentA.status).to.equal(201);
      cy.postCommentAPI(base.wsId, unitId, comment('Kommentar B'), base.token)
        .its('status').should('equal', 201);
      cy.postCommentAPI(base.wsId, unitId, comment('Antwort auf A', Number(commentA.body)), base.token)
        .its('status').should('equal', 201);
    });
    cy.intercept('GET', '**/workspaces/*/units/*/comments*').as('getComments');

    cy.visitWs(primaryWorkspace);
    goToWsMenu();
    cy.get('[data-cy="workspace-edit-unit-preview-units"]').click();
    cy.get('[data-cy="workspace-select-unit-list-filter-units"]')
      .type(unitCrudUnits.crudPrint.shortname);
    selectListUnits([unitCrudUnits.crudPrint.shortname]);

    cy.window().then(win => {
      cy.stub(win, 'open')
        .callsFake((url: string) => {
          win.location.hash = url.replace(/^#/, '');
        })
        .as('windowOpen');
    });

    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get('button[type="submit"]')
        .contains(json.construct)
        .should('not.be.disabled')
        .click();
    });

    cy.get('@windowOpen').should('be.called');
    cy.url().should('include', '/print');

    cy.wait('@getUnitScheme');

    cy.get('studio-lite-unit-print-coding').should('exist');
    cy.get('studio-lite-unit-print-coding')
      .contains('Variable_1')
      .should('exist');

    cy.get('studio-lite-unit-print-code').should('exist');
    cy.get('studio-lite-unit-print-code').contains('111').should('exist');

    cy.get('studio-lite-unit-print-comments .comment')
      .should('have.length', 3)
      .then(printed => {
        expect(printed.eq(0).text()).to.contain('Kommentar A');
        expect(printed.eq(1).find('.reply').text()).to.contain('Antwort auf A');
        expect(printed.eq(2).text()).to.contain('Kommentar B');
      });
    cy.wait('@getComments').its('response.body.0.userName').should('not.be.empty').then(author => {
      cy.get('studio-lite-unit-print-comments .comment-user').first().should('contain.text', author);
    });
  });
});
