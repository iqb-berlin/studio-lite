// @ts-check
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../global.d.ts" />
import {
  UserData,
  GroupData,
  WsData,
  AccessLevel,
  UnitData,
  AccessUser,
  CommentData,
  ReviewData,
  MyData,
  DefinitionUnit, CopyUnit, WsSettings
} from './testData';
import { UnitExport } from '../e2e/api/api-settings.cy';
import { buildQueryParameters, buildQueryParametersComplex } from './utilAPI';

// 1
Cypress.Commands.add('addFirstUserAPI', (username: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/init-login',
    headers: {
      'app-version': Cypress.env('version')
    },
    body: {
      username: username,
      password: password
    },
    failOnStatusCode: false
  });
});

// 2
Cypress.Commands.add('loginAPI', (username: string, password:string) => {
  cy.request({
    method: 'POST',
    url: '/api/login',
    headers: {
      'app-version': Cypress.env('version')
    },
    body: {
      username: `${username}`,
      password: `${password}`
    },
    failOnStatusCode: false
  });
});

// 3
Cypress.Commands.add('getUserIdAPI', (token: string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/auth-data',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 4
Cypress.Commands.add('updatePasswordAPI', (token: string, oldPass: string, newPass:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: '/api/password',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      oldPassword: oldPass,
      newPassword: newPass
    },
    failOnStatusCode: false
  });
});
// 5
Cypress.Commands.add('keycloakAPI', (user:UserData) => {
  cy.request({
    method: 'POST',
    url: '/api/keycloak-login',
    headers: {
      'app-version': Cypress.env('version')
    },
    body: {
      description: '',
      email: `${user.username}@hu-berlin.com`,
      firstName: `${user.username}`,
      identity: `${user.username}`,
      isAdmin: `${user.isAdmin}`,
      issuer: 'https://www.iqb-login.de/realms/iqb',
      lastName: `${user.username}`,
      name: `${user.username}`,
      password: ''
    },
    failOnStatusCode: false
  });
});

// 6
Cypress.Commands.add('createUserAPI', (userData:UserData, token:string) => {
  const authorization = `bearer ${token}`;
  const isAdmin = userData.isAdmin;
  cy.request({
    method: 'POST',
    url: '/api/admin/users',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      name: `${userData.username}`,
      password: `${userData.password}`,
      isAdmin: isAdmin
    },
    failOnStatusCode: false
  });
});

// 7.
Cypress.Commands.add('getUsersFullAPI',
  (full: boolean, token: string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'GET',
      url: `/api/group-admin/users?full=${full}`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      failOnStatusCode: false
    });
  });

// 10
Cypress.Commands.add('updateUserAPI',
  (id: string, user:UserData, credentials: boolean, token:string) => {
    const authorization = `bearer ${token}`;
    const nu = parseInt(`${Cypress.env(`id_${user.username}`)}`, 10);
    cy.request({
      method: 'PATCH',
      url: `/api/admin/users/${id}`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: {
        id: nu,
        isAdmin: credentials
      },
      failOnStatusCode: false
    });
  });

// 12
Cypress.Commands.add('createGroupAPI', (group:GroupData, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'POST',
    url: '/api/admin/workspace-groups',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      name: `${group.name}`,
      setting: {}
    },
    failOnStatusCode: false
  });
});

// 13
Cypress.Commands.add('getGroupByIdAPI', (groupId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/workspace-groups/${groupId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 14
Cypress.Commands.add('getGroupAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/admin/workspace-groups',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 14
Cypress.Commands.add('updateGroupAPI', (groupId:string, newGroupName: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/admin/workspace-groups/${groupId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      id: groupId,
      name: newGroupName
    },
    failOnStatusCode: false
  });
});

// 16
Cypress.Commands.add('setAdminsOfGroupAPI', (userIds: string[], groupId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/admin/workspace-groups/${groupId}/admins`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: userIds,
    failOnStatusCode: false
  });
});

// 8
Cypress.Commands.add('getUserAPI',
  (id:string, token:string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'GET',
      url: `/api/admin/users/${id}/workspace-groups`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      failOnStatusCode: false
    });
  });

// 17
Cypress.Commands.add('getAdminOfGroupAPI', (groupId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/workspace-groups/${groupId}/admins`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 18
Cypress.Commands.add('createWsAPI', (groupId: string, ws:WsData, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'POST',
    url: '/api/group-admin/workspaces',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      groupId: `${groupId}`,
      name: `${ws.name}`
    },
    failOnStatusCode: false
  });
});

// 19
Cypress.Commands.add('moveWsAPI', (ws:string, newGroup: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: '/api/group-admin/workspaces/group-id',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      ids: [`${ws}`],
      targetId: `${newGroup}`
    },
    failOnStatusCode: false
  });
});

