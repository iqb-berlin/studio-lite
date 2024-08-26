import {
  AccessLevel, GroupData, UnitData, WsData
} from '../../support/testData';

describe('API unit tests', () => {
  const group1: GroupData = {
    id: 'id_group1',
    name: 'VERA2022'
  };
  const group2: GroupData = {
    id: 'id_group2',
    name: 'GROUP2022'
  };
  const ws1: WsData = {
    id: 'id_ws1',
    name: '01Vorlage'
  };
  const ws2: WsData = {
    id: 'id_ws2',
    name: '02Vorlage'
  };
  const unit1: UnitData = {
    shortname: 'D01',
    name: 'Maus',
    group: ''
  };
  const unit2: UnitData = {
    shortname: 'D02',
    name: 'Hund',
    group: ''
  };
  before(() => {

  });
  // 32
  // after(() => {
  //   deleteGroupAPI(Cypress.env(group1.id));
  //   deleteFirstUserAPI();
  // });

  before('O. Init all', () => {
    cy.intercept('POST', '/api/init-login', req => {
      Cypress.env(`token_${Cypress.env('username')}`, req.body);
      req.reply({
        statusCode: 201,
        headers: {
          'app-version': Cypress.env('version')
        },
        body: {
          username: Cypress.env('username'),
          password: Cypress.env('password')
        }
      });
    })
      .as('addFirstUserUnit');
    const authorization = `bearer token_${Cypress.env('username')}`;
    cy.intercept('GET', '/api/auth-data', req => {
      Cypress.env(`id_${Cypress.env('username')}`, req.body.userId);
      req.reply({
        statusCode: 200,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      });
    })
      .as('getUserIdUnit');
    cy.intercept('POST', '/api/admin/workspace-groups', req => {
      Cypress.env(group1.id, req.body);
      req.reply({
        statusCode: 201,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          name: `${group1.name}`,
          setting: {}
        }
      });
    })
      .as('createGroupUnit1');
    cy.intercept('POST', '/api/admin/workspace-groups', req => {
      Cypress.env(group2.id, req.body);
      req.reply({
        statusCode: 201,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          name: `${group2.name}`,
          setting: {}
        }
      });
    })
      .as('createGroupUnit2');

    // setAdminOfGroupAPI(Cypress.env('id_admin'), Cypress.env(group1.id));
    cy.intercept('PATCH', `/api/admin/workspace-groups/${group1.id}/admins`, req => {
      Cypress.env(ws1.id, req.body);
      req.reply({
        statusCode: 200,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: [
          `${Cypress.env('id_admin')}`
        ]
      });
    })
      .as('setAdminOfGroupUnit');

    cy.intercept('POST', `/api/admin/workspaces/${group1.id}`, req => {
      Cypress.env(ws1.id, req.body);
      req.reply({
        statusCode: 201,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          groupId: `${group1.id}`,
          name: `${ws1.name}`
        }
      });
    })
      .as('createWsUnit');
    // 36 set the profiles on cypress
    cy.intercept('PATCH', '/api/metadata-profile/registry', req => {
      const profile1 = req.body[0].url.replace('profile-config.json', '') +
        req.body[0].profiles[0];
      const profile2 = req.body[0].url.replace('profile-config.json', '') +
        req.body[0].profiles[1];
      Cypress.env('profile1', profile1);
      Cypress.env('profile2', profile2);
      req.reply({
        statusCode: 200,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          id: `${Cypress.env(group1.id)}`,
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
        }
      });
    });
    // 37 set a profile for a specific group
    cy.intercept('PATCH', `/api/workspace-groups/${Cypress.env('id_group1')}`, req => {
      req.reply({
        statusCode: 200,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          id: `${Cypress.env('id_group1')}`,
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
        }
      });
    })
      .as('setProfileInGroup');

    cy.intercept('PATCH', `/api/admin/workspaces/${ws1.id}/users`, req => {
      Cypress.env(ws1.id, req.body);
      req.reply({
        statusCode: 200,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: [
          {
            accessLevel: `${AccessLevel.Admin}`,
            id: Cypress.env('id_admin')
          }
        ]
      });
    })
      .as('updateUsersOfWsUnit');

    cy.intercept('POST', `/api/workspace/${ws2.id}/units`, req => {
      Cypress.env(unit2.shortname, req.body);
      req.reply({
        statusCode: 201,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          key: `${unit2.shortname}`,
          name: `${unit2.name}`
        }
      });
    })
      .as('createUnit2');

    cy.intercept('POST', `/api/workspace/${ws2.id}/units`, req => {
      Cypress.env(unit2.shortname, req.body);
      req.reply({
        statusCode: 201,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          key: `${unit2.shortname}`,
          name: `${unit2.name}`
        }
      });
    })
      .as('createUnit2');
  });

  // 32
  it('1. Create a Unit POST /api/workspace/id_workspace/units`', () => {
    const authorization = `bearer token_${Cypress.env('username')}`;
    cy.intercept('POST', `/api/workspace/${ws1.id}/units`, req => {
      Cypress.env(unit1.shortname, req.body);
      req.reply({
        statusCode: 201,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          key: `${unit1.shortname}`,
          name: `${unit1.name}`
        }
      });
    })
      .as('createUnit1');
  });

  // 41
  it('2. Set the metadata for a group PATCH /api/workspace/id_workspace/settings', () => {
    const authorization = `bearer token_${Cypress.env('username')}`;
    cy.intercept('PATCH', `/api/workspace/${ws1.id}/settings`, req => {
      Cypress.env(unit1.shortname, req.body);
      req.reply({
        statusCode: 200,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          itemMDProfile: `${Cypress.env('profile2')}`,
          unitMDProfile: `${Cypress.env('profile1')}`
        }
      });
    })
      .as('settingsWsMetadata');
  });

  // 42
  it('3. Set the metadata for a group PATCH /api/workspace/id_workspace', () => {
    const authorization = `bearer token_${Cypress.env('username')}`;
    cy.intercept('GET', `/api/workspace/${ws1.id}`, req => {
      cy.log(req.body.settings.itemMDProfile);
      req.reply({
        statusCode: 200,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        }
      });
    })
      .as('getWsMetadata');
  });

  // 41
  it('4. Set the metadata for a group PATCH /api/workspace/id_workspace/settings', () => {
    const authorization = `bearer token_${Cypress.env('username')}`;
    cy.intercept('POST', `/api/workspace/${ws1.id}/settings`, req => {
      Cypress.env(unit1.shortname, req.body);
      req.reply({
        statusCode: 200,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          itemMDProfile: `${Cypress.env('profile2')}`,
          unitMDProfile: `${Cypress.env('profile1')}`
        }
      });
    })
      .as('settingsWsMetadata');
  });

  // 41
  it('5. Set the metadata for a group PATCH /api/workspace/id_workspace/settings', () => {
    const authorization = `bearer token_${Cypress.env('username')}`;
    cy.intercept('POST', `/api/workspace/${ws1.id}/settings`, req => {
      Cypress.env(unit1.shortname, req.body);
      req.reply({
        statusCode: 200,
        headers: {
          'app-version': Cypress.env('version'),
          authorization
        },
        body: {
          itemMDProfile: `${Cypress.env('profile2')}`,
          unitMDProfile: `${Cypress.env('profile1')}`
        }
      });
    })
      .as('settingsWsMetadata');
  });
});
