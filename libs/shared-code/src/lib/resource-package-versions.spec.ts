import {
  InstalledResourcePackage,
  resolveResourcePackage,
  resolveResourcePackageForGroups,
  resourcePackageInUse,
  resourcePackageNameOf,
  suggestPackageName,
  withChosenResourcePackage
} from './resource-package-versions';

const geogebra = (name: string): InstalledResourcePackage => ({ name, packageName: 'GeoGebra' });

describe('resourcePackageNameOf', () => {
  it('takes the ending off a package file name, whatever its case', () => {
    expect(resourcePackageNameOf('GeoGebra.itcr.zip')).toBe('GeoGebra');
    expect(resourcePackageNameOf('GeoGebra.ITCR.ZIP')).toBe('GeoGebra');
    expect(resourcePackageNameOf('GeoGebra')).toBe('GeoGebra');
  });
});

describe('suggestPackageName', () => {
  it('suggests the name up to the first hyphen followed by a digit (#1358)', () => {
    expect(suggestPackageName('GeoGebra-5.0.791.itcr.zip')).toBe('GeoGebra');
    expect(suggestPackageName('my-fonts-2.0.itcr.zip')).toBe('my-fonts');
    expect(suggestPackageName('GeoGebra-5.3-beta.itcr.zip')).toBe('GeoGebra');
  });

  it('suggests the whole name for a file without a version', () => {
    expect(suggestPackageName('avatar.itcr.zip')).toBe('avatar');
    expect(suggestPackageName('my-fonts.itcr.zip')).toBe('my-fonts');
    expect(suggestPackageName('-5.0.itcr.zip')).toBe('-5.0');
  });
});

describe('resolveResourcePackage', () => {
  const installed = [geogebra('GeoGebra'), geogebra('GeoGebra-5.0.791'), geogebra('GeoGebra-5.3')];
  const defaults = { GeoGebra: 'GeoGebra-5.0.791' };

  it('serves the package the group chose before the default (#1358)', () => {
    expect(resolveResourcePackage('GeoGebra', installed, { GeoGebra: 'GeoGebra-5.3' }, defaults))
      .toEqual({ name: 'GeoGebra-5.3', source: 'group' });
  });

  it('serves the default to a group that chose nothing', () => {
    expect(resolveResourcePackage('GeoGebra', installed, {}, defaults))
      .toEqual({ name: 'GeoGebra-5.0.791', source: 'default' });
  });

  it('serves the package installed under exactly the name without a default, as before versions', () => {
    expect(resolveResourcePackage('GeoGebra', installed))
      .toEqual({ name: 'GeoGebra', source: 'name' });
  });

  it('takes only packages standing in for the name asked for', () => {
    const mixed = [{ name: 'GeoGebra-6.0', packageName: 'GeoGebra3D' }, geogebra('GeoGebra')];
    expect(resolveResourcePackage('GeoGebra', mixed, { GeoGebra: 'GeoGebra-6.0' }, { GeoGebra: 'GeoGebra-6.0' }))
      .toEqual({ name: 'GeoGebra', source: 'name' });
    // with packages standing in for the name, one installed under it but standing in for another does not serve it
    expect(resolveResourcePackage('GeoGebra', [geogebra('GeoGebra-5.3'), { name: 'GeoGebra', packageName: 'Other' }]))
      .toBeNull();
  });

  // a module may ask for a package by its own name: the IB player takes it from the unit definition
  it('serves a name nothing stands in for by the package installed under it', () => {
    expect(resolveResourcePackage('units-2026', [{ name: 'units-2026', packageName: 'units' }]))
      .toEqual({ name: 'units-2026', source: 'file' });
  });

  it('passes over a choice or a default whose package is not installed', () => {
    expect(resolveResourcePackage('GeoGebra', [geogebra('GeoGebra-5.0.791')], { GeoGebra: 'GeoGebra-6.0' }, defaults))
      .toEqual({ name: 'GeoGebra-5.0.791', source: 'default' });
    expect(resolveResourcePackage('GeoGebra', [geogebra('GeoGebra')], undefined, { GeoGebra: 'GeoGebra-6.0' }))
      .toEqual({ name: 'GeoGebra', source: 'name' });
  });

  it('serves nothing when nothing stands behind the name', () => {
    expect(resolveResourcePackage('GeoGebra', [geogebra('GeoGebra-5.3')])).toBeNull();
    expect(resolveResourcePackage('avatar', installed)).toBeNull();
  });

  it('compares regardless of case and answers with the package as it is installed', () => {
    const lower = [{ name: 'geogebra-5.3', packageName: 'geogebra' }];
    expect(resolveResourcePackage('GeoGebra', lower, undefined, { GEOGEBRA: 'GeoGebra-5.3' }))
      .toEqual({ name: 'geogebra-5.3', source: 'default' });
    expect(resolveResourcePackage('geogebra', [geogebra('GeoGebra')]))
      .toEqual({ name: 'GeoGebra', source: 'name' });
  });

  it('prefers the package spelt exactly as asked over one differing in case', () => {
    expect(resolveResourcePackage('GeoGebra', [geogebra('geogebra'), geogebra('GeoGebra')]))
      .toEqual({ name: 'GeoGebra', source: 'name' });
  });
});