// 20
Cypress.Commands.add('getWsAPI', (wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/group-admin/workspaces/${wsId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 21
Cypress.Commands.add('updateUsersOfWsAPI', (wsId:string, level:AccessLevel,
                                            userId: string, token:string) => {
  // TODO use a string list as parameters instead of a string for userId
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/group-admin/workspaces/${wsId}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: [
      {
        accessLevel: level,
        id: userId
      }
    ],
    failOnStatusCode: false
  });
});
// 21a
Cypress.Commands.add(
  'updateUserListOfWsAPI',
  (wsId: string, l: AccessUser[], token: string) => {
    const authorization = `bearer ${token}`;
    // const num = l.length;
    // let addText: string;
    // addText =
    //   '{\n' +
    //   ` accessLevel: '${l[0].access}',\n` +
    //   ` id: '${l[0].id}'\n` +
    //   '}';
    //
    // for (let i = 1; i < num; i++) {
    //   addText =
    //     `${addText},{\n` +
    //     ` accessLevel: '${l[i].access}',\n` +
    //     ` id: '${l[i].id}'\n` +
    //     '}';
    // }
    // console.log(addText);
    cy.request({
      method: 'PATCH',
      url: `/api/group-admin/workspaces/${wsId}/users`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: [
        {
          accessLevel: `${l[0].access}`,
          id: `${l[0].id}`
        },
        {
          accessLevel: `${l[1].access}`,
          id: `${l[1].id}`
        }
      ],
      failOnStatusCode: false
    });
  }
);
// 22
Cypress.Commands.add('getUsersOfWsAdminAPI', (wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/group-admin/workspaces/${wsId}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 23
Cypress.Commands.add('getWsByGroupAPI',
  (id:string, token:string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'GET',
      url: `/api/admin/workspace-groups/${id}/workspaces`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      failOnStatusCode: false
    });
  });

// 25
Cypress.Commands.add('addModuleAPI', (module:string, token: string) => {
  const authorization = `bearer ${token}`;
  cy.fixture(module, 'binary')
    .then(fileContent => {
      const formData = new FormData();
      formData.append('file', new Blob([fileContent], { type: 'html' }), module);
      cy.request({
        method: 'POST',
        url: '/api/admin/verona-modules',
        headers: {
          'app-version': Cypress.env('version'),
          'Content-Type': 'multipart/form-data',
          authorization
        },
        body: formData,
        failOnStatusCode: false
      });
    });
});

// 26
Cypress.Commands.add('getModulesAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/verona-modules',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 27
Cypress.Commands.add('getModuleAPI', (module:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/verona-modules/${module}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 30
Cypress.Commands.add('createUnitAPI', (wsId:string, unit: UnitData, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'POST',
    url: `/api/workspaces/${wsId}/units`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      key: `${unit.shortname}`,
      name: `${unit.name}`,
      groupName: `${unit.group}`
    },
    failOnStatusCode: false
  });
});

// 31
Cypress.Commands.add('getUnitsAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/admin/workspace-groups/units',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 32
Cypress.Commands.add('updateWsSettingsAPI', (wsId:string, ws: WsSettings, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/settings`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      defaultEditor: ws.defaultEditor,
      defaultPlayer: ws.defaultPlayer,
      defaultSchemer: ws.defaultSchemer,
      unitGroups: ws.unitGroups,
      stableModulesOnly: ws.stableModulesOnly,
      unitMDProfile: ws.unitMDProfile,
      itemMDProfile: ws.itemMDProfile
    },
    failOnStatusCode: false
  });
});

// 33
Cypress.Commands.add('getWsNormalAPI', (wsId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 34
Cypress.Commands.add('getUsersByWsAPI', (wsId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/users`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 40
Cypress.Commands.add('getUnitPropertiesAPI', (wsId:string, unitId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/units/${unitId}/properties`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 41
Cypress.Commands.add(
  'updateUnitPropertiesAPI',
  (wsId: string, unitId: string, entry: DefinitionUnit, token: string) => {
    const authorization = `bearer ${token}`;
    const nu = parseInt(`${unitId}`, 10);
    cy.request({
      method: 'PATCH',
      url: `/api/workspaces/${wsId}/units/${unitId}/properties`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: {
        id: nu,
        groupName: entry.groupName
      },
      failOnStatusCode: false
    });
  }
);

// 42
Cypress.Commands.add('getUnitsByWsAPI', (wsId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/units`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 50
Cypress.Commands.add('moveToAPI', (wsOriginId:string, wsDestinyId: string, unitId:string, token:string) => {
  // TO DO replace the unitId by an ids array
  const authorization = `bearer ${token}`;
  const nu = parseInt(`${wsDestinyId}`, 10);
  const unitIdNumber = parseInt(`${unitId}`, 10);
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsOriginId}/units/workspace-id`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      targetId: nu,
      ids: [unitIdNumber]
    },
    failOnStatusCode: false
  });
});

// 51
Cypress.Commands.add('renameWsAPI', (wsId:string, wsName:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/name`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      name: `${wsName}`
    },
    failOnStatusCode: false
  });
});

// 52
Cypress.Commands.add('copyToAPI', (wsDestinationId:string, copyUnit:CopyUnit, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'POST',
    url: `/api/workspaces/${wsDestinationId}/units`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      createForm: copyUnit.createForm,
      groupName: copyUnit.groupName,
      key: copyUnit.key,
      name: copyUnit.name
    },
    failOnStatusCode: false
  });
});

// 54
Cypress.Commands.add('getGroupsOfWsAPI', (wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/groups`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});
// 55
Cypress.Commands.add('updateGroupNameOfWsAPI', (wsId: string, groupName: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/group-name`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      groupName: groupName
    },
    failOnStatusCode: false
  });
});

