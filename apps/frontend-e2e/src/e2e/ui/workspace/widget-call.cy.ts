import { primaryWorkspace, UnitData } from '../../../support/testData';
import { clickIndexTabWorkspace, selectUnit } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

/**
 * A player in the preview calls a widget, the studio starts it in an overlay and hands what the widget
 * returns back to the player (#1763). Player and widget are test modules written against the player
 * and the widget API, so what is tested is the studio as host, not a release of a real module. The
 * form of the messages is checked in the unit tests of WidgetOverlayComponent and PreviewDirective;
 * here only that they arrive.
 */
describe('Widget call in the preview', () => {
  const unit: UnitData = {
    shortname: 'WIDGET_CALL', name: 'Widget call', group: '', player: 'verona-test-player@1.0'
  };
  const playerFrame = '[data-cy="unit-preview-iframe"]';

  before(() => {
    createTestBaseAPI({ units: [unit] }).then(base => {
      cy.addModuleAPI('verona-test-player-1.0.0.html', base.token).its('status').should('equal', 201);
      cy.addModuleAPI('verona-test-widget-1.0.0.html', base.token, ['WIDGET']).its('status').should('equal', 201);
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('starts the widget with the state of the player and returns the state of the widget to it', () => {
    cy.visitWs(primaryWorkspace);
    selectUnit(unit.shortname);
    clickIndexTabWorkspace('preview');
    cy.getIFrameBody(playerFrame).within(() => {
      cy.get('#status', { timeout: 30000 }).should('have.text', 'started');
      cy.get('#call-widget').click();
    });

    cy.getIFrameBody('.widget-iframe').within(() => {
      cy.get('#start-state').should('have.text', 'state-of-the-player');
      cy.get('#return').click();
    });

    cy.get('.widget-iframe').should('not.exist');
    cy.getIFrameBody(playerFrame).within(() => {
      cy.get('#return-call-id').should('have.text', 'test-call-1');
      cy.get('#return-state').should('have.text', 'state-of-the-widget');
    });
  });
});
