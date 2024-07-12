// @ts-check
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../global.d.ts" />

import { UnitData } from './testData';

// 32
Cypress.Commands.add('createUnitAPI', (unitData: UnitData, idGroup:string) => {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  return cy.request({
    method: 'POST',
    url: `/api/workspace/${idGroup}/units`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      key: `${unitData.shortname}`,
      name: `${unitData.name}`
    },
    failOnStatusCode: false
  });
});

// 33
Cypress.Commands.add('deleteUnitAPI', (idUnit: string, idGroup:string) => {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  return cy.request({
    method: 'DELETE',
    url: `/api/workspace/${idGroup}/${idUnit}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});
