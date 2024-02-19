import { userData, Metadata1 } from '../../../support/config/userdata';

function getNotationDeep(notation: string): number {
  return (notation.split('.')).length - 1;
}

function getCheckBoxByName(name: string, level:number = 1, additionalText: string = '') {
  if (level === 1) {
    cy.get('span')
      .contains(new RegExp(`^${additionalText}${name}$`))
      .prev()
      .click();
  } else {
    cy.get('span')
      .contains(new RegExp(`^${additionalText}${name}$`))
      .prev()
      .prev()
      .click();
  }
  cy.get('.mat-mdc-dialog-actions').contains('Bestätigen').click();
}

function getUncheckBoxByName(name: string, level:number = 1, additionalText: string = '') {
  cy.get('mat-checkbox .mdc-checkbox--selected')
    .click();
  cy.get('.mat-mdc-dialog-actions').contains('Bestätigen').click();
}

function getTime(time: string, propName:string):any {
  const minAuf = time.split(':')[0];
  const secAuf = time.split(':')[1];

  cy.get('div.label.ng-star-inserted')
    .contains(propName)
    .prevUntil('.duration-container > div > mat-form-field > div')
    .find('input')
    .as('aufgabenzeit');
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
}

function resetTime(time: string, propName:string):any {
  const minAuf = time.split(':')[0];
  const secAuf = time.split(':')[1];

  cy.get('div.label.ng-star-inserted')
    .contains(propName)
    .prevUntil('.duration-container > div > mat-form-field > div')
    .find('input')
    .as('aufgabenzeit');
  if (minAuf !== '00' && typeof minAuf !== 'undefined') {
    cy.get('@aufgabenzeit')
      .eq(0)
      .type('{selectAll}00');
  }
  if (secAuf !== '00' && typeof secAuf !== 'undefined') {
    cy.get('@aufgabenzeit')
      .eq(1)
      .type('{selectAll}00');
  }
}

function getBistaPrimar(notation :string):any {
  // split the notation
  // 2 search : partial and total
  let actualLevel: number = 0;
  const realLevel = getNotationDeep(notation);
  const notationParts = notation.split('.');
  let i = 0;
  let actualNotation: string = notationParts[i];

  while (actualLevel < realLevel) {
    i += 1;
    actualNotation = `${actualNotation}.${notationParts[i]}`;
    actualLevel += 1;
  }

  cy.get('span')
    .contains(new RegExp(`^${actualNotation}$`)).prev().click();
  cy.get('.mat-mdc-dialog-actions').contains('Bestätigen').click();
}

function getBistaSekundar(notations: string, label: string): any {
  const notationArray = notations.split(',');
  notationArray.forEach(notation => {
    cy.get(label).click();
    getBistaPrimar(notation);
  });
}

