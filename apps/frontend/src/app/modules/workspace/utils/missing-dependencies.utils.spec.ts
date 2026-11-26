import { UnitDependency } from '@studio-lite/shared-code';
import { checkDependency, findMissingDependencies } from './missing-dependencies.utils';

describe('findMissingDependencies', () => {
  const dependencies: UnitDependency[] = [
    { id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' },
    { id: 'Videos.itcr.zip', type: 'FILE' },
    { id: 'CALC', type: 'WIDGET' },
    { id: 'PERIODIC_TABLE', type: 'WIDGET' }
  ];

  it('should name the packages and widgets the studio does not have', () => {
    expect(findMissingDependencies(dependencies, { packages: ['Videos'], widgets: ['CALC'] })).toEqual({
      packages: ['GeoGebra.itcr.zip'],
      widgets: ['PERIODIC_TABLE'],
      files: []
    });
  });

  it('should take an installed package whatever the case of its name', () => {
    expect(findMissingDependencies(
      [{ id: 'geogebra.ITCR.zip', type: 'FILE_TO_UNPACK' }],
      { packages: ['GeoGebra'], widgets: [] }
    ).packages).toEqual([]);
  });

  // the studio hands the modules nothing but its packages, so it never has such a file (#1602)
  it('should take every file that is no package for missing, whatever is installed', () => {
    expect(findMissingDependencies([
      { id: 'sheet.pdf', type: 'FILE' },
      { id: 'video.mp4', type: 'STREAM' }
    ], { packages: ['sheet.pdf', 'video.mp4'], widgets: [] }))
      .toEqual({ packages: [], widgets: [], files: ['sheet.pdf', 'video.mp4'] });
  });

  it('should never take a service for missing', () => {
    expect(findMissingDependencies(
      [{ id: 'https://example.org/api', type: 'SERVICE' }],
      { packages: [], widgets: [] }
    )).toEqual({ packages: [], widgets: [], files: [] });
  });

  it('should find nothing missing for a unit that names nothing', () => {
    expect(findMissingDependencies(undefined, { packages: [], widgets: [] }))
      .toEqual({ packages: [], widgets: [], files: [] });
  });
});

describe('checkDependency', () => {
  const installed = { packages: ['GeoGebra'], widgets: ['CALC'] };

  it('should tell each kind and whether the studio has it', () => {
    expect([
      { id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' },
      { id: 'Videos.itcr.zip', type: 'STREAM_TO_UNPACK' },
      { id: 'CALC', type: 'WIDGET' },
      { id: 'PERIODIC_TABLE', type: 'WIDGET' },
      { id: 'sheet.pdf', type: 'FILE' },
      { id: 'https://example.org/api', type: 'SERVICE' }
    ].map(dependency => checkDependency(dependency as UnitDependency, installed))).toEqual([
      { id: 'GeoGebra.itcr.zip', kind: 'package', state: 'installed' },
      { id: 'Videos.itcr.zip', kind: 'package', state: 'missing' },
      { id: 'CALC', kind: 'widget', state: 'installed' },
      { id: 'PERIODIC_TABLE', kind: 'widget', state: 'missing' },
      { id: 'sheet.pdf', kind: 'file', state: 'not-provided' },
      { id: 'https://example.org/api', kind: 'service', state: 'not-checked' }
    ]);
  });

  // what could not be read is not known, and unknown is not missing (#2198)
  it('should not know of packages and widgets without the lists, and still of other files', () => {
    expect([
      { id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' },
      { id: 'CALC', type: 'WIDGET' },
      { id: 'sheet.pdf', type: 'FILE' }
    ].map(dependency => checkDependency(dependency as UnitDependency, null).state))
      .toEqual(['unknown', 'unknown', 'not-provided']);
  });
});