// 55a
Cypress.Commands.add('getUnitSchemeAPI', (unitId: string, wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/units/${unitId}/scheme`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});
// 55b
Cypress.Commands.add('updateUnitDefinitionAPI', (unitId: string, wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  // eslint-disable-next-line max-len
  // const definition = '{"type":"aspect-unit-definition","stateVariables":[],"enableSectionNumbering":false,"sectionNumberingPosition":"left","showUnitNavNext":false,"version":"4.9.0","pages":[{"sections":[{"elements":[{"isRelevantForPresentationComplete":true,"id":"text_1743412177740_1","alias":"text_1","position":{"xPosition":0,"yPosition":0,"gridColumn":1,"gridColumnRange":1,"gridRow":1,"gridRowRange":1,"marginLeft":{"value":0,"unit":"px"},"marginRight":{"value":0,"unit":"px"},"marginTop":{"value":0,"unit":"px"},"marginBottom":{"value":10,"unit":"px"},"zIndex":0},"dimensions":{"width":180,"height":98,"isWidthFixed":false,"isHeightFixed":false,"minWidth":null,"maxWidth":null,"minHeight":null,"maxHeight":null},"type":"text","text":"<p style=\"padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\" indentsize=\"20\">Wie viele Monde hat Jupiter?</p>","markingMode":"selection","markingPanels":[],"highlightableOrange":false,"highlightableTurquoise":false,"highlightableYellow":false,"hasSelectionPopup":false,"columnCount":1,"styling":{"backgroundColor":"transparent","fontColor":"#000000","font":"NunitoSans","fontSize":20,"bold":false,"italic":false,"underline":false,"lineHeight":135}},{"isRelevantForPresentationComplete":true,"id":"text-area_1743412202936_1","alias":"text-area_1","position":{"xPosition":0,"yPosition":0,"gridColumn":1,"gridColumnRange":1,"gridRow":2,"gridRowRange":1,"marginLeft":{"value":0,"unit":"px"},"marginRight":{"value":0,"unit":"px"},"marginTop":{"value":0,"unit":"px"},"marginBottom":{"value":0,"unit":"px"},"zIndex":0},"dimensions":{"width":230,"height":132,"isWidthFixed":false,"isHeightFixed":false,"minWidth":null,"maxWidth":null,"minHeight":null,"maxHeight":null},"label":"","value":"Jupiter hat ... Monde.","required":false,"requiredWarnMessage":"Eingabe erforderlich","readOnly":false,"inputAssistancePreset":null,"inputAssistanceCustomKeys":"","inputAssistancePosition":"floating","inputAssistanceFloatingStartPosition":"startBottom","restrictedToInputAssistanceChars":false,"hasArrowKeys":false,"hasBackspaceKey":false,"showSoftwareKeyboard":true,"addInputAssistanceToKeyboard":true,"hideNativeKeyboard":true,"type":"text-area","appearance":"outline","resizeEnabled":false,"hasDynamicRowCount":true,"hasAutoHeight":false,"rowCount":3,"expectedCharactersCount":135,"hasReturnKey":false,"hasKeyboardIcon":false,"styling":{"backgroundColor":"transparent","fontColor":"#000000","font":"NunitoSans","fontSize":20,"bold":false,"italic":false,"underline":false,"lineHeight":135}}],"height":400,"backgroundColor":"#ffffff","dynamicPositioning":true,"autoColumnSize":true,"autoRowSize":true,"gridColumnSizes":[{"value":1,"unit":"fr"}],"gridRowSizes":[{"value":1,"unit":"fr"}],"visibilityDelay":0,"animatedVisibility":false,"enableReHide":false,"logicalConnectiveOfRules":"disjunction","visibilityRules":[],"ignoreNumbering":false}],"hasMaxWidth":true,"maxWidth":750,"margin":30,"backgroundColor":"#ffffff","alwaysVisible":false,"alwaysVisiblePagePosition":"left","alwaysVisibleAspectRatio":50}]}';
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/units/${unitId}/definition`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      definition: {
        type: 'aspect-unit-definition',
        stateVariables: [],
        enableSectionNumbering: true,
        sectionNumberingPosition: 'left',
        showUnitNavNext: false,
        version: '4.9.0',
        pages: [
          {
            sections: [
              {
                elements: [
                  {
                    isRelevantForPresentationComplete: true,
                    id: 'text_1',
                    alias: 'text_1',
                    dimensions: {
                      width: 180,
                      height: 98,
                      isWidthFixed: false,
                      isHeightFixed: false,
                      minWidth: null,
                      maxWidth: null,
                      minHeight: null,
                      maxHeight: null
                    },
                    position: {
                      xPosition: 0,
                      yPosition: 0,
                      gridColumn: 1,
                      gridColumnRange: 1,
                      gridRow: 1,
                      gridRowRange: 1,
                      marginLeft: {
                        value: 0,
                        unit: 'px'
                      },
                      marginRight: {
                        value: 0,
                        unit: 'px'
                      },
                      marginTop: {
                        value: 0,
                        unit: 'px'
                      },
                      marginBottom: {
                        value: 0,
                        unit: 'px'
                      },
                      zIndex: 0
                    },
                    styling: {
                      backgroundColor: 'transparent',
                      fontColor: '#000000',
                      font: 'NunitoSans',
                      fontSize: 20,
                      bold: false,
                      italic: false,
                      underline: false,
                      lineHeight: 135
                    },
                    type: 'text',
                    text: '<p>Wie viele Monde hat Jupiter?</p>',
                    markingMode: 'selection',
                    markingPanels: [],
                    highlightableOrange: false,
                    highlightableTurquoise: false,
                    highlightableYellow: false,
                    hasSelectionPopup: false,
                    columnCount: 1
                  },
                  {
                    isRelevantForPresentationComplete: true,
                    id: 'text-area_1',
                    alias: 'text-area_1',
                    dimensions: {
                      width: 230,
                      height: 132,
                      isWidthFixed: false,
                      isHeightFixed: false,
                      minWidth: null,
                      maxWidth: null,
                      minHeight: null,
                      maxHeight: null
                    },
                    position: {
                      xPosition: 0,
                      yPosition: 0,
                      gridColumn: 1,
                      gridColumnRange: 1,
                      gridRow: 2,
                      gridRowRange: 1,
                      marginLeft: {
                        value: 0,
                        unit: 'px'
                      },
                      marginRight: {
                        value: 0,
                        unit: 'px'
                      },
                      marginTop: {
                        value: 0,
                        unit: 'px'
                      },
                      marginBottom: {
                        value: 0,
                        unit: 'px'
                      },
                      zIndex: 0
                    },
                    styling: {
                      backgroundColor: 'transparent',
                      fontColor: '#000000',
                      font: 'NunitoSans',
                      fontSize: 20,
                      bold: false,
                      italic: false,
                      underline: false,
                      lineHeight: 135
                    },
                    label: '',
                    value: 'Jupiter hat ... Monde',
                    required: false,
                    requiredWarnMessage: 'Eingabe erforderlich',
                    readOnly: false,
                    inputAssistancePreset: null,
                    inputAssistanceCustomKeys: '',
                    inputAssistancePosition: 'floating',
                    inputAssistanceFloatingStartPosition: 'startBottom',
                    restrictedToInputAssistanceChars: false,
                    hasArrowKeys: false,
                    hasBackspaceKey: false,
                    showSoftwareKeyboard: true,
                    addInputAssistanceToKeyboard: true,
                    hideNativeKeyboard: true,
                    type: 'text-area',
                    appearance: 'outline',
                    resizeEnabled: false,
                    hasDynamicRowCount: false,
                    hasAutoHeight: false,
                    rowCount: 3,
                    expectedCharactersCount: 300,
                    hasReturnKey: false,
                    hasKeyboardIcon: false
                  }
                ],
                height: 400,
                backgroundColor: '#ffffff',
                dynamicPositioning: true,
                autoColumnSize: true,
                autoRowSize: true,
                gridColumnSizes: [
                  {
                    value: 1,
                    unit: 'fr'
                  }
                ],
                gridRowSizes: [
                  {
                    value: 1,
                    unit: 'fr'
                  }
                ],
                visibilityDelay: 0,
                animatedVisibility: false,
                enableReHide: false,
                logicalConnectiveOfRules: 'disjunction',
                visibilityRules: [],
                ignoreNumbering: false
              },
              {
                elements: [
                  {
                    isRelevantForPresentationComplete: true,
                    id: 'text_1744012056375_1',
                    alias: 'text_2',
                    position: {
                      xPosition: 0,
                      yPosition: 0,
                      gridColumn: 1,
                      gridColumnRange: 1,
                      gridRow: 1,
                      gridRowRange: 1,
                      marginLeft: {
                        value: 0,
                        unit: 'px'
                      },
                      marginRight: {
                        value: 0,
                        unit: 'px'
                      },
                      marginTop: {
                        value: 0,
                        unit: 'px'
                      },
                      marginBottom: {
                        value: 10,
                        unit: 'px'
                      },
                      zIndex: 0
                    },
                    dimensions: {
                      width: 180,
                      height: 98,
                      isWidthFixed: false,
                      isHeightFixed: false,
                      minWidth: null,
                      maxWidth: null,
                      minHeight: null,
                      maxHeight: null
                    },
                    type: 'text',
                    text: 'Wie viele Trabanten hat Neptuni?',
                    markingMode: 'selection',
                    markingPanels: [],
                    highlightableOrange: false,
                    highlightableTurquoise: false,
                    highlightableYellow: false,
                    hasSelectionPopup: false,
                    columnCount: 1,
                    styling: {
                      backgroundColor: 'transparent',
                      fontColor: '#000000',
                      font: 'NunitoSans',
                      fontSize: 20,
                      bold: false,
                      italic: false,
                      underline: false,
                      lineHeight: 135
                    }
                  },
                  {
                    isRelevantForPresentationComplete: true,
                    id: 'radio_1744012095680_1',
                    alias: 'radio_1',
                    position: {
                      xPosition: 0,
                      yPosition: 0,
                      gridColumn: 1,
                      gridColumnRange: 1,
                      gridRow: 2,
                      gridRowRange: 1,
                      marginLeft: {
                        value: 0,
                        unit: 'px'
                      },
                      marginRight: {
                        value: 0,
                        unit: 'px'
                      },
                      marginTop: {
                        value: 0,
                        unit: 'px'
                      },
                      marginBottom: {
                        value: 0,
                        unit: 'px'
                      },
                      zIndex: 0
                    },
                    dimensions: {
                      width: 180,
                      height: 100,
                      isWidthFixed: false,
                      isHeightFixed: false,
                      minWidth: null,
                      maxWidth: null,
                      minHeight: null,
                      maxHeight: null
                    },
                    label: '',
                    value: null,
                    required: false,
                    requiredWarnMessage: 'Eingabe erforderlich',
                    readOnly: false,
                    type: 'radio',
                    options: [
                      {
                        text: '1 Trabant'
                      },
                      {
                        text: '0 Trabant'
                      },
                      {
                        text: '16 Trabanten'
                      }
                    ],
                    alignment: 'column',
                    strikeOtherOptions: false,
                    styling: {
                      backgroundColor: 'transparent',
                      fontColor: '#000000',
                      font: 'NunitoSans',
                      fontSize: 20,
                      bold: false,
                      italic: false,
                      underline: false,
                      lineHeight: 135
                    }
                  }
                ],
                height: 400,
                backgroundColor: '#ffffff',
                dynamicPositioning: true,
                autoColumnSize: true,
                autoRowSize: true,
                gridColumnSizes: [
                  {
                    value: 1,
                    unit: 'fr'
                  }
                ],
                gridRowSizes: [
                  {
                    value: 1,
                    unit: 'fr'
                  }
                ],
                visibilityDelay: 0,
                animatedVisibility: false,
                enableReHide: false,
                logicalConnectiveOfRules: 'disjunction',
                visibilityRules: [],
                ignoreNumbering: false
              }
            ],
            hasMaxWidth: true,
            maxWidth: 750,
            margin: 30,
            backgroundColor: '#ffffff',
            alwaysVisible: false,
            alwaysVisiblePagePosition: 'left',
            alwaysVisibleAspectRatio: 50
          }
        ]
      },
      variables: [
        {
          alias: 'text_1',
          format: '',
          id: 'text_1',
          multiple: false,
          nullable: false,
          page: '',
          type: 'no-value',
          valuePositionLabels: [],
          values: [],
          valuesComplete: false
        },
        {
          alias: 'text-area_1',
          format: '',
          id: 'text-area_1',
          multiple: false,
          nullable: false,
          page: '',
          type: 'string',
          valuePositionLabels: [],
          values: [],
          valuesComplete: false
        },
        {
          alias: 'text_2',
          format: '',
          id: 'text_1744012056375_1',
          multiple: false,
          nullable: false,
          page: '',
          type: 'no-value',
          valuePositionLabels: [],
          values: [],
          valuesComplete: false
        },
        {
          alias: 'radio_1',
          format: '',
          id: 'radio_1744012095680_1',
          multiple: false,
          nullable: false,
          page: '',
          type: 'integer',
          valuePositionLabels: [],
          values: [
            {
              label: '1 Trabant',
              value: '1'
            },
            {
              label: '0 Trabant',
              value: '2'
            },
            {
              label: '16 Trabanten',
              value: '3'
            }
          ],
          valuesComplete: true
        }
      ]
    },
    failOnStatusCode: false
  });
});
// 55c
Cypress.Commands.add('getUnitDefinitionAPI', (unitId: string, wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/units/${unitId}/definition`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});
// 55d
Cypress.Commands.add('updateUnitSchemeAPI', (unitId: string, wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  // eslint-disable-next-line max-len
  // const scheme1:string = '{"variableCodings":[{"id":"text-area_1","alias":"text-area_1","label":"","sourceType":"BASE","sourceParameters":{"solverExpression":"","processing":[]},"deriveSources":[],"processing":[],"fragmenting":"","manualInstruction":"","codeModel":"NONE","codes":[{"id":1,"type":"FULL_CREDIT","label":"","score":1,"ruleSetOperatorAnd":false,"ruleSets":[{"ruleOperatorAnd":true,"rules":[{"method":"MATCH","parameters":["Jupiter hat 92 Monde."]}]}],"manualInstruction":""},{"id":0,"type":"RESIDUAL","label":"","score":0,"ruleSetOperatorAnd":false,"ruleSets":[],"manualInstruction":"<p>\\n Alle anderen Antworten \\n </p>"}]}],"version":"3.0"}';
  // eslint-disable-next-line max-len
  const scheme1:string = '{"variableCodings":[{"id":"text-area_1","alias":"text-area_1","label":"","sourceType":"BASE","sourceParameters":{"solverExpression":"","processing":[]},"deriveSources":[],"processing":[],"fragmenting":"","manualInstruction":"","codeModel":"NONE","codes":[{"id":1,"type":"FULL_CREDIT","label":"","score":1,"ruleSetOperatorAnd":false,"ruleSets":[{"ruleOperatorAnd":true,"rules":[{"method":"MATCH","parameters":["Jupiter hat 92 Monde."]}]}],"manualInstruction":""},{"id":0,"type":"RESIDUAL","label":"","score":0,"ruleSetOperatorAnd":false,"ruleSets":[],"manualInstruction":"<p>\\n Alle anderen Antworten \\n </p>"}]},{"id":"text_1","alias":"text_1","label":"","sourceType":"BASE_NO_VALUE","sourceParameters":{"solverExpression":"","processing":[]},"deriveSources":[],"processing":[],"fragmenting":"","manualInstruction":"","codeModel":"NONE","codes":[]},{"id":"text_1744012056375_1","alias":"text_2","label":"","sourceType":"BASE_NO_VALUE","sourceParameters":{"solverExpression":"","processing":[]},"deriveSources":[],"processing":[],"fragmenting":"","manualInstruction":"","codeModel":"NONE","codes":[]},{"id":"radio_1744012095680_1","alias":"radio_1","label":"","sourceType":"BASE","sourceParameters":{"solverExpression":"","processing":[]},"deriveSources":[],"processing":[],"fragmenting":"","manualInstruction":"","codeModel":"NONE","codes":[{"id":1,"type":"FULL_CREDIT","label":"","score":1,"ruleSetOperatorAnd":true,"ruleSets":[{"ruleOperatorAnd":false,"rules":[{"method":"MATCH","parameters":["3"]}]}],"manualInstruction":""},{"id":0,"type":"RESIDUAL_AUTO","label":"","score":0,"ruleSetOperatorAnd":true,"ruleSets":[],"manualInstruction":""}]}],"version":"3.0"}';
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/units/${unitId}/scheme`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      scheme: scheme1,
      schemeType: 'iqb@3.0'
    },
    failOnStatusCode: false
  });
});

