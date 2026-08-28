import { UnitData, group1, ws1 } from '../../../support/testData';
import {
  addUnitPred,
  clickIndexTabWsgAdmin,
  clickUnitPropertiesSaveButton,
  editUnitPropertiesAndVerify,
  openUnitProperties,
  selectUnit
} from '../../../support/helpers';
import { createBasicSpecCy, deleteBasicSpecCy } from '../shared/basic.spec.cy';
import { addState } from '../../../support/helpers/group-admin';

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const unit1: UnitData = { shortname: 'PROP_U1', name: 'Properties Unit 1', group: 'Gruppe A' };
const unit2: UnitData = { shortname: 'PROP_U2', name: 'Properties Unit 2', group: 'Gruppe B' };
const STATE_NAME = 'Fertig';
const GROUP_NAME = 'TestGrp';

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('Unit Properties Panel', () => {
  before(() => {
    createBasicSpecCy();
  });

  after(() => {
    deleteBasicSpecCy();
  });

  // -------------------------------------------------------------------------
  // Setup
  // -------------------------------------------------------------------------

  it('creates test units', () => {
    cy.visitWs(ws1);
    addUnitPred(unit1);
    cy.visitWs(ws1);
    addUnitPred(unit2);
  });

  it('adds a custom state to the group for state-field tests', () => {
    cy.findAdminGroupSettings(group1).click();
    clickIndexTabWsgAdmin('settings');
    addState(STATE_NAME);
  });

  // -------------------------------------------------------------------------
  // 1. Display – properties tab renders all expected fields
  // -------------------------------------------------------------------------

  describe('Properties panel rendering', () => {
    before(() => {
      cy.visitWs(ws1);
      openUnitProperties(unit1.shortname);
    });

    it('shows key, name, state, group and description fields', () => {
      cy.get('input[formControlName="key"]').should('be.visible');
      cy.get('input[formControlName="name"]').should('be.visible');
      cy.get('mat-select[formControlName="state"]').should('be.visible');
      cy.get('mat-select[formControlName="group"]').should('be.visible');
      cy.get('textarea[formControlName="description"]').should('be.visible');
    });

    it('key field is pre-filled with the unit short name', () => {
      cy.get('input[formControlName="key"]').should('have.value', unit1.shortname);
    });

    it('name field is pre-filled with the unit name', () => {
      cy.get('input[formControlName="name"]').should('have.value', unit1.name);
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
        ws1,
        unit1.shortname,
        () => cy.get('input[formControlName="name"]').clear().type(updatedName),
        () => cy.get('input[formControlName="name"]').should('have.value', updatedName)
      );
    });

    it('save button is disabled again immediately after saving', () => {
      // still on the properties page from editUnitPropertiesAndVerify's final openUnitProperties
      cy.get('[data-cy="workspace-unit-save-button"]').should('be.disabled');
    });

    it('restores original name', () => {
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
      cy.get('input[formControlName="name"]').clear().type(unit1.name);
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
        ws1,
        unit1.shortname,
        () => cy.get('input[formControlName="key"]').clear().type(updatedKey),
        () => cy.get('input[formControlName="key"]').should('have.value', updatedKey)
      );
    });

    it('restores original key', () => {
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
      cy.get('input[formControlName="key"]').clear().type(unit1.shortname);
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
        ws1,
        unit1.shortname,
        () => cy.get('textarea[formControlName="description"]').clear().type(description),
        () => cy.get('textarea[formControlName="description"]').should('have.value', description)
      );
    });

    it('clearing description persists empty value after reload', () => {
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
      cy.get('textarea[formControlName="description"]').clear();
      clickUnitPropertiesSaveButton();

      cy.visitWs(ws1);
      openUnitProperties(unit1.shortname);
      cy.get('textarea[formControlName="description"]').should('have.value', '');
    });
  });

  // -------------------------------------------------------------------------
  // 5. Unit state – select and persist
  // -------------------------------------------------------------------------

  describe('Unit state – select and persist', () => {
    it('saves state selection and it persists after reload', () => {
      editUnitPropertiesAndVerify(
        ws1,
        unit1.shortname,
        () => {
          cy.get('mat-select[formControlName="state"]').click();
          cy.get(`mat-option:contains("${STATE_NAME}")`).click();
        },
        () => cy.get('mat-select[formControlName="state"]').should('contain.text', STATE_NAME)
      );
    });

    it('clearing state (back to empty) persists after reload', () => {
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
      cy.get('mat-select[formControlName="state"]').click();
      cy.get('mat-option').first().click(); // the empty option
      clickUnitPropertiesSaveButton();

      cy.visitWs(ws1);
      openUnitProperties(unit1.shortname);
      cy.get('mat-select[formControlName="state"]').should('not.contain.text', STATE_NAME);
    });
  });

  // -------------------------------------------------------------------------
  // 6. Unit group – create via + button and persist
  // -------------------------------------------------------------------------

  describe('Unit group – create and persist', () => {
    it('creates a new group via the + button and it persists after reload', () => {
      cy.visitWs(ws1);
      openUnitProperties(unit1.shortname);
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');

      // Click the add_circle button inside studio-lite-new-group-button
      cy.get('studio-lite-new-group-button button[mat-icon-button]').click();

      // The dialog is InputTextComponent — type the group name and click the primary button
      cy.get('mat-dialog-content input[formControlName="text"]').type(GROUP_NAME);
      cy.get('mat-dialog-actions button[type="submit"]').click();

      // The group is now selected in the dropdown
      cy.get('mat-select[formControlName="group"]').should('contain.text', GROUP_NAME);
      cy.get('[data-cy="workspace-unit-save-button"]').should('not.be.disabled');
      clickUnitPropertiesSaveButton();

      // Verify persistence
      cy.visitWs(ws1);
      openUnitProperties(unit1.shortname);
      cy.get('mat-select[formControlName="group"]').should('contain.text', GROUP_NAME);
    });

    it('can assign another unit to the existing group via dropdown', () => {
      cy.visitWs(ws1);
      openUnitProperties(unit2.shortname);
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');

      cy.get('mat-select[formControlName="group"]').click();
      cy.get(`mat-option:contains("${GROUP_NAME}")`).click();
      clickUnitPropertiesSaveButton();

      cy.visitWs(ws1);
      openUnitProperties(unit2.shortname);
      cy.get('mat-select[formControlName="group"]').should('contain.text', GROUP_NAME);
    });
  });

  // -------------------------------------------------------------------------
  // 7. Save-or-discard dialog – Save path
  // -------------------------------------------------------------------------

  describe('Save-or-discard dialog – Save path', () => {
    const tempName = 'Temp Edited Name';

    it('saves via dialog Save button and persists', () => {
      cy.visitWs(ws1);
      openUnitProperties(unit1.shortname);

      // Make an unsaved change
      cy.get('input[formControlName="name"]').clear().type(tempName);

      // Navigate away to trigger the dialog
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('dialogSave');
      selectUnit(unit2.shortname);

      // Dialog should appear
      cy.get('studio-lite-save-or-discard, mat-dialog-container').should('be.visible');

      // Click the Save button in the dialog (identified by the PATCH intercept firing)
      cy.translate(Cypress.expose('locale')).then(json => {
        cy.get('studio-lite-save-or-discard button, mat-dialog-actions button')
          .contains(json.workspace?.save || json.save)
          .click();
      });
      cy.wait('@dialogSave').its('response.statusCode').should('eq', 200);

      // Verify the name persisted
      cy.visitWs(ws1);
      openUnitProperties(unit1.shortname);
      cy.get('input[formControlName="name"]').should('have.value', tempName);
    });

    it('restores original name', () => {
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
      cy.get('input[formControlName="name"]').clear().type(unit1.name);
      clickUnitPropertiesSaveButton();
    });
  });

  // -------------------------------------------------------------------------
  // 8. Invalid key – validation
  // -------------------------------------------------------------------------

  describe('Unit key – validation', () => {
    it('shows validation error for forbidden key and clears error once key is valid', () => {
      const validKey = 'PROP_U1_VALID';
      cy.visitWs(ws1);
      openUnitProperties(unit1.shortname);

      // 1. Type invalid key with space/special chars
      cy.get('input[formControlName="key"]').clear().type('invalid key!').blur();
      cy.get('mat-error').should('be.visible');
      cy.get('input[formControlName="key"]').should('have.class', 'ng-invalid');

      // 2. Clear and type valid new key
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
      cy.get('input[formControlName="key"]').clear().type(validKey);
      cy.get('mat-error').should('not.exist');
      cy.get('input[formControlName="key"]').should('have.class', 'ng-valid');
      clickUnitPropertiesSaveButton();

      // 3. Restore original key
      cy.visitWs(ws1);
      openUnitProperties(validKey);
      cy.intercept('PATCH', '/api/workspaces/*/units/*/properties').as('saveProps');
      cy.get('input[formControlName="key"]').clear().type(unit1.shortname);
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
        ws1,
        unit2.shortname,
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
