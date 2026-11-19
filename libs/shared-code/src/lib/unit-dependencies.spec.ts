import { sameDependencyLists, toUnitDependencies } from './unit-dependencies';

describe('toUnitDependencies', () => {
  it('keeps the types of editor API 5.0 and SERVICE as they are', () => {
    const reported = [
      { id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' },
      { id: 'video.mp4', type: 'STREAM' },
      { id: 'clips.zip', type: 'STREAM_TO_UNPACK' },
      { id: 'sheet.pdf', type: 'FILE' },
      { id: 'PERIODIC_TABLE', type: 'WIDGET' },
      { id: 'https://example.org/api', type: 'SERVICE' }
    ];
    expect(toUnitDependencies(reported)).toEqual(reported);
  });

  it('reads the lower-case types of editor API 4.x, a resource package as one to unpack', () => {
    expect(toUnitDependencies([
      { id: 'GeoGebra.ITCR.ZIP', type: 'file' },
      { id: 'sheet.pdf', type: 'file' },
      { id: 'https://example.org/api', type: 'service' }
    ])).toEqual([
      { id: 'GeoGebra.ITCR.ZIP', type: 'FILE_TO_UNPACK' },
      { id: 'sheet.pdf', type: 'FILE' },
      { id: 'https://example.org/api', type: 'SERVICE' }
    ]);
  });

  it('leaves out entries without a name or with a type no specification knows', () => {
    expect(toUnitDependencies([
      { id: '', type: 'FILE' },
      { id: '  ', type: 'FILE' },
      { type: 'FILE' },
      { id: 'a.zip' },
      { id: 'a.zip', type: 'ARCHIVE' },
      { id: 7, type: 'FILE' },
      null,
      'GeoGebra.itcr.zip'
    ])).toEqual([]);
  });

  // the name is compared with the installed packages, as the XML import already trims it
  it('takes the spaces around a name away, also before telling a repeated entry', () => {
    expect(toUnitDependencies([
      { id: ' GeoGebra.itcr.zip ', type: 'file' },
      { id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' }
    ])).toEqual([{ id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' }]);
  });

  it('keeps a repeated entry once', () => {
    expect(toUnitDependencies([
      { id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' },
      { id: 'GeoGebra.itcr.zip', type: 'file' },
      { id: 'GeoGebra.itcr.zip', type: 'FILE' }
    ])).toEqual([
      { id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' },
      { id: 'GeoGebra.itcr.zip', type: 'FILE' }
    ]);
  });

  it('makes nothing of what is not a list', () => {
    expect(toUnitDependencies(undefined)).toEqual([]);
    expect(toUnitDependencies({ id: 'GeoGebra.itcr.zip', type: 'FILE' })).toEqual([]);
  });
});

describe('sameDependencyLists', () => {
  const geogebra = { id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' as const };
  const calc = { id: 'CALC', type: 'WIDGET' as const };

  it('does not mind the order', () => {
    expect(sameDependencyLists([geogebra, calc], [calc, geogebra])).toBe(true);
  });

  it('tells lists apart by name and by type', () => {
    expect(sameDependencyLists([geogebra], [calc])).toBe(false);
    expect(sameDependencyLists([geogebra], [{ ...geogebra, type: 'FILE' }])).toBe(false);
    expect(sameDependencyLists([geogebra], [geogebra, calc])).toBe(false);
  });

  it('takes a missing list for an empty one', () => {
    expect(sameDependencyLists(undefined, [])).toBe(true);
    expect(sameDependencyLists(null, [geogebra])).toBe(false);
  });
});