function insertOneRecord(record: Metadata1) {
  // cy.intercept('GET','/api/workspace').as('findUnit');
  cy.contains(record.Kurzname).click();
  // cy.wait('@findUnit').its('response.statusCode').should('eq',200);
  // Aufgabe
  // waitForMetadata();
  if (record.Entwickler !== '') {
    cy.get('mat-label:contains("Entwickler")').type(record.Entwickler);
  }
  if (record.Leitidee_Name !== '') {
    cy.get('mat-label:contains("Leitidee")').click();
    getCheckBoxByName(record.Leitidee_Name, 2, 'Leitidee ');
  }
  if (record.Aufgabenzeit !== '') {
    getTime(record.Aufgabenzeit, 'Aufgabenzeit');
  }
  if (record.Stimuluszeit !== '') {
    getTime(record.Stimuluszeit, 'Stimuluszeit');
  }
  // Item
  cy.get('.add-button > .mdc-button__label').click();
  cy.get('mat-expansion-panel:contains("ohne ID")').click();
  cy.get('mat-label:contains("Item ID *")').type('01');
  if (record.Itemformat !== '') {
    cy.get('mat-label:contains("Itemformat")').click();
    getCheckBoxByName(record.Itemformat, 1);
  }
  if (record.Anforderungsbereich !== '') {
    cy.get('mat-label:contains("Anforderungsbereich")').click();
    getCheckBoxByName(record.Anforderungsbereich, 1);
  }
  if (record.BiSta_Inhalt_Primar !== '') {
    cy.get('mat-label:contains("Inhaltsbezogener Bildungsstandard primär")').click();
    getBistaPrimar(record.BiSta_Inhalt_Primar);
  }
  if (record.BiSta_Inhalt_Sekundar !== '') {
    getBistaSekundar(record.BiSta_Inhalt_Sekundar, 'mat-label:contains("Inhaltsbezogener Bildungsstandard sekundär")');
  }
  if (record.BiSta_Prozess_Primar !== '') {
    cy.get('mat-label:contains("Prozessbezogener Bildungsstandard primär")').click();
    getBistaPrimar(record.BiSta_Prozess_Primar);
  }
  if (record.BiSta_Prozess_Sekundar !== '') {
    getBistaSekundar(record.BiSta_Prozess_Sekundar, 'mat-label:contains("Inhaltsbezogener Bildungsstandard primär")');
  }

  if (record.Itemzeit !== '') {
    getTime(record.Itemzeit, 'Itemzeit');
    cy.get('mat-label:contains("Schwierigkeit")').click();
  }

  if (record.Schwierigkeit !== '') {
    getCheckBoxByName(record.Schwierigkeit, 2);
  }
  cy.pause();
  cy.contains('Speichern').click();
}

function deleteOneRecord(record: Metadata1) {
  cy.contains(record.Kurzname).click();

  cy.get('mat-label:contains("Entwickler")').type('{selectall} ');

  if (record.Leitidee_Name !== '') {
    // cy.get('mat-label:contains("Leitidee")').click();
    // getUncheckBoxByName(record.Leitidee_Name, 2, 'Leitidee ');
    cy.get('button.mat-mdc-chip-remove').eq(0).click();
  }
  if (record.Aufgabenzeit !== '') {
    resetTime(record.Aufgabenzeit, 'Aufgabenzeit');
  }
  if (record.Stimuluszeit !== '') {
    resetTime(record.Stimuluszeit, 'Stimuluszeit');
  }

  // Item
  cy.get('.fx-row-space-between-start > .mdc-icon-button > .mat-mdc-button-touch-target').click();
  cy.pause();
  cy.contains('Speichern').click();
}

describe('metadata', () => {
  beforeEach(() => {
    cy.viewport(1600, 900);
  });

  /*   afterEach(function(){
     cy.get('a > .mat-mdc-tooltip-trigger').click();
     cy.get('.mdc-button__label').click();
     cy.get('[studiolitelogout=""] > .mat-mdc-menu-item').click();
     cy.get('.mat-mdc-dialog-actions').contains('Abmelden').click();
   }); */

  it('insert', () => {
    cy.visit('https://studio.iqb.hu-berlin.de/');
    cy.get('#mat-input-0').type(userData.user_name);
    cy.get('#mat-input-1').type(userData.user_pass);
    cy.get('button > .mdc-button__label').click();
    cy.wait(400);
    // cy.intercept('GET', '/#/a/13').as('accessZone');
    cy.contains('Probe Dezember').click();
    // cy.visit('https://studio.iqb.hu-berlin.de/#/a/13');
    // cy.pause();

    cy.fixture('record').then(record => {
      record.forEach((r: Metadata1) => {
        insertOneRecord(r);
      });
    });

    cy.wait(400);
  });

  it.only('delete', () => {
    cy.visit('https://studio.iqb.hu-berlin.de/');
    cy.get('#mat-input-0').type(userData.user_name);
    cy.get('#mat-input-1').type(userData.user_pass);
    cy.get('button > .mdc-button__label').click();
    cy.wait(400);
    // cy.intercept('GET', '/#/a/13').as('accessZone');
    cy.contains('Probe Dezember').click();
    // cy.visit('https://studio.iqb.hu-berlin.de/#/a/13');
    // cy.pause();

    cy.fixture('record').then(record => {
      record.forEach((r: Metadata1) => {
        deleteOneRecord(r);
      });
    });

    cy.wait(400);
  });
});