// 55e
Cypress.Commands.add('getWsMetadataAPI', (wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/units/properties`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 55f
Cypress.Commands.add('getWsSchemeAPI', (wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/units/scheme`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 55g
Cypress.Commands.add('getWsCodingBookAPI', (ids: string[], wsId: string, token:string) => {
  const authorization = `bearer ${token}`;
  const parameters = ['format', 'missingsProfile', 'generalInstructions',
    'onlyManual', 'closed', 'derived', 'showScore', 'codeLabelToUpper', 'hideItemVarRelation', 'hasOnlyVarsWithCodes'];
  const values = ['docx', true, true, true,
    true, true, true, true, true, true, true];
  const qp = buildQueryParametersComplex(parameters, values, ids);
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/units/coding-book${qp}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 58
Cypress.Commands.add('updateGroupPropertiesAPI', (groupId: string, token:string) => {
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
          }],
        states: [
          {
            id: 1,
            color: '#a51d2d',
            label: 'Initial'
          },
          {
            id: 2,
            color: '#edb211',
            label: 'Finale'
          }]
      }
    },
    failOnStatusCode: false
  });
});

// 58a
Cypress.Commands.add('getGroupPropertiesAPI', (groupId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspace-groups/${groupId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 59
Cypress.Commands.add('updateUnitStateAPI', (wsId: string, unitId: string, state: string, token:string) => {
  const authorization = `bearer ${token}`;
  const nu = parseInt(`${unitId}`, 10);
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/units/${unitId}/properties`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      id: nu,
      state: `${state}`
    },
    failOnStatusCode: false
  });
});

// 61
Cypress.Commands.add('getUnitMetadataAPI', (wsId: string, unitId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/units/${unitId}/metadata`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 62
Cypress.Commands.add('dropboxWsAPI', (wsId: string, wsDe: string, token:string) => {
  const authorization = `bearer ${token}`;
  const nu = parseInt(`${wsDe}`, 10);
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/drop-box`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      dropBoxId: nu
    },
    failOnStatusCode: false
  });
});

// 63
Cypress.Commands.add('submitUnitsAPI', (wsId: string, wsDe: string, unit:string, token:string) => {
  const authorization = `bearer ${token}`;
  const nu = parseInt(`${wsDe}`, 10);
  const unitNumber = parseInt(`${unit}`, 10);
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/units/drop-box-history`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      ids: [unitNumber],
      ...(wsDe !== '' ? { targetId: nu } : {})
    },
    failOnStatusCode: false
  });
});

// 65
Cypress.Commands.add('postCommentAPI', (wsId: string, unitId: string, comment: CommentData, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'POST',
    url: `/api/workspaces/${wsId}/units/${unitId}/comments`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      body: `${comment.body}`,
      userName: `${comment.userName}`,
      userId: `${comment.userId}`,
      unitId: `${comment.unitId}`
    },
    failOnStatusCode: false
  });
});

