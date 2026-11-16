import { primaryWorkspace, UnitData } from '../../../support/testData';
import { goToWsMenu } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

// A dialog whose height followed its unit list was centred anew while the list was filtered, and the
// search field moved away while typing (#2143)
describe('Unit dialogs keep their place while the unit list is filtered', () => {
  const units: UnitData[] = Array.from({ length: 10 }, (_, index) => ({
    shortname: `HEIGHT_${String(index + 1).padStart(2, '0')}`,
    name: `Aufgabe ${index + 1}`,
    group: 'Gruppe H'
  }));
  const dialogs = [
    {
      name: 'print preview',
      open: () => cy.get('[data-cy="workspace-edit-unit-preview-units"]').click()
    },
    {
      name: 'show metadata',
      open: () => {
        cy.get('[data-cy="workspace-edit-unit-reports"]').click();
        cy.get('[data-cy="workspace-edit-unit-show-metadata"]').click();
      }
    }
  ];

  before(() => {
    createTestBaseAPI({ units });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  dialogs.forEach(dialog => {
    it(`keeps the ${dialog.name} dialog in place`, () => {
      cy.visitWs(primaryWorkspace);
      goToWsMenu();
      dialog.open();
      cy.get('mat-dialog-container mat-row').should('have.length', units.length);
      // Read during the opening animation, the position would still be scaled
      cy.get('mat-dialog-container')
        .should('have.class', 'mdc-dialog--open')
        .and('not.have.class', 'mdc-dialog--opening')
        .then($dialog => {
          const top = $dialog[0].getBoundingClientRect().top;
          cy.get('mat-dialog-container [data-cy="workspace-select-unit-list-filter-units"]')
            .click()
            .type('HEIGHT_07');
          cy.get('mat-dialog-container mat-row').should('have.length', 1);
          cy.get('mat-dialog-container').should($filtered => {
            expect($filtered[0].getBoundingClientRect().top).to.be.closeTo(top, 1);
          });
        });
    });
  });
});
