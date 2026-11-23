import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { ResourcePackageServingPipe } from './resource-package-serving.pipe';

describe('ResourcePackageServingPipe', () => {
  const pipe = new ResourcePackageServingPipe();
  const geogebra = (name: string): ResourcePackageDto => ({
    id: 0, name, packageName: 'GeoGebra', elements: []
  });
  const packages = [geogebra('GeoGebra'), geogebra('GeoGebra-5.3')];

  it('should mark the default as the package groups without a choice get (#1358)', () => {
    expect(pipe.transform(packages[1], packages, { GeoGebra: 'GeoGebra-5.3' })).toBe(true);
    expect(pipe.transform(packages[0], packages, { GeoGebra: 'GeoGebra-5.3' })).toBe(false);
  });

  it('should mark the package of exactly the name while no default is set', () => {
    expect(pipe.transform(packages[0], packages, {})).toBe(true);
    expect(pipe.transform(packages[1], packages, {})).toBe(false);
  });
});
