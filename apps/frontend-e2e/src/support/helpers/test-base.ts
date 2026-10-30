/**
 * The test base of the workspace specs, built through the API: the first user, a standard user,
 * a group with two workspaces both of them work in, and the Verona modules. The interface steps
 * this replaces are checked once in the admin and group-admin specs (#1967).
 */

import type { RequestReportDto, VeronaModuleInListDto } from '@studio-lite-lib/api-dto';
import {
  AccessLevel,
  baseGroup,
  modules,
  primaryWorkspace,
  secondaryWorkspace,
  standardUser,
  UnitData
} from '../testData';
import { showLoginFormAfterUserDeleted } from './admin';
import { login } from './user';

const admin = () => ({ username: Cypress.expose('username'), password: Cypress.expose('password') });

/** What a spec needs to reach the base through the API or by its URL */
export interface TestBase {
  /** of the first user, for the API: a session of its own, not the one the browser logs in with */
  token: string;
  /** of the first user */
  userId: string;
  /** of the primary workspace */
  wsId: string;
  /** of the units given to createTestBaseAPI, in their order */
  unitIds: string[];
}

/**
 * Imports a zip of units from the fixtures and fails unless all its files were taken: rejected
 * ones are reported in the answer, which is 201 all the same.
 * @example
 * importZipAPI(wsId, 'test_studio_units_download.zip', token);
 */
export function importZipAPI(wsId: string, zip: string, token: string): void {
  cy.fixture(zip, 'binary')
    .then(content => cy.importUnitsAPI(wsId, content, token))
    .then(upload => {
      expect(upload.status, zip).to.equal(201);
      expect((upload.body as RequestReportDto).messages, `problems importing ${zip}`).to.deep.equal([]);
    });
}

/**
 * Builds the base and logs the browser in as the first user. Needs an empty database: the first
 * user can only be created while there is none.
 * @param zip - a zip of units in the fixtures, imported into the primary workspace
 * @param units - empty units created in the primary workspace, without editor, player or schemer
 * @example
 * createTestBaseAPI({ zip: 'test_studio_units_download.zip', units: [unitCrudUnits.crud1] });
 * createTestBaseAPI({ units: [unit] }).then(base => cy.visit(`/#/a/${base.wsId}/${base.unitIds[0]}`));
 */
export function createTestBaseAPI(
  { zip, units = [] }: { zip?: string; units?: UnitData[] } = {}
): Cypress.Chainable<TestBase> {
  const { username, password } = admin();
  const base: TestBase = {
    token: '', userId: '', wsId: '', unitIds: []
  };
  cy.addFirstUserAPI(username, password).then(init => {
    expect(init.status, 'first user').to.equal(201);
    const token: string = init.body.accessToken;
    base.token = token;
    cy.getUserIdAPI(token).then(authData => {
      expect(authData.status, 'id of the first user').to.equal(200);
      const firstUserId = String(authData.body.userId);
      base.userId = firstUserId;
      cy.createUserAPI(standardUser, token).then(user => {
        expect(user.status, standardUser.username).to.equal(201);
        const standardUserId = String(user.body);
        cy.createGroupAPI({ id: '', name: baseGroup }, token).then(group => {
          expect(group.status, baseGroup).to.equal(201);
          [primaryWorkspace, secondaryWorkspace].forEach(name => {
            cy.createWsAPI(String(group.body), { id: '', name }, token).then(ws => {
              expect(ws.status, name).to.equal(201);
              cy.setUsersOfWsAPI(String(ws.body), [
                { id: firstUserId, access: AccessLevel.Admin },
                { id: standardUserId, access: AccessLevel.Developer }
              ], token).its('status').should('equal', 200);
              if (name !== primaryWorkspace) return;
              base.wsId = String(ws.body);
              if (zip) importZipAPI(base.wsId, zip, token);
              units.forEach(unit => {
                cy.createUnitAPI(base.wsId, unit, token).then(created => {
                  expect(created.status, unit.shortname).to.equal(201);
                  base.unitIds.push(String(created.body));
                });
              });
            });
          });
        });
      });
    });
    modules.forEach(module => {
      cy.addModuleAPI(module, token).its('status').should('equal', 201);
    });
  });
  login(username, password);
  return cy.then(() => base);
}

/**
 * Removes the base again and leaves the browser logged out on the login form, so that the next
 * spec can build its own: no user, group, workspace or module is left, while the app settings and
 * the metadata profiles stay as the spec left them.
 */
export function deleteTestBaseAPI(): void {
  const { username, password } = admin();
  // a setup that failed before its login left the browser outside the app, which the reload at
  // the end would not bring back; visited while the user still exists, the app does not run
  // with a deleted one
  cy.visit('/');
  cy.loginAPI(username, password).then(session => {
    expect(session.status, 'login for the teardown').to.equal(201);
    const token: string = session.body.accessToken;
    // its own modules and any other a spec installed, as the reset does not take them
    cy.getModulesAPI(token).then(installed => {
      expect(installed.status, 'modules').to.equal(200);
      const keys = (installed.body as VeronaModuleInListDto[]).map(module => module.key);
      if (keys.length) cy.deleteModulesAPI(keys, token).its('status').should('equal', 200);
    });
  });
  // the first user cannot delete their own account (#1949), so the database is reset, which
  // takes every user and group with it, and the workspaces, units and reviews in them
  cy.resetDb();
  showLoginFormAfterUserDeleted();
}
