import {
  baseGroup, primaryWorkspace, secondaryWorkspace, standardUser, UnitData, UserData
} from '../../../support/testData';
import { clickIndexTabWsgAdmin } from '../../../support/helpers';
import { createTestBaseAPI, deleteTestBaseAPI } from '../../../support/helpers/test-base';

// Lists stand in dictionary order: upper and lower case alike, umlauts with their base letters,
// digits read as numbers (#1872). Some are sorted by the API and some by the browser, and a table of
// the group admin shows the API's order until a header is clicked -- the rows must not move on that
// click. Whether the two agree, only the running pair shows.
describe('The order of lists', () => {
  // as the unit list shows them: group by group, the units of each by key
  const unitsByGroup: [string, string[]][] = [
    ['Gruppe 2', ['Unit2', 'Unit10']],
    ['Gruppe 10', ['MA_1', 'MA-1', 'MA1']],
    ['lesen', ['Aa01', 'ab02']],
    ['Ökologie', ['aa02']],
    ['Zusatz', ['Ab01']]
  ];
  const keysInOrder = ['Aa01', 'aa02', 'Ab01', 'ab02', 'MA_1', 'MA-1', 'MA1', 'Unit2', 'Unit10'];
  const furtherWorkspaces = ['Zebra', 'klasse 10', 'ärger', 'Klasse 9'];
  const workspacesInOrder = ['ärger', secondaryWorkspace, primaryWorkspace, 'Klasse 9', 'klasse 10', 'Zebra'];
  // Listed under their names, which begin differently than their login names (#2145). The two users
  // of the base have no names and are listed under their login names.
  const namedUsers: UserData[] = [
    {
      username: 'anna', password: '4455', lastName: 'Zimmer', firstName: 'Anna'
    },
    {
      username: 'zoe', password: '4455', lastName: 'Abel', firstName: 'Zoe'
    }
  ];

  const expectTexts = (selector: string, texts: string[]) => {
    cy.get(selector).should(elements => {
      expect([...elements].map(element => element.textContent?.trim())).to.deep.equal(texts);
    });
  };

  const openGroupAdminTab = (tab: string) => {
    cy.findAdminGroupSettings(baseGroup).click();
    clickIndexTabWsgAdmin(tab);
  };

  before(() => {
    const units: UnitData[] = unitsByGroup
      .flatMap(([group, keys]) => keys.map(key => ({ shortname: key, name: key, group })));
    // created in another order than they are to be listed in
    createTestBaseAPI({ units: units.reverse() }).then(({ token }) => {
      cy.getWsGroupsAPI(token).then(groups => {
        expect(groups.status, 'groups').to.equal(200);
        const group = (groups.body as { id: number; name: string }[]).find(({ name }) => name === baseGroup);
        furtherWorkspaces.forEach(name => {
          cy.createWsAPI(String(group?.id), { id: '', name }, token).its('status').should('equal', 201);
        });
      });
      namedUsers.forEach(user => {
        cy.createUserAPI(user, token).its('status').should('equal', 201);
      });
    });
  });

  after(() => {
    deleteTestBaseAPI();
  });

  it('lists the unit groups and the units of each in dictionary order', () => {
    cy.visitWs(primaryWorkspace);

    expectTexts('[data-cy="unit-group-name"] .title', unitsByGroup.map(([group]) => group));
    expectTexts('.unit-key', unitsByGroup.flatMap(([, keys]) => keys));
  });

  it('leaves the workspaces of a group as they were loaded when they are sorted by name', () => {
    openGroupAdminTab('workspaces');
    expectTexts('mat-cell.mat-column-name', workspacesInOrder);

    cy.get('mat-header-cell.mat-column-name').click();

    cy.get('mat-header-cell.mat-column-name').should('have.attr', 'aria-sort', 'ascending');
    expectTexts('mat-cell.mat-column-name', workspacesInOrder);
  });

  it('leaves the units of a group as they were loaded when they are sorted by key', () => {
    openGroupAdminTab('units');
    expectTexts('td.mat-column-key', keysInOrder);

    cy.get('th.mat-column-key').click();

    cy.get('th.mat-column-key').should('have.attr', 'aria-sort', 'ascending');
    expectTexts('td.mat-column-key', keysInOrder);
  });

  it('sorts the users of a group by the name their row shows', () => {
    openGroupAdminTab('users');

    cy.get('mat-header-cell.mat-column-displayName').click();

    cy.get('mat-header-cell.mat-column-displayName').should('have.attr', 'aria-sort', 'ascending');
    expectTexts(
      'mat-cell.mat-column-displayName',
      ['Abel, Zoe', Cypress.expose('username'), standardUser.username, 'Zimmer, Anna']
    );
  });

  it('lists the users without access to a workspace by the name their row shows', () => {
    openGroupAdminTab('workspaces');

    cy.contains('mat-row', primaryWorkspace).click();

    // in front the two users of the base, who work in the workspace
    expectTexts('[data-cy="access-rights"]', [
      `${Cypress.expose('username')} (${Cypress.expose('username')})`,
      `${standardUser.username} (${standardUser.username})`,
      'Abel, Zoe (zoe)',
      'Zimmer, Anna (anna)'
    ]);
  });
});
