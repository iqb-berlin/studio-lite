import { IqbProfile, IqbProfileExamples, RegistryProfile } from './iqbProfile';
import {
  clickIndexTabAdmin,
  clickIndexTabWsgAdmin,
  goToWsMenu
} from '../helpers';

function getCheckBoxByName(name: string) {
  cy.get('mat-tree-node>div>span').contains(name).prev().then($actualElem => {
    if ($actualElem.is('mat-checkbox')) {
      cy.wrap($actualElem).click();
    } else {
      cy.wrap($actualElem).prev().click();
    }
  });
  cy.get('[data-cy="metadata-nested-tree-confirm-button"]').click();
}

function getTimeNumber(time: string, propName: string, profile: string) {
  if (time.split(':').length !== 1) {
    const minAuf = time.split(':')[0];
    const secAuf = time.split(':')[1];
    cy.get(`mat-form-field:contains("${propName}")`)
      .eq(-1)
      .find('input')
      .as('aufgabenzeit');
    if (minAuf !== '00' && typeof minAuf !== 'undefined') {
      cy.get('@aufgabenzeit').eq(0).type(minAuf);
    }
    if (secAuf !== '00' && typeof secAuf !== 'undefined') {
      cy.get('@aufgabenzeit').eq(1).type(secAuf);
    }
  } else {
    cy.get(`mat-label:contains("${propName}")`).type(
      IqbProfileExamples.get(profile).get(propName)
    );
  }
}

export function selectProfileForGroupFromAdmin(group: string, profile: IqbProfile) {
  cy.visit('/');
  cy.get('[data-cy="goto-admin"]').click();
  clickIndexTabAdmin('workspace-groups');
  cy.get('mat-table')
    .contains(group)
    .click();
  cy.get('mat-icon')
    .contains('settings')
    .click();
  checkProfile(profile);
  cy.get('[data-cy="admin-edit-workspace-group-settings-save-button"]').click();
}

export function selectProfileForGroup(group: string, profile: IqbProfile) {
  cy.visit('/');
  cy.findAdminGroupSettings(group).click();
  clickIndexTabWsgAdmin('settings');
  checkProfile(profile);
  cy.get('mat-icon:contains("save")').click();
}

export function selectProfileForArea(profiles: IqbProfile[]) {
  goToWsMenu();
  cy.get('[data-cy="workspace-edit-unit-settings"]').click();
  cy.get('[data-cy="edit-workspace-settings-select-unit-profile"]').click();
  cy.get('[data-cy="edit-workspace-settings-unit-profile"]').contains(profiles[0]).click();
  cy.get('[data-cy="edit-workspace-settings-select-item-profile"]').click();
  cy.get('[data-cy="edit-workspace-settings-item-profile"]').contains(profiles[1]).click();
  cy.get('[data-cy="edit-workspace-settings-submit-button"]').click();
}

export function selectProfileForAreaFromGroup(profiles: IqbProfile[], area: string, group: string) {
  cy.visit('/');
  cy.findAdminGroupSettings(group).click();
  cy.get('[data-cy="wsg-admin-routes-workspaces"]').should('be.visible');
  clickIndexTabWsgAdmin('workspaces');
  cy.get('mat-table').contains(area).click();
  cy.get('mat-icon').contains('settings').click();
  cy.get('mat-select').eq(0).should('be.visible').click();
  cy.get('[data-cy="edit-workspace-settings-unit-profile"]').contains(profiles[0]).click();
  cy.get('mat-select').eq(1).should('be.visible').click();
  cy.get('[data-cy="edit-workspace-settings-item-profile"]').contains(profiles[1]).click();
  cy.clickDataCyWithResponseCheck(
    '[data-cy="edit-workspace-settings-submit-button"]',
    [200],
    '/api/workspaces/*/settings',
    'PATCH',
    'setProfileArea'
  );
}

