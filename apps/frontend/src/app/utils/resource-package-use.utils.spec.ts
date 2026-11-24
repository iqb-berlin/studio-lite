import { resourcePackageUseTexts } from './resource-package-use.utils';

describe('resourcePackageUseTexts', () => {
  const mathe = { id: 1, name: 'Mathe' };
  const physik = { id: 2, name: 'Physik' };

  it('names the default and the groups that chose the package (#1358)', () => {
    expect(resourcePackageUseTexts({ isDefault: true, groups: [mathe, physik], servesByName: false }, 'GeoGebra'))
      .toEqual([
        { key: 'resource-packages.use-default', params: { packageName: 'GeoGebra' } },
        { key: 'resource-packages.use-groups', params: { groups: 'Mathe, Physik' } }
      ]);
  });

  it('names a package that serves its package name while no default is set', () => {
    expect(resourcePackageUseTexts({ isDefault: false, groups: [], servesByName: true }, 'GeoGebra'))
      .toEqual([{ key: 'resource-packages.use-by-name', params: { packageName: 'GeoGebra' } }]);
  });
});
