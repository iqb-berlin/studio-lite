import { IqbProfile, IqbProfileExamples, RegistryProfile } from './iqbProfile';

function getCheckBoxByName(name: string) {
  cy.log(typeof name);
  if (typeof name !== 'undefined') {
    cy.get('mat-tree-node>div>span').contains(name).prev().then($actualElem => {
      if ($actualElem.is('mat-checkbox')) {
        cy.wrap($actualElem).click();
      } else {
        cy.wrap($actualElem).prev().click();
      }
    });
    cy.get('.mat-mdc-dialog-actions').contains('Bestätigen').click();
  } else {
    cy.get('.mat-mdc-dialog-actions').contains('Abbrechen').click();
  }
}

function getTimeNumber(time: string, propName:string, profile:string, moreThanOne:boolean) {
  if (time.split(':').length !== 1) {
    const minAuf = time.split(':')[0];
    const secAuf = time.split(':')[1];
    if (moreThanOne) {
      cy.contains(propName)
        .prevUntil('.duration-container > div > mat-form-field > div')
        .find('input')
        .eq(-1)
        .as('aufgabenzeit');
    } else {
      cy.contains(propName)
        .prevUntil('.duration-container > div > mat-form-field > div')
        .find('input')
        .as('aufgabenzeit');
    }
    if (minAuf !== '00' && typeof minAuf !== 'undefined') {
      cy.get('@aufgabenzeit')
        .eq(0)
        .type(minAuf);
    }
    if (secAuf !== '00' && typeof secAuf !== 'undefined') {
      cy.get('@aufgabenzeit')
        .eq(1)
        .type(secAuf);
    }
  } else {
    cy.get(`mat-label:contains("${propName}")`).type(IqbProfileExamples.get(profile).get(propName));
  }
}

export function selectProfileForGroupFromAdmin(group:string, profile:IqbProfile) {
  // cy.get('[data-cy="goto-admin"]').click();
  cy.get('div')
    .contains('studio-lite-wrapped-icon', 'settings')
    .click();
  cy.get('span:contains("Bereichsgruppen")')
    .eq(0)
    .click();
  cy.get('mat-table')
    .contains(group)
    .click();
  cy.get('mat-icon')
    .contains('settings')
    .click();
  checkProfile(profile);

  // cy.dialogButtonToContinue('Speichern', 200, '/api/admin/workspace-groups/', 'PATCH', 'setProfile');
  cy.clickButton('Speichern');
}

export function selectProfileForGroup(group:string, profile:IqbProfile) {
  cy.get(`div>div>div>div:contains("${group}")`)
    .eq(0)
    .next()
    .click();
  cy.get('span:contains("Einstellungen")')
    .eq(0)
    .click();
  checkProfile(profile);
  cy.get('mat-icon:contains("save")').click();
}

export function selectProfileForArea(profile:IqbProfile) {
  cy.get('mat-icon:contains("menu")')
    .click();
  cy.get('span:contains("Einstellungen")')
    .click();
  cy.contains('div', 'Aufgaben Profil').find('svg').click();
  cy.get('mat-option>span').contains(profile).click();
  cy.contains('div', 'Item Profil').find('svg').click();
  cy.get('mat-option>span').contains(profile).click();
  cy.get('mat-dialog-actions > button > span.mdc-button__label:contains("Speichern")').click();
}

export function selectProfileForAreaFromGroup(profile:IqbProfile, area:string, group:string) {
  cy.get(`div>div>div>div:contains("${group}")`)
    .eq(0)
    .next()
    .click();
  cy.get('span:contains("Arbeitsbereiche")')
    .eq(0)
    .click();
  cy.get('mat-table')
    .contains(area)
    .click();
  cy.get('mat-icon')
    .contains('settings')
    .click();
  cy.get('mat-select').eq(0).click();
  cy.get(`span:contains(${profile})`)
    .contains('Aufgabe')
    .click();
  cy.get('mat-select').eq(1).click();
  cy.get(`span:contains(${profile})`)
    .contains('Item')
    .click();
  cy.buttonToContinue('Speichern', [200], '/api/workspaces/*/settings', 'PATCH', 'setProfileArea');
}

