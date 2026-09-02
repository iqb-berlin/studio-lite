import { baseGroup, primaryWorkspace, propertiesUnits, propertiesTestNames } from '../../../support/testData';
import {
  addUnitPred,
  clickIndexTabWsgAdmin,
  clickUnitPropertiesSaveButton,
  editUnitPropertiesAndVerify,
  openUnitProperties,
  selectUnit
} from '../../../support/helpers';
import { addState } from '../../../support/helpers/group-admin';

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('Unit Properties Panel', () => {
  // -------------------------------------------------------------------------
  // Setup
  // -------------------------------------------------------------------------

  it('creates test units', () => {
    cy.visitWs(primaryWorkspace);
    addUnitPred(propertiesUnits.propUnit1);
    cy.visitWs(primaryWorkspace);
    addUnitPred(propertiesUnits.propUnit2);
  });

  it('adds a custom state to the group for state-field tests', () => {
    cy.findAdminGroupSettings(baseGroup).click();
    clickIndexTabWsgAdmin('settings');
    addState(propertiesTestNames.stateName);
  });

  // -------------------------------------------------------------------------
  // 1. Display – properties tab renders all expected fields
  // -------------------------------------------------------------------------

  describe('Properties panel rendering', () => {
    before(() => {
      cy.visitWs(primaryWorkspace);
      openUnitProperties(propertiesUnits.propUnit1.shortname);
    });

    it('shows key, name, state, group and description fields', () => {
      cy.get('input[formControlName="key"]').should('be.visible');
      cy.get('input[formControlName="name"]').should('be.visible');
      cy.get('mat-select[formControlName="state"]').should('be.visible');
      cy.get('mat-select[formControlName="group"]').should('be.visible');
      cy.get('textarea[formControlName="description"]').should('be.visible');
    });

    it('key field is pre-filled with the unit short name', () => {
      cy.get('input[formControlName="key"]').should('have.value', propertiesUnits.propUnit1.shortname);
    });

    it('name field is pre-filled with the unit name', () => {
      cy.get('input[formControlName="name"]').should('have.value', propertiesUnits.propUnit1.name);
    });

    it('save button is disabled when no changes have been made', () => {
      cy.get('[data-cy="workspace-unit-save-button"]').should('be.disabled');
    });
  });

  // -------------------------------------------------------------------------
  // 2. Unit name – edit, save, persist
  // -------------------------------------------------------------------------

  describe('Unit name – edit and persist', () => {
    const updatedName = 'Updated Unit Name';

    it('saves the updated name and it persists after reload', () => {
      editUnitPropertiesAndVerify(
        primaryWorkspace,
        propertiesUnits.propUnit1.shortname,
        () => cy.get('input[formControlName="name"]').clear().type(updatedName),
        () => cy.get('input[formControlName="name"]').should('have.value', updatedName)
      );
    });

    it('save button is disabled again immediately after saving', () => {
      cy.get('[data-cy="workspace-unit-save-button"]').should('be.disabled');
    });

    it('restores original name', () => {
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
      cy.get('input[formControlName="name"]').clear().type(propertiesUnits.propUnit1.name);
      clickUnitPropertiesSaveButton();
    });
  });

  // -------------------------------------------------------------------------
  // 3. Unit key (short name) – edit, save, persist
  // -------------------------------------------------------------------------

  describe('Unit key – edit and persist', () => {
    const updatedKey = 'PROP_U1_NEW';

    it('saves updated key and it persists after reload', () => {
      editUnitPropertiesAndVerify(
        primaryWorkspace,
        propertiesUnits.propUnit1.shortname,
        () => cy.get('input[formControlName="key"]').clear().type(updatedKey),
        () => cy.get('input[formControlName="key"]').should('have.value', updatedKey)
      );
    });

    it('restores original key', () => {
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
      cy.get('input[formControlName="key"]').clear().type(propertiesUnits.propUnit1.shortname);
      clickUnitPropertiesSaveButton();
    });
  });

  // -------------------------------------------------------------------------
  // 4. Unit description – edit, save, persist
  // -------------------------------------------------------------------------

  describe('Unit description – edit and persist', () => {
    const description = 'This is a test description for the unit.';

    it('saves description and it persists after reload', () => {
      editUnitPropertiesAndVerify(
        primaryWorkspace,
        propertiesUnits.propUnit1.shortname,
        () => cy.get('textarea[formControlName="description"]').clear().type(description),
        () => cy.get('textarea[formControlName="description"]').should('have.value', description)
      );
    });

    it('clearing description persists empty value after reload', () => {
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
      cy.get('textarea[formControlName="description"]').clear();
      clickUnitPropertiesSaveButton();

      cy.visitWs(primaryWorkspace);
      openUnitProperties(propertiesUnits.propUnit1.shortname);
      cy.get('textarea[formControlName="description"]').should('have.value', '');
    });
  });

  // -------------------------------------------------------------------------
  // 5. Unit state – select and persist
  // -------------------------------------------------------------------------

  describe('Unit state – select and persist', () => {
    it('saves state selection and it persists after reload', () => {
      editUnitPropertiesAndVerify(
        primaryWorkspace,
        propertiesUnits.propUnit1.shortname,
        () => {
          cy.get('mat-select[formControlName="state"]').click();
          cy.get(`mat-option:contains("${propertiesTestNames.stateName}")`).click();
        },
        () => cy.get('mat-select[formControlName="state"]')
          .should('contain.text', propertiesTestNames.stateName)
      );
    });

    it('clearing state (back to empty) persists after reload', () => {
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
      cy.get('mat-select[formControlName="state"]').click();
      cy.get('mat-option').first().click();
      clickUnitPropertiesSaveButton();

      cy.visitWs(primaryWorkspace);
      openUnitProperties(propertiesUnits.propUnit1.shortname);
      cy.get('mat-select[formControlName="state"]')
        .should('not.contain.text', propertiesTestNames.stateName);
    });
  });

  // -------------------------------------------------------------------------
  // 6. Unit group – create via + button and persist
  // -------------------------------------------------------------------------

  describe('Unit group – create and persist', () => {
    it('creates a new group via the + button and it persists after reload', () => {
      cy.visitWs(primaryWorkspace);
      openUnitProperties(propertiesUnits.propUnit1.shortname);
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');

      cy.get('studio-lite-new-group-button button[mat-icon-button]').click();

      cy.get('mat-dialog-content input[formControlName="text"]')
        .type(propertiesTestNames.groupName);
      cy.get('mat-dialog-actions button[type="submit"]').click();

      cy.get('mat-select[formControlName="group"]')
        .should('contain.text', propertiesTestNames.groupName);
      cy.get('[data-cy="workspace-unit-save-button"]').should('not.be.disabled');
      clickUnitPropertiesSaveButton();

      cy.visitWs(primaryWorkspace);
      openUnitProperties(propertiesUnits.propUnit1.shortname);
      cy.get('mat-select[formControlName="group"]')
        .should('contain.text', propertiesTestNames.groupName);
    });

    it('can assign another unit to the existing group via dropdown', () => {
      cy.visitWs(primaryWorkspace);
      openUnitProperties(propertiesUnits.propUnit2.shortname);
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');

      cy.get('mat-select[formControlName="group"]').click();
      cy.get(`mat-option:contains("${propertiesTestNames.groupName}")`).click();
      clickUnitPropertiesSaveButton();

      cy.visitWs(primaryWorkspace);
      openUnitProperties(propertiesUnits.propUnit2.shortname);
      cy.get('mat-select[formControlName="group"]')
        .should('contain.text', propertiesTestNames.groupName);
    });
  });

  // -------------------------------------------------------------------------
  // 7. Save-or-discard dialog – Save path
  // -------------------------------------------------------------------------

  describe('Save-or-discard dialog – Save path', () => {
    const tempName = 'Temp Edited Name';

    it('saves via dialog Save button and persists', () => {
      cy.visitWs(primaryWorkspace);
      openUnitProperties(propertiesUnits.propUnit1.shortname);

      cy.get('input[formControlName="name"]').clear().type(tempName);

      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('dialogSave');
      selectUnit(propertiesUnits.propUnit2.shortname);

      cy.get('studio-lite-save-or-discard, mat-dialog-container').should('be.visible');

      cy.translate(Cypress.expose('locale')).then(json => {
        cy.get('studio-lite-save-or-discard button, mat-dialog-actions button')
          .contains(json.workspace?.save || json.save)
          .click();
      });
      cy.wait('@dialogSave').its('response.statusCode').should('eq', 200);

      cy.visitWs(primaryWorkspace);
      openUnitProperties(propertiesUnits.propUnit1.shortname);
      cy.get('input[formControlName="name"]').should('have.value', tempName);
    });

    it('restores original name', () => {
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
      cy.get('input[formControlName="name"]').clear().type(propertiesUnits.propUnit1.name);
      clickUnitPropertiesSaveButton();
    });
  });

  // -------------------------------------------------------------------------
  // 8. Invalid key – validation
  // -------------------------------------------------------------------------

  describe('Unit key – validation', () => {
    it('shows validation error for forbidden key and clears error once key is valid', () => {
      const validKey = 'PROP_U1_VALID';
      cy.visitWs(primaryWorkspace);
      openUnitProperties(propertiesUnits.propUnit1.shortname);

      cy.get('input[formControlName="key"]').clear().type('invalid key!').blur();
      cy.get('mat-error').should('be.visible');
      cy.get('input[formControlName="key"]').should('have.class', 'ng-invalid');

      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
      cy.get('input[formControlName="key"]').clear().type(validKey);
      cy.get('mat-error').should('not.exist');
      cy.get('input[formControlName="key"]').should('have.class', 'ng-valid');
      clickUnitPropertiesSaveButton();

      cy.visitWs(primaryWorkspace);
      openUnitProperties(validKey);
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
      cy.get('input[formControlName="key"]').clear().type(propertiesUnits.propUnit1.shortname);
      clickUnitPropertiesSaveButton();
    });
  });

  // -------------------------------------------------------------------------
  // 9. Multiple fields changed in one save
  // -------------------------------------------------------------------------

  describe('Multiple fields changed simultaneously', () => {
    const multiName = 'Multi Edit Name';
    const multiDesc = 'Multi edit description text';

    it('saves name and description changed together, both persist after reload', () => {
      editUnitPropertiesAndVerify(
        primaryWorkspace,
        propertiesUnits.propUnit2.shortname,
        () => {
          cy.get('input[formControlName="name"]').clear().type(multiName);
          cy.get('textarea[formControlName="description"]').clear().type(multiDesc);
        },
        () => {
          cy.get('input[formControlName="name"]').should('have.value', multiName);
          cy.get('textarea[formControlName="description"]').should('have.value', multiDesc);
        }
      );
    });
  });
});
