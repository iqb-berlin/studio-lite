import { UnitDependency } from '@studio-lite/shared-code';
import { checkDependencies } from './dependency-check.utils';

describe('checkDependencies', () => {
  const geogebra: UnitDependency = { id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' };
  const calc: UnitDependency = { id: 'CALC', type: 'WIDGET' };
  const periodicTable: UnitDependency = { id: 'PERIODIC_TABLE', type: 'WIDGET' };
  const sheet: UnitDependency = { id: 'sheet.pdf', type: 'FILE' };
  const service: UnitDependency = { id: 'formula-service', type: 'SERVICE' };
  const installed = { packages: ['GeoGebra'], widgets: ['CALC'] };
  const unread = { packages: null, widgets: null };

  it('lists what the unit needs to be played and to be edited, each with whether the studio has it', () => {
    const { lists, findings } = checkDependencies(
      { toPlay: [geogebra, calc, sheet, service], toEdit: [geogebra] },
      installed,
      true
    );

    expect(lists).toEqual([
      {
        purpose: 'play',
        key: 'unit-check.dependencies-play',
        entries: [
          { key: 'unit-check.dependency.package-installed', params: { name: 'GeoGebra.itcr.zip' } },
          { key: 'unit-check.dependency.widget-installed', params: { name: 'CALC' } },
          { key: 'unit-check.dependency.file-not-provided', params: { name: 'sheet.pdf' } },
          { key: 'unit-check.dependency.service-not-checked', params: { name: 'formula-service' } }
        ]
      },
      {
        purpose: 'edit',
        key: 'unit-check.dependencies-edit',
        entries: [{ key: 'unit-check.dependency.package-installed', params: { name: 'GeoGebra.itcr.zip' } }]
      }
    ]);
    // the studio never provides another file: a finding, but nothing an administrator can install
    expect(findings).toEqual([{ key: 'workspace.dependencies-missing-files', params: { names: 'sheet.pdf' } }]);
  });

  // an empty list says only that nothing is reported: older units and editors report nothing
  it('says nothing is reported where a list is empty, and finds nothing', () => {
    expect(checkDependencies({ toPlay: [], toEdit: undefined }, installed, true)).toEqual({
      lists: [
        { purpose: 'play', key: 'unit-check.dependencies-play-none', entries: [] },
        { purpose: 'edit', key: 'unit-check.dependencies-edit-none', entries: [] }
      ],
      findings: []
    });
  });

  it('names what is missing to be played as findings, one per kind, and that it can be installed', () => {
    const { findings } = checkDependencies(
      { toPlay: [geogebra, periodicTable, { id: 'Videos.itcr.zip', type: 'FILE_TO_UNPACK' }], toEdit: [] },
      { packages: [], widgets: [] },
      true
    );

    expect(findings).toEqual([
      { key: 'workspace.dependencies-missing-packages', params: { names: 'GeoGebra.itcr.zip, Videos.itcr.zip' } },
      { key: 'workspace.dependencies-missing-widgets', params: { names: 'PERIODIC_TABLE' } },
      { key: 'workspace.dependencies-missing-install-hint', level: 'hint' }
    ]);
  });

  // the unit is played all the same, as it is without its editor
  it('names what is missing only to be edited as hints, and says once that it can be installed', () => {
    const { findings } = checkDependencies(
      { toPlay: [geogebra], toEdit: [geogebra, periodicTable, sheet] },
      { packages: [], widgets: [] },
      true
    );

    expect(findings).toEqual([
      { key: 'workspace.dependencies-missing-packages', params: { names: 'GeoGebra.itcr.zip' } },
      {
        key: 'unit-check.dependencies-missing-to-edit-packages', params: { names: 'GeoGebra.itcr.zip' }, level: 'hint'
      },
      { key: 'unit-check.dependencies-missing-to-edit-widgets', params: { names: 'PERIODIC_TABLE' }, level: 'hint' },
      { key: 'unit-check.dependencies-missing-to-edit-files', params: { names: 'sheet.pdf' }, level: 'hint' },
      { key: 'workspace.dependencies-missing-install-hint', level: 'hint' }
    ]);
  });

  // unknown is not missing (#1602)
  it('says packages and widgets were not checked where what is installed could not be read', () => {
    const toPlay = checkDependencies({ toPlay: [geogebra, sheet], toEdit: [] }, unread, true);
    expect(toPlay.lists[0].entries.map(entry => entry.key)).toEqual([
      'unit-check.dependency.package-unknown',
      'unit-check.dependency.file-not-provided'
    ]);
    expect(toPlay.findings).toEqual([
      { key: 'workspace.dependencies-missing-files', params: { names: 'sheet.pdf' } },
      { key: 'unit-check.dependencies-not-checked', level: 'hint' }
    ]);

    // what could not be checked is not known to be missing, to be played or edited
    expect(checkDependencies({ toPlay: [service], toEdit: [calc] }, unread, true).findings)
      .toEqual([{ key: 'unit-check.dependencies-not-checked', level: 'hint' }]);
  });

  // the preview and the export need it all the same, also for a module without an editor
  it('checks and lists only what is needed to be played where the editor is hidden', () => {
    expect(checkDependencies(
      { toPlay: [periodicTable], toEdit: [geogebra] },
      { packages: [], widgets: [] },
      false
    )).toEqual({
      lists: [{
        purpose: 'play',
        key: 'unit-check.dependencies-play',
        entries: [{ key: 'unit-check.dependency.widget-missing', params: { name: 'PERIODIC_TABLE' } }]
      }],
      findings: [
        { key: 'workspace.dependencies-missing-widgets', params: { names: 'PERIODIC_TABLE' } },
        { key: 'workspace.dependencies-missing-install-hint', level: 'hint' }
      ]
    });
    expect(checkDependencies({ toPlay: [], toEdit: [geogebra] }, unread, false).findings).toEqual([]);
  });
});
