import { WsSettings } from '../testData';

// 30
Cypress.Commands.add('getRegistryAPI',
  (token:string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'GET',
      url: '/api/metadata/registry',
      headers: {
        'app-version': Cypress.expose('version'),
        authorization
      },
      failOnStatusCode: false
    });
  });

// 31
Cypress.Commands.add('getMetadataAPI', (profile:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/metadata/profiles?url=${profile}`,
    headers: {
      'app-version': Cypress.expose('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 32
Cypress.Commands.add('updateGroupMetadataAPI', (groupId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/workspace-groups/${groupId}`,
    headers: {
      'app-version': Cypress.expose('version'),
      authorization
    },
    body: {
      id: `${groupId}`,
      settings: {
        profiles: [
          {
            id: `${Cypress.expose('profile1')}`,
            label: `${Cypress.expose('label1')}`
          },
          {
            id: `${Cypress.expose('profile2')}`,
            label: `${Cypress.expose('label2')}`
          }]
      }
    },
    failOnStatusCode: false
  });
});

// 33
Cypress.Commands.add('getVocabularyMetadataAPI', (profile: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/metadata/vocabularies',
    headers: {
      'app-version': Cypress.expose('version'),
      authorization
    },
    // The route reads the url from the query; sent in the body, it arrived as no url at all (#2095)
    qs: { url: profile },
    failOnStatusCode: false
  });
});

// 34
Cypress.Commands.add('updateWsMetadataAPI',
  (wsId: string, settings: WsSettings, token:string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'PATCH',
      url: `/api/workspaces/${wsId}/settings`,
      headers: {
        'app-version': Cypress.expose('version'),
        authorization
      },
      body: {
        unitGroups: ['Bista'],
        itemMDProfile: `${settings.itemMDProfile}`,
        unitMDProfile: `${settings.unitMDProfile}`,
        defaultEditor: `${settings.defaultEditor}`,
        defaultPlayer: `${settings.defaultPlayer}`,
        defaultSchemer: `${settings.defaultSchemer}`
      },
      failOnStatusCode: false
    });
  });

// should be 37.
// Cypress.Commands.add('updateGroupMetadataAPI', (groupId: string, profiles: ProfileData[], token:string) => {
//   const authorization = `bearer ${token}`;
//   const num = profiles.length;
//   let addText:string;
//   addText = '{\n' +
//   `\tid: ${profiles[0].profile}\n` +
//   `\tlabel: ${profiles[0].label}\n` +
//   '}';
//
//   for (let i = 1; i < num; i++) {
//     addText = `${addText},{\n` +
//   `\tid: ${profiles[i].profile}\n` +
//   `\tlabel: ${profiles[i].label}\n` +
//   '}';
//   }
//   cy.request({
//     method: 'PATCH',
//     url: `/api/workspace-groups/${groupId}`,
//     headers: {
//       'app-version': Cypress.expose('version'),
//       authorization
//     },
//     body: {
//       id: `${groupId}`,
//       settings: {
//         profiles: [
//           addText]
//       }
//     },
//     failOnStatusCode: false
//   });
// });
