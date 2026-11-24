import type { ResourcePackageDto, WorkspaceGroupFullDto, WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import { baseGroup } from '../../../support/testData';
import { clickIndexTabAdmin, clickIndexTabWsgAdmin } from '../../../support/helpers';
import { createTestBaseAPI } from '../../../support/helpers/test-base';

// Several packages stand in for one package name (#1358): the administrator names them on upload, sets
// the default, overwrites one, renames one; a group admin chooses one for the group. Both test packages
// hold TestPackage/version.txt with their version.
describe('Versions of a resource package in the administration (#1358)', () => {
  const fixtures = '../frontend-e2e/src/fixtures';
  let token = '';
  let wsId = '';
  let groupId = '';

  const openPackages = () => {
    cy.visit('/');
    cy.findAdminSettings().click();
    clickIndexTabAdmin('packages');
  };
  const served = () => cy.getWsPackageFileAPI(wsId, 'TestPackage/TestPackage/version.txt')
    .then(resp => String(resp.body).trim());
  const installed = () => cy.getPackageAPI(token).then(resp => resp.body as ResourcePackageDto[]);

  before(() => {
    createTestBaseAPI().then(base => {
      token = base.token;
      wsId = base.wsId;
      cy.getWsGroupsAPI(token).then(resp => {
        groupId = String((resp.body as WorkspaceGroupInListDto[]).find(({ name }) => name === baseGroup)?.id);
      });
      // the first package of its name, and with it the default
      cy.addPackageAPI('TestPackage-1.0.itcr.zip', token).its('status').should('equal', 201);
    });
  });

  it('uploads a package under the package name its file name suggests', () => {
    openPackages();
    cy.get('[data-cy="admin-packages-file-input"]')
      .selectFile(`${fixtures}/TestPackage-2.0.itcr.zip`, { action: 'select', force: true });
    cy.get('[data-cy="resource-package-dialog-package-name"]').should('have.value', 'TestPackage');
    cy.get('[data-cy="resource-package-dialog-becomes-default"]').should('not.exist');
    cy.get('[data-cy="resource-package-dialog-confirm"]').click();

    cy.get('[data-cy="admin-packages-package-name-TestPackage-2.0"]').should('have.text', 'TestPackage');
    cy.get('[data-cy="admin-packages-default-TestPackage-1.0"]').should('exist');
    cy.get('[data-cy="admin-packages-set-default-TestPackage-2.0"]').should('exist');
  });

  it('sets the default once the groups that switch are named', () => {
    cy.get('[data-cy="admin-packages-set-default-TestPackage-2.0"]').click();
    cy.get('tc-confirm-dialog').should('contain.text', baseGroup);
    cy.get('tc-confirm-dialog button').first().click();

    cy.get('[data-cy="admin-packages-default-TestPackage-2.0"]').should('exist');
    cy.getPackageDefaultsAPI(token).its('body').should('deep.equal', { TestPackage: 'TestPackage-2.0' });
    served().should('equal', '2.0');
  });

  it('overwrites an installed package only once that is confirmed', () => {
    const selectOverwriting = () => cy.fixture('TestPackage-1.0.itcr.zip', null).then(contents => {
      cy.get('[data-cy="admin-packages-file-input"]').selectFile(
        { contents, fileName: 'TestPackage-2.0.itcr.zip' },
        { action: 'select', force: true }
      );
    });

    selectOverwriting();
    cy.get('[data-cy="resource-package-dialog-overwrite"]').should('contain.text', baseGroup);
    cy.get('[data-cy="resource-package-dialog-cancel"]').click();
    served().should('equal', '2.0');

    cy.intercept('POST', '/api/resource-packages*').as('upload');
    selectOverwriting();
    cy.get('[data-cy="resource-package-dialog-confirm"]').click();
    cy.wait('@upload').then(({ request, response }) => {
      expect(request.url).to.contain('overwrite=true');
      expect(response?.statusCode).to.equal(201);
    });
    // TestPackage-2.0 holds the content of the other zip now
    served().should('equal', '1.0');
  });

  it('gives a package not in use another package name', () => {
    cy.get('[data-cy="admin-packages-edit-TestPackage-1.0"]').click();
    cy.get('[data-cy="resource-package-dialog-package-name"]').clear().type('Other');
    cy.get('[data-cy="resource-package-dialog-becomes-default"]').should('exist');
    cy.get('[data-cy="resource-package-dialog-confirm"]').click();

    cy.get('[data-cy="admin-packages-package-name-TestPackage-1.0"]').should('have.text', 'Other');
    installed().then(packages => {
      expect(packages.find(({ name }) => name === 'TestPackage-1.0')?.packageName).to.equal('Other');
    });
    // back for the group to choose from
    installed().then(packages => {
      const id = String(packages.find(({ name }) => name === 'TestPackage-1.0')?.id);
      cy.patchPackageNameAPI(id, 'TestPackage', token).its('status').should('equal', 200);
    });
  });

  it('lets a group admin choose a package for the group', () => {
    cy.findAdminGroupSettings(baseGroup).click();
    clickIndexTabWsgAdmin('settings');
    cy.get('[data-cy="wsg-settings-resource-package-TestPackage"]').click();
    cy.contains('mat-option', 'TestPackage-1.0').click();
    cy.intercept('PATCH', `/api/workspace-groups/${groupId}`).as('saveSettings');
    cy.get('[data-cy="wsg-admin-settings-save-button"]').click();
    cy.wait('@saveSettings');

    cy.getGroupPropertiesAPI(groupId, token).then(resp => {
      expect((resp.body as WorkspaceGroupFullDto).settings?.chosenResourcePackages)
        .to.deep.equal({ TestPackage: 'TestPackage-1.0' });
    });
  });
});
