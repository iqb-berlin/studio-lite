/**
 * The test base of the workspace specs, built through the API: the first user, a standard user,
 * a group with two workspaces both of them work in, and the Verona modules. The interface steps
 * this replaces are checked once in the admin and group-admin specs (#1967).
 */

import type { UserInListDto, VeronaModuleInListDto, WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import {
  AccessLevel,
  baseGroup,
  modules,
  primaryWorkspace,
  secondaryWorkspace,
  standardUser
} from '../testData';
import { getNameAt } from '../util-api';
import { showLoginFormAfterUserDeleted } from './admin';
import { login } from './user';

const admin = () => ({ username: Cypress.expose('username'), password: Cypress.expose('password') });

/**
 * Builds the base and logs the browser in as the first user. Needs an empty database: the first
 * user can only be created while there is none.
 */
export function createTestBaseAPI(): void {
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
 * spec finds an empty database. It finds what to delete by name, as the base may be incomplete
 * when its setup failed halfway, and the teardown may run in another file than the setup.
 */
export function deleteTestBaseAPI(): void {
  const { username, password } = admin();
  cy.loginAPI(username, password).then(session => {
    expect(session.status, 'login for the teardown').to.equal(201);
    const token: string = session.body.accessToken;
    cy.getWsGroupsAPI(token).then(groups => {
      expect(groups.status, 'groups').to.equal(200);
      const ids = (groups.body as WorkspaceGroupInListDto[])
        .filter(group => group.name === baseGroup)
        .map(group => String(group.id));
      if (ids.length) cy.deleteGroupsAPI(ids, token).its('status').should('equal', 200);
    });
    cy.getUsersAPI(token).then(users => {
      expect(users.status, 'users').to.equal(200);
      const ids = (users.body as UserInListDto[])
        .filter(user => user.name === standardUser.username)
        .map(user => String(user.id));
      if (ids.length) cy.deleteUsersAPI(ids, token).its('status').should('equal', 200);
    });
    // its own modules even if the list comes back empty, and any other a spec installed; the API
    // answers 200 for a key it does not know
    cy.getModulesAPI(token).then(installed => {
      const listed = ((installed.body || []) as VeronaModuleInListDto[]).map(module => module.key);
      const keys = [...new Set([...modules.map(getNameAt), ...listed])];
      cy.deleteModulesAPI(keys, token).its('status').should('equal', 200);
    });
    cy.getUserIdAPI(token).then(authData => {
      cy.deleteUsersAPI([String(authData.body.userId)], token).its('status').should('equal', 200);
    });
  });
  showLoginFormAfterUserDeleted();
}
