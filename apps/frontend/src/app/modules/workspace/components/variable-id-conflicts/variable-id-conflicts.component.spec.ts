import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { VariableIdConflict } from '@studio-lite/shared-code';
import { UnitVariableIdConflicts, VariableIdConflictsComponent } from './variable-id-conflicts.component';
import { VariableIdConflictListComponent } from '../variable-id-conflict-list/variable-id-conflict-list.component';
import { VariableIdConflictFixComponent } from '../variable-id-conflict-fix/variable-id-conflict-fix.component';

describe('VariableIdConflictsComponent', () => {
  let fixture: ComponentFixture<VariableIdConflictsComponent>;

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
  const units: UnitVariableIdConflicts[] = [
    { key: 'GL_NC08', name: 'Markieren', conflicts: [elementConflict] },
    { key: 'U2', conflicts: [derivedConflict] }
  ];

  const create = async (data: { units: UnitVariableIdConflicts[]; exportFormat: 'xml' | 'json' }) => {
    await TestBed.configureTestingModule({
      imports: [VariableIdConflictsComponent, TranslateModule.forRoot()],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: data }]
    }).compileComponents();

    fixture = TestBed.createComponent(VariableIdConflictsComponent);
    fixture.detectChanges();
  };

  it('lists the conflicts of each unit under its key and name (#2119)', async () => {
    await create({ units, exportFormat: 'xml' });
    const unitElements = fixture.debugElement.queryAll(By.css('[data-cy="variable-id-conflicts-unit"]'));

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

    expect((fixture.nativeElement as HTMLElement).querySelector('[data-cy="variable-id-conflicts-intro"]')
      ?.textContent?.trim()).toBe('unit-download.variable-id-conflicts.intro-json');
  });
});
