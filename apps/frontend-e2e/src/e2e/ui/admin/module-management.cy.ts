import {
  addFirstUser,
  addModules,
  deleteFirstUser,
  deleteAllModules,
  clickIndexTabAdmin
} from '../../../support/helpers';
import { modules } from '../../../support/testData';

describe('Verona Module Management', () => {
  before(() => {
    addFirstUser();
  });

  after(() => {
    deleteFirstUser();
  });

  it('uploads Verona modules successfully', () => {
    addModules(modules);

    // Verify modules are listed
    cy.visit('/');
    cy.findAdminSettings().click();
    clickIndexTabAdmin('v-modules');

    cy.contains('mat-row', 'Schemer').should('exist');
    cy.contains('mat-row', 'Aspect').should('exist');
  });

  it('displays module metadata after upload', () => {
    cy.visit('/');
    cy.findAdminSettings().click();
    clickIndexTabAdmin('v-modules');

    // Check that module rows contain version information
    cy.get('mat-row').should('have.length.greaterThan', 0);

    // Verify Schemer module
    cy.contains('mat-row', 'Schemer').within(() => {
      cy.contains('2.6.0').should('exist');
    });

    // Verify Aspect modules (editor and player)
    cy.contains('mat-row', 'Aspect').should('exist');
    cy.get('mat-row').filter(':contains("Aspect")').should('have.length', 2);

    // Verify Speedtest modules (editor and player)
    cy.contains('mat-row', 'Speedtest').should('exist');
    cy.get('mat-row').filter(':contains("Speedtest")').should('have.length', 2);

    // Verify Stars player module
    cy.contains('mat-row', 'Stars').within(() => {
      cy.contains('0.6.26').should('exist');
    });
  });

  it('prevents duplicate module uploads', () => {
    cy.visit('/');
    cy.findAdminSettings().click();
    clickIndexTabAdmin('v-modules');

    const filename = modules[0];
    const path = `../frontend-e2e/src/fixtures/${filename}`;

    // Get initial count of modules
    cy.get('mat-row').then($rows => {
      const initialCount = $rows.length;

      // Try to upload the same module again
      cy.get('input[type=file]').selectFile(path, {
        action: 'select',
        force: true
      });

      // Wait a bit for potential upload
      cy.reload();

      // Count should remain the same (duplicate prevented or replaced)
      cy.get('mat-row').should('have.length', initialCount);
    });
  });

  it('allows selecting modules in the admin interface', () => {
    const selectedModule = 'IQB-Schemer';
    cy.visit('/');
    cy.findAdminSettings().click();
    clickIndexTabAdmin('v-modules');

    // Select a module
    cy.selectModule(selectedModule);
    // Verify checkbox is checked by checking the aria-checked attribute
    cy.contains('mat-row', selectedModule)
      .find('mat-checkbox')
      .should('have.class', 'mat-mdc-checkbox-checked');
  });

  it('verifies all module types are available', () => {
    cy.visit('/');
    cy.findAdminSettings().click();
    clickIndexTabAdmin('v-modules');

    // Verify we have 1 schemer
    cy.get('mat-row').filter(':contains("Schemer")').should('have.length', 1);

    // Verify we have 2 editors (Aspect, Speedtest)
    cy.get('mat-row').filter(':contains("Editor")').should('have.length.at.least', 2);

    // Verify we have 3 players (Aspect, Speedtest, Stars)
    cy.get('mat-row').filter(':contains("Player")').should('have.length.at.least', 3);
  });

  it('deletes modules successfully', () => {
    deleteAllModules();

    // Verify modules are removed
    cy.visit('/');
    cy.findAdminSettings().click();
    clickIndexTabAdmin('v-modules');

    cy.contains('mat-row', 'Schemer').should('not.exist');
    cy.contains('mat-row', 'Aspect').should('not.exist');
    cy.contains('mat-row', 'Speedtest').should('not.exist');
    cy.contains('mat-row', 'Stars').should('not.exist');
  });
});
