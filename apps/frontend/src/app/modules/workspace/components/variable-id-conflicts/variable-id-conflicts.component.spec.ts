import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { UnitVariableIdConflicts, VariableIdConflictsComponent } from './variable-id-conflicts.component';

describe('VariableIdConflictsComponent', () => {
  let fixture: ComponentFixture<VariableIdConflictsComponent>;

  const units: UnitVariableIdConflicts[] = [{
    key: 'GL_NC08',
    name: 'Markieren',
    conflicts: [{
      id: '05',
      variables: [
        { kind: 'base', id: '05', alias: '_00a' },
        { kind: 'derived', id: 'd_1790938214783', alias: '05' }
      ]
    }]
  }];

  const create = async (data: { units: UnitVariableIdConflicts[]; exportFormat: 'xml' | 'json' }) => {
    await TestBed.configureTestingModule({
      imports: [VariableIdConflictsComponent, TranslateModule.forRoot()],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: data }]
    }).compileComponents();

    fixture = TestBed.createComponent(VariableIdConflictsComponent);
    fixture.detectChanges();
  };
  const ways = () => Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll('.way-title'),
    title => title.textContent?.trim()
  );

  // The element is named by the alias the editor shows, not by the internal id nobody can see there
  it('names each conflict by the names the authors see (#2119)', async () => {
    await create({ units, exportFormat: 'xml' });
    const element = fixture.nativeElement as HTMLElement;
    const unit = element.querySelector('[data-cy="variable-id-conflicts-unit"]');
    const conflict = element.querySelector('[data-cy="variable-id-conflict"]');

    expect(unit?.textContent).toContain('GL_NC08');
    expect(unit?.textContent).toContain('Markieren');
    const names = Array.from(conflict?.querySelectorAll('.name') ?? [], name => name.textContent?.trim());
    expect(names).toEqual(['05', '_00a', '05']);
  });

  it('offers to give an element a new id only where an element is involved', async () => {
    await create({
      units: [{
        key: 'U1',
        conflicts: [{
          id: 'd_2',
          variables: [{ kind: 'derived', id: 'd_1', alias: 'd_2' }, { kind: 'derived', id: 'd_2' }]
        }]
      }],
      exportFormat: 'xml'
    });

    expect(ways()).toEqual(['unit-download.variable-id-conflicts.rename-derived.title']);
  });

  it('offers both ways where an element is involved', async () => {
    await create({ units, exportFormat: 'xml' });

    expect(ways()).toEqual([
      'unit-download.variable-id-conflicts.keep-derived.title',
      'unit-download.variable-id-conflicts.rename-derived.title'
    ]);
  });

  // The Testcenter takes only the XML; a JSON export is read by other programs
  it('names the consequence of the chosen format', async () => {
    await create({ units, exportFormat: 'json' });

    expect((fixture.nativeElement as HTMLElement).querySelector('[data-cy="variable-id-conflicts-intro"]')
      ?.textContent?.trim()).toBe('unit-download.variable-id-conflicts.intro-json');
  });
});
