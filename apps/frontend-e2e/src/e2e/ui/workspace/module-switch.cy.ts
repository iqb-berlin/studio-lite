import { primaryWorkspace } from '../../../support/testData';
import {
  addUnit,
  clickIndexTabWorkspace,
  selectUnit,
  setModuleWithoutVerification
} from '../../../support/helpers';
import { createBasicSpecCy, deleteBasicSpecCy } from '../shared/basic.spec.cy';

/**
 * Units whose players differ are shown in one and the same iframe, which is navigated anew for each
 * of them. The module HTML is held after its first load, so the way back to a unit that was open
 * before is the path #1662 broke on: the frame was emptied first, and Chrome 152 then kept the empty
 * document and dropped the module.
 *
 * This spec walks that path with real players and demands that each switch puts *that* player's own
 * document into the frame. It does not reproduce #1662: the failure did not appear locally, neither
 * headless nor headed in Chrome 152.0.7977.75 with these modules, only against the production
 * system. So it guards the switch, not the browser behaviour that broke it -- the single navigation
 * itself is asserted in verona-module.directive.spec.ts.
 */
describe('Workspace Module Switch', () => {
  const aspectUnit = 'MOD_ASPECT';
  const speedtestUnit = 'MOD_SPEEDTEST';
  // The title of each player's own document: what is in the frame has to be named, not just counted,
  // or the assertion is satisfied by the module that was there before.
  const aspectPlayerTitle = 'Verona Player Aspect';
  const speedtestPlayerTitle = 'Verona Speedtest Player';

  // createBasicSpecCy creates the first user through /api/init-login, which the API only offers while
  // no user exists -- so it needs an empty database. Every spec of this suite leaves one behind by
  // deleting its base afterwards, but a spec whose teardown fails hands the next one a populated
  // database and its login then goes to /api/login and fails. Reset here rather than depend on the
  // spec that ran before.
  before(() => {
    createBasicSpecCy();
  });

  after(() => {
    deleteBasicSpecCy();
  });

  // The player has run when its own document is in the frame: an emptied frame has neither scripts
  // nor body content, which is what the failure looked like. The spinner is the app's half of it --
  // it only goes when the player has reported ready and been sent the unit.
  function expectPlayerLoaded(playerTitle: string): void {
    cy.get('[data-cy="unit-preview-iframe"]', { timeout: 60000 })
      .should('be.visible')
      .its('0.contentDocument')
      .should(doc => {
        expect(doc.title, 'the player document in the frame').to.equal(playerTitle);
        expect(doc.scripts.length, 'scripts in the module document').to.be.greaterThan(0);
        expect(doc.body.children.length, 'elements in the module body').to.be.greaterThan(0);
      });
    cy.get('.wait-animation').should('not.exist');
  }

  // A new unit takes the workspace's default player, so the workspace is set to one player per unit.
  // setModuleWithoutVerification clicks save without waiting for the answer, and the reload that
  // follows would cancel the request -- hence the wait here.
  function addUnitWithPlayer(unitKey: string, player: string): void {
    cy.intercept('PATCH', '**/api/workspaces/*/settings').as('saveSettings');
    setModuleWithoutVerification(primaryWorkspace, 'Aspect', player, 'Schemer');
    cy.wait('@saveSettings').its('response.statusCode').should('be.oneOf', [200, 201, 204]);
    cy.visitWs(primaryWorkspace);
    addUnit(unitKey);
  }

  it('creates two units whose players differ', () => {
    addUnitWithPlayer(aspectUnit, 'Aspect');
    addUnitWithPlayer(speedtestUnit, 'Speedtest');
  });

  it('shows the player of a unit that was open before', () => {
    cy.visitWs(primaryWorkspace);

    selectUnit(aspectUnit);
    clickIndexTabWorkspace('preview');
    expectPlayerLoaded(aspectPlayerTitle);

    selectUnit(speedtestUnit);
    expectPlayerLoaded(speedtestPlayerTitle);

    // The way back, and the whole point: the player's HTML is held by now, so the frame is navigated
    // from held HTML -- which is where the emptied frame stayed empty.
    selectUnit(aspectUnit);
    expectPlayerLoaded(aspectPlayerTitle);
  });
});
