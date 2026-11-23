import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { VariableIdConflict } from '@studio-lite/shared-code';
import { ExportProblemsComponent, UnitExportProblems } from './export-problems.component';
import { VariableIdConflictListComponent } from '../variable-id-conflict-list/variable-id-conflict-list.component';
import { VariableIdConflictFixComponent } from '../variable-id-conflict-fix/variable-id-conflict-fix.component';

describe('ExportProblemsComponent', () => {
  let fixture: ComponentFixture<ExportProblemsComponent>;

  const elementConflict: VariableIdConflict = {
    id: '05',
    variables: [
      { kind: 'base', id: '05', alias: '_00a' },
      { kind: 'derived', id: 'd_1790938214783', alias: '05' }
    ]
  };
  const derivedConflict: VariableIdConflict = {
    id: 'd_2',
    variables: [{ kind: 'derived', id: 'd_1', alias: 'd_2' }, { kind: 'derived', id: 'd_2' }]
  };
  const units: UnitExportProblems[] = [
    {
      key: 'GL_NC08', name: 'Markieren', conflicts: [elementConflict], schemeProblems: []
    },
    { key: 'U2', conflicts: [derivedConflict], schemeProblems: [] }
  ];
  const nameTwice: UnitExportProblems = {
    key: 'AA_editor',
    conflicts: [],
    schemeProblems: [{ key: 'unit-check.scheme-problem.NAME_TWICE', params: { variable: 'text_1' } }]
  };

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const create = async (data: { units: UnitExportProblems[]; exportFormat: 'xml' | 'json' }) => {
    await TestBed.configureTestingModule({
      imports: [ExportProblemsComponent, TranslateModule.forRoot()],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: data }]
    }).compileComponents();

    fixture = TestBed.createComponent(ExportProblemsComponent);
    fixture.detectChanges();
  };

  it('lists the conflicts of each unit under its key and name (#2119)', async () => {
    await create({ units, exportFormat: 'xml' });
    const unitElements = fixture.debugElement.queryAll(By.css('[data-cy="export-problems-unit"]'));

    expect(unitElements[0].nativeElement.textContent).toContain('GL_NC08');
    expect(unitElements[0].nativeElement.textContent).toContain('Markieren');
    expect(unitElements.map(unit => unit.query(By.directive(VariableIdConflictListComponent))
      .componentInstance.conflicts())).toEqual([[elementConflict], [derivedConflict]]);
  });

  it('describes the manual fix once, for the conflicts of all units', async () => {
    await create({ units, exportFormat: 'xml' });

    expect(fixture.debugElement.query(By.directive(VariableIdConflictFixComponent)).componentInstance.conflicts())
      .toEqual([elementConflict, derivedConflict]);
  });

  // The Testcenter takes only the XML; a JSON export is read by other programs
  it('names the consequence of the chosen format', async () => {
    await create({ units, exportFormat: 'json' });

    expect(element().querySelector('[data-cy="variable-id-conflicts-intro"]')?.textContent?.trim())
      .toBe('unit-download.variable-id-conflicts.intro-json');
  });

  // a unit whose coding the schemer rejects has no id twice: the dialog says what is wrong with it (#2135)
  it('lists what the schemer rejects, and explains only the kinds of problem there are', async () => {
    await create({ units: [nameTwice], exportFormat: 'xml' });

    expect(Array.from(element().querySelectorAll('[data-cy="export-scheme-problem"]'), item => item.textContent))
      .toEqual(['unit-check.scheme-problem.NAME_TWICE']);
    expect(element().querySelector('[data-cy="export-scheme-problems-intro"]')).not.toBeNull();
    expect(element().querySelector('[data-cy="variable-id-conflicts-intro"]')).toBeNull();
    expect(fixture.debugElement.query(By.directive(VariableIdConflictFixComponent))).toBeNull();
  });

  it('leaves out the explanation of schemer problems where there are only ids twice', async () => {
    await create({ units, exportFormat: 'xml' });

    expect(element().querySelector('[data-cy="export-scheme-problems-intro"]')).toBeNull();
  });
});