// 66
Cypress.Commands.add('getCommentsAPI', (wsId: string, unitId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/units/${unitId}/comments`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 67
Cypress.Commands.add('updateCommentTimeAPI', (wsId: string, unitId: string, comment: CommentData, token:string) => {
  const authorization = `bearer ${token}`;
  const now = new Date();
  const nu = parseInt(`${comment.userId}`, 10);
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/units/${unitId}/comments/`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      userId: nu,
      lastSeenCommentChangedAt: now
    },
    failOnStatusCode: false
  });
});

// 67a
Cypress.Commands.add('getCommentTimeAPI', (wsId: string, unitId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/units/${unitId}/comments/last-seen`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 68
Cypress.Commands.add('updateCommentAPI',
  (wsId: string, unitId: string, commentId:string, comment: CommentData, token:string) => {
    const authorization = `bearer ${token}`;
    const nu = parseInt(`${comment.userId}`, 10);
    cy.request({
      method: 'PATCH',
      url: `/api/workspaces/${wsId}/units/${unitId}/comments/${commentId}`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: {
        body: `${comment.body}`,
        userId: nu
      },
      failOnStatusCode: false
    });
  });

// 69
Cypress.Commands.add('deleteCommentAPI',
  (wsId: string, unitId: string, commentId:string, token:string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'DELETE',
      url: `/api/workspaces/${wsId}/units/${unitId}/comments/${commentId}`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      failOnStatusCode: false
    });
  });

// 70
Cypress.Commands.add('addReviewAPI', (wsId:string, reviewName: string, token:string) => {
  const authorization = `bearer ${token}`;
  const nu = parseInt(`${wsId}`, 10);
  cy.request({
    method: 'POST',
    url: `/api/workspaces/${wsId}/reviews/`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      name: `${reviewName}`,
      workspaceId: nu
    },
    failOnStatusCode: false
  });
});

// 71
Cypress.Commands.add('getReviewAPI', (wsId:string, reviewId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/reviews/${reviewId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 72
Cypress.Commands.add('updateReviewAPI', (wsId:string, review: ReviewData, token:string) => {
  const authorization = `bearer ${token}`;
  const nu = parseInt(`${review.id}`, 10);
  if (review.units) {
    cy.request({
      method: 'PATCH',
      url: `/api/workspaces/${wsId}/reviews/${review.id}`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: {
        id: nu,
        link: review.link,
        name: review.name,
        settings: {
          reviewConfig: {
            canComment: true,
            showCoding: true,
            showMetadata: true,
            showOthersComments: true
          }
        },
        units: [review.units[0]]
      },
      failOnStatusCode: false
    });
  }
});

// 73
Cypress.Commands.add('getAllReviewAPI', (wsId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/reviews`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 74
Cypress.Commands.add('getReviewWindowAPI', (reviewId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `api/reviews/${reviewId}/`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 75
Cypress.Commands.add('getReviewPropertiesAPI', (reviewId:string, unitId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/reviews/${reviewId}/units/${unitId}/properties`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 76
Cypress.Commands.add('getReviewDefinitionAPI', (reviewId:string, unitId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/reviews/${reviewId}/units/${unitId}/definition`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 77
Cypress.Commands.add('getReviewSchemeAPI', (reviewId:string, unitId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/reviews/${reviewId}/units/${unitId}/scheme`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 78
Cypress.Commands.add('createCommentReviewAPI', (reviewId:string, unitId: string, cd: CommentData, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'POST',
    url: `/api/reviews/${reviewId}/units/${unitId}/comments`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      body: cd.body,
      parentId: cd.parentId,
      unitId: cd.unitId,
      userId: cd.userId,
      userName: cd.userName
    },
    failOnStatusCode: false
  });
});

// 79
Cypress.Commands.add('getCommentReviewAPI', (reviewId:string, unitId: string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/reviews/${reviewId}/units/${unitId}/comments`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 80
Cypress.Commands.add('updateCommentReviewAPI',
  (reviewId:string, unitId: string, commentId: string, c:CommentData, token:string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'PATCH',
      url: `/api/reviews/${reviewId}/units/${unitId}/comments/${commentId}`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      body: {
        body: c.body,
        userId: c.userId
      },
      failOnStatusCode: false
    });
  });

// 80A
Cypress.Commands.add('deleteCommentReviewAPI',
  (reviewId:string, unitId: string, commentId: string, token:string) => {
    const authorization = `bearer ${token}`;
    cy.request({
      method: 'DELETE',
      url: `/api/reviews/${reviewId}/units/${unitId}/comments/${commentId}`,
      headers: {
        'app-version': Cypress.env('version'),
        authorization
      },
      failOnStatusCode: false
    });
  });

// 81
Cypress.Commands.add('deleteReviewAPI', (wsId:string, reviewId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'DELETE',
    url: `/api/workspaces/${wsId}/reviews/${reviewId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 82
Cypress.Commands.add('getWsForUserAPI', (wsId:string, userId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/workspaces/${wsId}/users/${userId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 83
Cypress.Commands.add('deleteUnitsAPI', (ids:string[], wsId:string, token: string) => {
  const authorization = `bearer ${token}`;
  const qp = buildQueryParameters('id', ids);
  cy.request({
    method: 'DELETE',
    url: `/api/workspaces/${wsId}/units${qp}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 84
Cypress.Commands.add('getMyData', (token: string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/my-data',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 85
Cypress.Commands.add('updateMyData', (token: string, data: MyData) => {
  const authorization = `bearer ${token}`;
  const nu = parseInt(data.id, 10);
  cy.request({
    method: 'PATCH',
    url: '/api/my-data',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      id: nu,
      description: `${data.description}`,
      email: `${data.email}`,
      lastName: `${data.lastName}`,
      firstName: `${data.firstName}`,
      emailPublishApproved: false
    },
    failOnStatusCode: false
  });
});

// 86
Cypress.Commands.add('getWsByUserAPI', (userId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/group-admin/users/${userId}/workspaces`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 86a
Cypress.Commands.add('updateWsByUserAPI', (userId:string, groupId: string, wsIds:string[], token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/group-admin/users/${userId}/workspaces`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      groupId: parseInt(groupId, 10),
      workspaces: [
        {
          accessLevel: 2,
          id: wsIds[0]
        }
      ]
    },
    failOnStatusCode: false
  });
});

// 87
Cypress.Commands.add('getGroupsByUserAPI', (userId:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: `/api/admin/users/${userId}/workspace-groups`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 87a
Cypress.Commands.add('updateGroupsByUserAPI', (userId:string, groupIds: string[], token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: `/api/admin/users/${userId}/workspace-groups`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      ids: groupIds
    },
    failOnStatusCode: false
  });
});

// 88
Cypress.Commands.add('deleteWsAPI', (qs:string[], token:string) => {
  const authorization = `bearer ${token}`;
  const qp = buildQueryParameters('id', qs);
  cy.request({
    method: 'DELETE',
    url: `/api/group-admin/workspaces${qp}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 89
Cypress.Commands.add('deleteGroupsAPI', (qs: string[], token:string) => {
  const authorization = `bearer ${token}`;
  const qp = buildQueryParameters('id', qs);
  cy.request({
    method: 'DELETE',
    url: `/api/admin/workspace-groups${qp}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 90
Cypress.Commands.add('deleteModulesAPI', (modules:string[], token:string) => {
  const authorization = `bearer ${token}`;
  const qp = buildQueryParameters('key', modules);
  cy.request({
    method: 'DELETE',
    url: `/api/admin/verona-modules${qp}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 91 we keep the command deleteUserAPI and deleteUsersAPI to see the actual way to work with query Parameter
Cypress.Commands.add('deleteUserAPI', (id: string, token: string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'DELETE',
    url: '/api/admin/users/',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    qs: {
      id: `${id}`
    },
    failOnStatusCode: false
  });
});

Cypress.Commands.add('deleteUsersAPI', (ids: string[], token: string) => {
  const authorization = `bearer ${token}`;
  const qp = buildQueryParameters('id', ids);
  cy.request({
    method: 'DELETE',
    url: `/api/admin/users${qp}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 100
Cypress.Commands.add('getSettingConfigAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/admin/settings/config',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 101
Cypress.Commands.add('updateSettingConfigAPI', (token:string, hour:number) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: '/api/admin/settings/config',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      appTitle: 'IQB-Studio',
      globalWarningText: 'Warnung Achtung 2',
      globalWarningExpiredHour: `${hour}`,
      globalWarningExpiredDay: new Date(),
      hasUsers: true
    },
    failOnStatusCode: false
  });
});

// 102
Cypress.Commands.add('getSettingLogoAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/admin/settings/app-logo',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 103
Cypress.Commands.add('updateSettingLogoAPI', (token:string, color: string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: '/api/admin/settings/app-logo',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      data: '',
      alt: '',
      bodyBackground: `${color}`,
      boxBackground: ''
    },
    failOnStatusCode: false
  });
});

// 104
Cypress.Commands.add('getSettingUnitExportAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/admin/settings/unit-export-config',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 105
Cypress.Commands.add('updateSettingUnitExportAPI', (token:string, unitExport: UnitExport) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: '/api/admin/settings/unit-export-config',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: {
      unitXsdUrl: `${unitExport.unitXsdUrl}`,
      bookletXsdUrl: `${unitExport.bookletXsdUrl}`,
      testTakersXsdUrl: `${unitExport.testTakersXsdUrl}`
    },
    failOnStatusCode: false
  });
});

// 106
Cypress.Commands.add('getSettingMissingProfilesAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/admin/settings/missings-profiles',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 107
Cypress.Commands.add('updateSettingMissingProfilesAPI', (token:string, profile:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'PATCH',
    url: '/api/admin/settings/missings-profiles',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    body: [{
      label: 'IQB-Standard',
      missings: profile
    }],
    failOnStatusCode: false
  });
});
// 108
Cypress.Commands.add('addPackageAPI', (resource:string, token:string) => {
  const authorization = `bearer ${token}`;
  cy.fixture(resource, 'binary')
    .then(fileContent => {
      const formData = new FormData();
      formData.append('file', new Blob([fileContent], { type: 'zip' }), resource);
      cy.request({
        method: 'POST',
        url: '/api/admin/resource-packages',
        headers: {
          'app-version': Cypress.env('version'),
          'Content-Type': 'multipart/form-data',
          authorization
        },
        body: formData,
        failOnStatusCode: false
      });
    });
});
// 109
Cypress.Commands.add('getPackageAPI', (token:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'GET',
    url: '/api/resource-packages',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 110
Cypress.Commands.add('deletePackageAPI', (token:string, packageId:string) => {
  const authorization = `bearer ${token}`;
  cy.request({
    method: 'DELETE',
    url: `/api/admin/resource-packages?id=${packageId}`,
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    failOnStatusCode: false
  });
});

// 111
Cypress.Commands.add('deleteFirstUserAPI', () => {
  const authorization = `bearer ${Cypress.env(`token_${Cypress.env('username')}`)}`;
  cy.request({
    method: 'DELETE',
    url: '/api/admin/users/',
    headers: {
      'app-version': Cypress.env('version'),
      authorization
    },
    qs: {
      id: `${Cypress.env(`id_${Cypress.env('username')}`)}`
    },
    failOnStatusCode: false
  });
});

// not used
Cypress.Commands.add('uploadUnitsAPI', (wsId: string, filename:string, token:string) => {
  const authorization = `bearer ${token}`;
  // const path:string = `../frontend-e2e/src/fixtures/${filename}`;
  // cy.request({
  //   method: 'POST',
  //   url: `/api/workspaces/${wsId}/upload`,
  //   headers: {
  //     'app-version': Cypress.env('version'),
  //     authorization
  //   },
  //   failOnStatusCode: false
  // }).selectFile(
  //   path, {
  //     action: 'select',
  //     force: true
  //   });
  cy.fixture(filename).then(file => {
    cy.request({
      method: 'POST',
      url: `/api/workspaces/${wsId}`,
      headers: {
        'app-version': Cypress.env('version'),
        'content-type': 'binary',
        authorization
      },
      body: file
    }).then(resp => {
      expect(resp.status).to.equal(204);
    });
  });
});

// 400 Bad Request
// 401 Unauthorized
// 403 Forbidden
// 404 Not found
// 405 Method not allowed
// 406 Not acceptable
// 408 Request Timeout
// 429 Too Many Requests
// 500 Internal Server Error
// 502: Bad Gateway
// 504: Gateway timeout