describe('withChosenResourcePackage', () => {
  it('replaces the entry of a package name however it is spelt, and drops it without a package', () => {
    const choice = { geogebra: 'GeoGebra-5.3', avatar: 'avatar' };
    expect(withChosenResourcePackage(choice, 'GeoGebra', 'GeoGebra-6.0'))
      .toEqual({ avatar: 'avatar', GeoGebra: 'GeoGebra-6.0' });
    expect(withChosenResourcePackage(choice, 'GeoGebra')).toEqual({ avatar: 'avatar' });
    expect(withChosenResourcePackage(undefined, 'GeoGebra', 'GeoGebra-6.0')).toEqual({ GeoGebra: 'GeoGebra-6.0' });
  });
});

describe('resolveResourcePackageForGroups', () => {
  it('tells for each group which package it gets and why', () => {
    const own = { id: 1, name: 'Own', chosenResourcePackages: { GeoGebra: 'GeoGebra-5.3' } };
    const following = { id: 2, name: 'Following' };
    expect(resolveResourcePackageForGroups(
      'GeoGebra',
      [geogebra('GeoGebra-5.0.791'), geogebra('GeoGebra-5.3')],
      [own, following],
      { GeoGebra: 'GeoGebra-5.0.791' }
    )).toEqual([
      { group: own, resolved: { name: 'GeoGebra-5.3', source: 'group' } },
      { group: following, resolved: { name: 'GeoGebra-5.0.791', source: 'default' } }
    ]);
  });
});

describe('resourcePackageInUse', () => {
  const installed = [geogebra('GeoGebra'), geogebra('GeoGebra-5.0.791'), geogebra('GeoGebra-5.3')];
  const own = { id: 1, name: 'Own', chosenResourcePackages: { GeoGebra: 'GeoGebra-5.3' } };

  it('finds the default and the chosen package in use (#1358)', () => {
    const defaults = { GeoGebra: 'GeoGebra-5.0.791' };
    expect(resourcePackageInUse(geogebra('GeoGebra-5.0.791'), installed, [own], defaults))
      .toEqual({ isDefault: true, groups: [], servesByName: false });
    expect(resourcePackageInUse(geogebra('GeoGebra-5.3'), installed, [own], defaults))
      .toEqual({ isDefault: false, groups: [own], servesByName: false });
    expect(resourcePackageInUse(geogebra('GeoGebra'), installed, [own], defaults)).toBeNull();
  });

  it('finds the package of exactly the name in use while no default is set', () => {
    expect(resourcePackageInUse(geogebra('GeoGebra'), installed, [], undefined))
      .toEqual({ isDefault: false, groups: [], servesByName: true });
  });

  it('finds the only package of its package name not in use', () => {
    expect(resourcePackageInUse(
      geogebra('GeoGebra-5.3'),
      [geogebra('GeoGebra-5.3'), { name: 'avatar', packageName: 'avatar' }],
      [own],
      { GeoGebra: 'GeoGebra-5.3' }
    )).toBeNull();
  });
});
