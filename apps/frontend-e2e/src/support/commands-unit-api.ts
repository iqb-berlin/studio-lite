// @ts-check
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../global.d.ts" />

import { UnitData } from './testData';

// 32
Cypress.Commands.add('createUnitAPI', (unitData: UnitData, id:string) => {
  const authorization = `bearer ${Cypress.env('token_admin')}`;
  return cy.request({
    method: 'POST',
    url: `/api/workspace/${id}/units`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      key: `${unitData.shortname}`,
      name: `${unitData.name}`,
      groupName: '',
      createFrom: 0,
      player: '',
      editor: '',
      schemer: '',
      schemeType: '',
      scheme: '',
      metadata: {},
      variables: [
      ]
    },
    failOnStatusCode: false
  });
});
