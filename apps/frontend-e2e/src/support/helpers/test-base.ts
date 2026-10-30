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
 */
export function createTestBaseAPI({ zip, units = [] }: { zip?: string; units?: UnitData[] } = {}): void {
  const { username, password } = admin();
  cy.addFirstUserAPI(username, password).then(init => {
    expect(init.status, 'first user').to.equal(201);
    const token: string = init.body.accessToken;
    cy.getUserIdAPI(token).then(authData => {
      expect(authData.status, 'id of the first user').to.equal(200);
      const firstUserId = String(authData.body.userId);
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
              if (zip) importZipAPI(String(ws.body), zip, token);
              units.forEach(unit => {
                cy.createUnitAPI(String(ws.body), unit, token).its('status').should('equal', 201);
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
}

/**
 * Removes the base again and leaves the browser logged out on the login form, so that the next
 * spec finds an empty database. The first user cannot delete their own account (#1949), so the
 * database is reset, which takes the users and the group with it; the modules are not part of
 * that and are deleted first, its own and any other a spec installed.
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
    cy.getModulesAPI(token).then(installed => {
      expect(installed.status, 'modules').to.equal(200);
      const keys = (installed.body as VeronaModuleInListDto[]).map(module => module.key);
      if (keys.length) cy.deleteModulesAPI(keys, token).its('status').should('equal', 200);
    });
  });
  cy.resetDb();
  showLoginFormAfterUserDeleted();
}
