import type { WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import { baseGroup, standardUser } from '../../support/testData';
import { createTestBaseAPI } from '../../support/helpers/test-base';

// Several packages stand in for one package name; which one a workspace gets is the choice of its
// group, else the administrator's default (#1358). Both test packages hold TestPackage/version.txt
// with their version, so the file a workspace is served tells which package served it.
describe('Versions of a resource package (#1358)', () => {
  const file = 'TestPackage/TestPackage/version.txt';
  let token = '';
  let userToken = '';
  let groupA = '';
  let wsA = '';
  let wsB = '';
  const packageIds: Record<string, string> = {};

  const served = (wsId: string, path = file) => cy.getWsPackageFileAPI(wsId, path);
  const expectServed = (wsId: string, version: string, path = file) => served(wsId, path).then(resp => {
    expect(resp.status, `${path} in workspace ${wsId}`).to.equal(200);
    expect(String(resp.body).trim()).to.equal(version);
  });
  const findPackageIds = () => cy.getPackageAPI(token).then(resp => {
    (resp.body as { id: number; name: string }[]).forEach(({ id, name }) => {
      packageIds[name] = String(id);
    });
  });

  before(() => {
    createTestBaseAPI().then(base => {
      token = base.token;
      wsA = base.wsId;
      cy.loginAPI(standardUser.username, standardUser.password).then(login => {
        userToken = login.body.accessToken;
      });
      cy.getWsGroupsAPI(token).then(resp => {
        groupA = String((resp.body as WorkspaceGroupInListDto[]).find(({ name }) => name === baseGroup)?.id);
      });
      cy.createGroupAPI({ id: '', name: 'Zweite Gruppe' }, token).then(group => {
        expect(group.status, 'second group').to.equal(201);
        cy.createWsAPI(String(group.body), { id: '', name: 'Zweiter Bereich' }, token).then(ws => {
          expect(ws.status, 'workspace of the second group').to.equal(201);
          wsB = String(ws.body);
        });
      });
    });
  });

  it('makes the first package of a package name its default and serves it', () => {
    cy.addPackageAPI('TestPackage-1.0.itcr.zip', token).its('status').should('equal', 201);
    cy.getPackageDefaultsAPI(token).its('body').should('deep.equal', { TestPackage: 'TestPackage-1.0' });
    expectServed(wsA, '1.0');
    // as a module appending with a slash of its own, and with the package name spelt otherwise
    expectServed(wsA, '1.0', `/${file}`);
    expectServed(wsA, '1.0', 'testpackage/TestPackage/version.txt');
  });

  it('leaves the default alone when another package of the name arrives', () => {
    cy.addPackageAPI('TestPackage-2.0.itcr.zip', token).its('status').should('equal', 201);
    cy.getPackageDefaultsAPI(token).its('body').should('deep.equal', { TestPackage: 'TestPackage-1.0' });
    expectServed(wsA, '1.0');
    findPackageIds();
  });

  it('serves the package a group chose to its workspaces only', () => {
    cy.updateGroupSettingsAPI(groupA, { chosenResourcePackages: { TestPackage: 'TestPackage-2.0' } }, token)
      .its('status').should('equal', 200);
    expectServed(wsA, '2.0');
    expectServed(wsB, '1.0');
    // the package name, and the names the packages are installed under, by which a module may ask too
    cy.getWsPackageNamesAPI(wsB, token).its('body')
      .should('have.members', ['TestPackage', 'TestPackage-1.0', 'TestPackage-2.0']);
    cy.getPackageGroupsAPI(token).its('body').should('deep.include', {
      id: Number(groupA), name: baseGroup, chosenResourcePackages: { TestPackage: 'TestPackage-2.0' }
    });
  });

  it('lets only an administrator set the defaults and see the choices of the groups', () => {
    cy.setPackageDefaultsAPI({ TestPackage: 'TestPackage-2.0' }, userToken)
      .its('status').should('be.oneOf', [401, 403]);
    cy.getPackageGroupsAPI(userToken).its('status').should('be.oneOf', [401, 403]);
    cy.setPackageDefaultsAPI({ TestPackage: 'avatar' }, token).its('status').should('equal', 400);
    cy.setPackageDefaultsAPI({ TestPackage: 'TestPackage-2.0' }, token).its('status').should('equal', 200);
    expectServed(wsB, '2.0');
  });

  it('refuses to delete or rename a package in use', () => {
    cy.deletePackageAPI(token, packageIds['TestPackage-2.0']).its('status').should('equal', 409);
    cy.patchPackageNameAPI(packageIds['TestPackage-2.0'], 'Other', token).its('status').should('equal', 409);
    expectServed(wsB, '2.0');
  });

  it('replaces an installed package only when told to', () => {
    cy.addPackageAPI('TestPackage-1.0.itcr.zip', token, { fileName: 'TestPackage-2.0.itcr.zip' })
      .its('status').should('equal', 409);
    expectServed(wsA, '2.0');
    cy.addPackageAPI('TestPackage-1.0.itcr.zip', token, { fileName: 'TestPackage-2.0.itcr.zip', overwrite: true })
      .its('status').should('equal', 201);
    // TestPackage-2.0 holds the content of the other zip now
    expectServed(wsA, '1.0');
  });

  it('serves nothing for a package name no package stands in for', () => {
    served(wsA, 'avatar/avatar.json').its('status').should('equal', 404);
    served('999999', file).its('status').should('equal', 404);
  });
});
