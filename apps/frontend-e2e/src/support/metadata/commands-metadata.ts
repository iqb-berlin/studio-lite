// 35
import { MetadataValuesEntry } from '@studio-lite-lib/api-dto';

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
  (wsId: string, unitProfile: string, itemProfile:string, token:string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'PATCH',
      url: `/api/workspace/${wsId}/settings`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: {
        itemMDProfile: `${itemProfile}`,
        unitMDProfile: `${unitProfile}`
      },
      failOnStatusCode: false
    });
  });

// 40
Cypress.Commands.add(
  'updateUnitMetadataAPI',
  (wsId: string, unitId: string, profile:string, entry: MetadataValuesEntry, token: string) => {
    const authorization = `bearer ${token}`;
    console.log(entry);
    console.log(wsId);
    console.log(unitId);
    console.log(profile);
    cy.request({
      method: 'PATCH',
      url: `/api/workspace/${wsId}/${unitId}/metadata`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: {
        id: `${unitId}`,
        metadata: {
          profiles: [{
            isCurrent: true,
            profileId: `${profile}`,
            entries: [`${entry}`]
          }]
        }
      },
      failOnStatusCode: false
    });
  }
);

// 41
Cypress.Commands.add('getUnitMetadataAPI', (wsId:string, unitId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspace/${wsId}/${unitId}/metadata`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// So should be 37.
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