export function checkProfile(profile: string):void {
  const alias = `load${profile}`;
  cy.intercept('GET', '/api/metadata/profiles?url=https://raw.githubusercontent.com/iqb-vocabs/p16/master/item.json')
    .as(alias);
  cy.wait(`@${alias}`)
    .its('response.statusCode')
    .should('to.be.oneOf', [200, 304]);
  cy.get('mat-panel-title')
    .contains(profile)
    .parent()
    .next()
    .click();
  cy.get('label:contains("Aufgabe")')
    .contains(profile)
    .prev()
    .click();
  cy.get('label:contains("Item")')
    .contains(profile)
    .prev()
    .click();
}

export function checkMultipleProfiles(profiles: string[]):void {
  cy.intercept('GET', '/api/metadata/profiles?url=https://raw.githubusercontent.com/iqb-vocabs/p16/master/item.json')
    .as('selectedProfiles');
  cy.wait('@selectedProfiles')
    .its('response.statusCode')
    .should('to.be.oneOf', [200, 304]);
  profiles.forEach(profile => {
    cy.get('mat-panel-title')
      .contains(profile)
      .parent()
      .next()
      .click();
    cy.get('label:contains("Aufgabe")')
      .contains(profile)
      .prev()
      .click();
    cy.get('label:contains("Item")')
      .contains(profile)
      .prev()
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
    body.groups.forEach((group: any) => group.entries.forEach((entry:any) => unitMap
      .set(entry.label[0].value, entry.type)));
    unitMap.forEach((type:string, fieldName:string) => {
      cy.log(IqbProfileExamples.get(profile).get(fieldName));
      if (IqbProfileExamples.get(profile).get(fieldName) !== ('')) {
        switch (type) {
          case 'number': {
            getTimeNumber(IqbProfileExamples.get(profile).get(fieldName), fieldName, profile, moreThanOne);
            break;
          }
          case 'vocabulary': {
            if (moreThanOne) cy.get(`mat-label:contains("${fieldName}")`).eq(-1).click();
            else cy.get(`mat-label:contains("${fieldName}")`).click();
            getCheckBoxByName(IqbProfileExamples.get(profile).get(fieldName));
            break;
          }
          default: {
            // eslint-disable-next-line max-len
            if (moreThanOne) cy.get(`mat-label:contains("${fieldName}")`).eq(-1).type(IqbProfileExamples.get(profile).get(fieldName));
            else cy.get(`mat-label:contains("${fieldName}")`).type(IqbProfileExamples.get(profile).get(fieldName));
            break;
          }
        }
      }
    });
  });
}

export function getItem(profile:string, moreThanOne: boolean, copyItem?: string) {
  cy.get('.add-button > .mdc-button__label').click();
  if (copyItem) {
    cy.contains('div', 'Inhalt für Item übernehmen').find('svg').click();
    cy.contains('mat-option', '02').click();
    cy.clickButton('Bestätigen');
  } else if (moreThanOne) {
    cy.clickButton('Bestätigen');
    cy.get('mat-expansion-panel:contains("ohne ID")').click();
    cy.get('mat-label:contains("Item ID")').eq(-1).type(IqbProfileExamples.get(profile).get('Item ID'));
    cy.get('mat-label:contains("Wichtung")').eq(-1).type(IqbProfileExamples.get(profile).get('Wichtung'));
    cy.get('mat-label:contains("Notiz")').eq(-1).type(IqbProfileExamples.get(profile).get('Notiz'));
    getStructure(profile, moreThanOne);
  } else {
    cy.get('mat-expansion-panel:contains("ohne ID")').click();
    cy.get('mat-label:contains("Item ID")').type(IqbProfileExamples.get(profile).get('Item ID'));
    cy.get('mat-label:contains("Wichtung")').type(IqbProfileExamples.get(profile).get('Wichtung'));
    cy.get('mat-label:contains("Notiz")').eq(1).type(IqbProfileExamples.get(profile).get('Notiz'));
    getStructure(profile, moreThanOne);
  }
}
