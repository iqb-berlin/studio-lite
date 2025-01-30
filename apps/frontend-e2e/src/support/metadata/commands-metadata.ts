import { WsSettings } from '../testData';

// 35
Cypress.Commands.add('getRegistryAPI',
  (token:string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'GET',
      url: '/api/metadata-profile/registry',
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      failOnStatusCode: false
    });
  });

// 36
Cypress.Commands.add('getMetadataAPI', (profile:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/metadata-profile?url=${profile}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 37
Cypress.Commands.add('updateGroupMetadataAPI', (groupId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/workspace-groups/${groupId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      id: `${groupId}`,
      settings: {
        profiles: [
          {
            id: `${Cypress.env('profile1')}`,
            label: `${Cypress.env('label1')}`
          },
          {
            id: `${Cypress.env('profile2')}`,
            label: `${Cypress.env('label2')}`
          }]
      }
    },
    failOnStatusCode: false
  });
});

// 38
Cypress.Commands.add('getVocabularyMetadataAPI', (profile: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/metadata-profile/vocabularies',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      url: `${profile}`
    },
    failOnStatusCode: false
  });
});

// 39
Cypress.Commands.add('updateWsMetadataAPI',
  (wsId: string, settings: WsSettings, token:string) => {
    const authorization = `bearer ${token}`;
    // defaultEditor: `${settings.defaultEditor}`,
    // defaultPlayer: `${settings.defaultPlayer}`,
    // defaultSchemer: `${settings.defaultSchemer}`,
    // stableModulesOnly: `${settings.stableModulesOnly}`,
    cy.request({
      method: 'PATCH',
      url: `/api/workspaces/${wsId}/settings`,
      headers: {
        'app-version': Cypress.env('version'),
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

// 41
// Cypress.Commands.add(
//   'updateUnitMetadataAPI',
//   (wsId: string, unitId: string, profile:string, entry: MetadataValuesEntry, token: string) => {
//     console.log(entry);
// eslint-disable-next-line max-len
//     const jsonObj = JSON.parse('[{"id":"a1","label":[{"lang":"de","value":"Für SPF geeignet"}],"value":"false","valueAsText":{"lang":"de","value":"ja"}},{"id":"iqb_phones","label":[{"lang":"de","value":"Kopfhörer"}],"value":[],"valueAsText":[]},{"id":"w8","label":[{"lang":"de","value":"Leitidee"}],"value":[],"valueAsText":[]},{"id":"iqb_author","label":[{"lang":"de","value":"Entwickler:in"}],"value":[{"lang":"de","value":"Ana Maier"}],"valueAsText":[{"lang":"de","value":"Ana Maier"}]}]');
//     const authorization = `bearer ${token}`;
//     const nu = parseInt(`${unitId}`, 10);
//     cy.request({
//       method: 'PATCH',
//       url: `/api/workspaces/${wsId}/units/${unitId}/metadata`,
//       headers: {
//         'app-version': Cypress.env('version'),
//         authorization
//       },
//       body: {
//         id: nu,
//         metadata: {
//           profiles: [{
//             entries: `${jsonObj}`,
//             profileId: `${profile}`,
//             isCurrent: true
//           }]
//         }
//       },
//       failOnStatusCode: false
//     });
//   }
// );
//
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
//       'app-version': Cypress.env('version'),
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
