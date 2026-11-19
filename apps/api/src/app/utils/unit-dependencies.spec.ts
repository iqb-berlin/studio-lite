import { UnitDependency } from '@studio-lite/shared-code';
import { ExportReportMessage, ExportReportScope } from '../classes/export-report.class';
import {
  fromUnitIndexDependencies, fromUnitXmlDependencies, toUnitIndexDependencies, toUnitXmlDependencies
} from './unit-dependencies';

const all: UnitDependency[] = [
  { id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' },
  { id: 'sheet.pdf', type: 'FILE' },
  { id: 'video.mp4', type: 'STREAM' },
  { id: 'clips.zip', type: 'STREAM_TO_UNPACK' },
  { id: 'PERIODIC_TABLE', type: 'WIDGET' },
  { id: 'https://example.org/api', type: 'SERVICE' }
];

describe('unit dependencies in the unit XML', () => {
  it('should write every file as File and a service as Service, for player and editor, without widgets', () => {
    expect(toUnitXmlDependencies({ dependenciesToPlay: all, dependenciesToEdit: [all[0]] })).toEqual([
      { element: 'File', target: 'player', name: 'GeoGebra.itcr.zip' },
      { element: 'File', target: 'player', name: 'sheet.pdf' },
      { element: 'File', target: 'player', name: 'video.mp4' },
      { element: 'File', target: 'player', name: 'clips.zip' },
      { element: 'Service', target: 'player', name: 'https://example.org/api' },
      { element: 'File', target: 'editor', name: 'GeoGebra.itcr.zip' }
    ]);
  });

  it('should read a resource package as one to unpack, and an entry without for as one for the player', () => {
    expect(fromUnitXmlDependencies([
      { element: 'File', name: ' GeoGebra.ITCR.zip ' },
      { element: 'file', target: 'player', name: 'sheet.pdf' },
      { element: 'Service', target: 'editor', name: 'https://example.org/api' },
      { element: 'File', target: 'editor', name: 'GeoGebra.itcr.zip' }
    ])).toEqual({
      dependenciesToPlay: [
        { id: 'GeoGebra.ITCR.zip', type: 'FILE_TO_UNPACK' },
        { id: 'sheet.pdf', type: 'FILE' }
      ],
      dependenciesToEdit: [
        { id: 'https://example.org/api', type: 'SERVICE' },
        { id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' }
      ]
    });
  });

  it('should leave out entries for the schemer and the coder, and empty ones', () => {
    expect(fromUnitXmlDependencies([
      { element: 'File', target: 'schemer', name: 'a.zip' },
      { element: 'File', target: 'coder', name: 'b.zip' },
      { element: 'File', target: 'player', name: '  ' }
    ])).toEqual({ dependenciesToPlay: [], dependenciesToEdit: [] });
  });
});

describe('unit dependencies in the unit index', () => {
  it('should write files with their delivery and widgets by their type, and report a service', () => {
    const messages: ExportReportMessage[] = [];

    const written = toUnitIndexDependencies(all, new ExportReportScope('U1', 'U1.json', messages));

    expect(written).toEqual([
      { fileName: 'GeoGebra.itcr.zip', unpackBeforeProviding: true },
      { fileName: 'sheet.pdf' },
      { fileName: 'video.mp4', httpResponseMode: 'STREAM' },
      { fileName: 'clips.zip', unpackBeforeProviding: true, httpResponseMode: 'STREAM' },
      'PERIODIC_TABLE'
    ]);
    expect(messages).toEqual([{
      unitKey: 'U1',
      objectKey: 'U1.json',
      messageKey: 'dropped-content.dependency-not-exported',
      details: { id: 'https://example.org/api', type: 'SERVICE' }
    }]);
  });

  it('should report a widget type unit-index does not allow', () => {
    const messages: ExportReportMessage[] = [];

    const written = toUnitIndexDependencies(
      [{ id: 'periodic-table', type: 'WIDGET' }],
      new ExportReportScope('U1', 'U1.json', messages)
    );

    expect(written).toEqual([]);
    expect(messages).toHaveLength(1);
  });

  it('should read back what it writes', () => {
    const written = toUnitIndexDependencies(all);

    expect(fromUnitIndexDependencies(written)).toEqual(all.filter(dependency => dependency.type !== 'SERVICE'));
  });

  it('should leave out what does not fit the shape of unit-index', () => {
    expect(fromUnitIndexDependencies([{ unpackBeforeProviding: true }, 7, null, { fileName: '' }])).toEqual([]);
    expect(fromUnitIndexDependencies('GeoGebra.itcr.zip')).toEqual([]);
  });
});
