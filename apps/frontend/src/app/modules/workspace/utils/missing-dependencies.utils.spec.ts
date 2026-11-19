import { UnitDependency } from '@studio-lite/shared-code';
import { findMissingDependencies } from './missing-dependencies.utils';

describe('findMissingDependencies', () => {
  const dependencies: UnitDependency[] = [
    { id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' },
    { id: 'Videos.itcr.zip', type: 'FILE' },
    { id: 'CALC', type: 'WIDGET' },
    { id: 'PERIODIC_TABLE', type: 'WIDGET' }
  ];

  it('should name the packages and widgets the studio does not have', () => {
    expect(findMissingDependencies(dependencies, ['Videos'], ['CALC'])).toEqual({
      packages: ['GeoGebra.itcr.zip'],
      widgets: ['PERIODIC_TABLE'],
      files: []
    });
  });

  it('should take an installed package whatever the case of its name', () => {
    expect(findMissingDependencies(
      [{ id: 'geogebra.ITCR.zip', type: 'FILE_TO_UNPACK' }],
      ['GeoGebra'],
      []
    ).packages).toEqual([]);
  });

  // the studio hands the modules nothing but its packages, so it never has such a file (#1602)
  it('should take every file that is no package for missing, whatever is installed', () => {
    expect(findMissingDependencies([
      { id: 'sheet.pdf', type: 'FILE' },
      { id: 'video.mp4', type: 'STREAM' }
    ], ['sheet.pdf', 'video.mp4'], [])).toEqual({ packages: [], widgets: [], files: ['sheet.pdf', 'video.mp4'] });
  });

  it('should never take a service for missing', () => {
    expect(findMissingDependencies([{ id: 'https://example.org/api', type: 'SERVICE' }], [], []))
      .toEqual({ packages: [], widgets: [], files: [] });
  });

  it('should find nothing missing for a unit that names nothing', () => {
    expect(findMissingDependencies(undefined, [], [])).toEqual({ packages: [], widgets: [], files: [] });
  });
});