export function checkProfile(profile: string): void {
  const alias = `load${profile}`;
  cy.intercept(
    'GET',
    '/api/metadata/profiles?url=https://w3id.org/iqb/p99/item/'
  ).as(alias);
  cy.get('[data-cy="shared-profiles-select-profile-title"]')
    .contains(profile)
    .click();
  cy.get('[data-cy="shared-profiles-select-profile"]')
    .filter(`:contains(${profile})`)
    .click();
}

export function checkMultipleProfiles(profiles: string[]): void {
  cy.intercept(
    'GET',
    '/api/metadata/profiles?url=https://w3id.org/iqb/p99/item/'
  ).as('selectedProfiles');
  cy.wait('@selectedProfiles')
    .its('response.statusCode')
    .should('to.be.oneOf', [200, 304]);
  profiles.forEach(profile => {
    cy.get('[data-cy="shared-profiles-select-profile-title"]')
      .contains(profile)
      .click();
    cy.get('[data-cy="shared-profiles-select-profile"]')
      .filter(`:contains(${profile})`)
      .click();
  });
}

export function getStructure(profile: string, moreThanOne: boolean): void {
  cy.request({
    method: 'GET',
    url: RegistryProfile.get(profile)
    // eslint-disable-next-line @typescript-eslint/no-shadow
  }).then(response => {
    const unitMap = new Map<string, string>();
    expect(response).property('status').to.equal(200);
    const body = JSON.parse(response.body);
    // eslint-disable-next-line
    body.groups.forEach((group: any) => group.entries.forEach((entry: any) => unitMap
      .set(entry.label[0].value, entry.type)));
    unitMap.forEach((type: string, fieldName: string) => {
      const example = IqbProfileExamples.get(profile).get(fieldName);
      // A field the example data says nothing about is skipped, not filled with `undefined`.
      if (typeof example === 'string' && example !== '') {
        switch (type.toUpperCase()) {
          case 'NUMBER': {
            getTimeNumber(example, fieldName, profile);
            break;
          }
          case 'VOCABULARY': {
            if (moreThanOne) cy.get(`mat-label:contains("${fieldName}")`).eq(-1).click();
            else cy.get(`mat-label:contains("${fieldName}")`).click();
            getCheckBoxByName(example);
            break;
          }
          case 'BOOLEAN': {
            if (example === 'true') {
              cy.get('mat-slide-toggle button').click();
            }
            break;
          }
          default: {
            if (moreThanOne) cy.get(`mat-label:contains("${fieldName}")`).eq(-1).type(example);
            else cy.get(`mat-label:contains("${fieldName}")`).type(example);
            break;
          }
        }
      }
    });
  });
}

export function getItem(profile: string, moreThanOne: boolean, copyItem?: string) {
  cy.get('.add-item-button > .mdc-button__label').click();
  if (copyItem) {
    cy.get('[data-cy="metadata-new-item-content"]').click();
    cy.contains('mat-option', '02').click();
    cy.get('[data-cy="metadata-new-item-button"]').click();
  } else if (moreThanOne) {
    cy.get('[data-cy="metadata-new-item-button"]').click();
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get(`mat-expansion-panel:contains("${json.metadata['without-id']}")`).click();
      cy.get('mat-label:contains("Item ID")')
        .eq(-1).type(IqbProfileExamples.get(profile).get('Item ID'));
      cy.get(`mat-label:contains("${json.metadata.description}")`)
        .eq(-1).type(IqbProfileExamples.get(profile).get('Notiz'));
    });
    getStructure(profile, moreThanOne);
  } else {
    cy.translate(Cypress.expose('locale')).then(json => {
      cy.get(`mat-expansion-panel:contains("${json.metadata['without-id']}")`).click();
      cy.get('mat-label:contains("Item ID")')
        .eq(-1).type(IqbProfileExamples.get(profile).get('Item ID'));
      cy.get(`mat-label:contains("${json.metadata.description}")`)
        .eq(-1).type(IqbProfileExamples.get(profile).get('Notiz'));
    });
    getStructure(profile, moreThanOne);
  }
}
