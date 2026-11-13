import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { VariableIdConflict } from '@studio-lite/shared-code';
import { VariableIdConflictFixComponent } from './variable-id-conflict-fix.component';

describe('VariableIdConflictFixComponent', () => {
  let fixture: ComponentFixture<VariableIdConflictFixComponent>;

  const create = async (conflicts: VariableIdConflict[]) => {
    await TestBed.configureTestingModule({
      imports: [VariableIdConflictFixComponent, TranslateModule.forRoot()]
    }).compileComponents();
    fixture = TestBed.createComponent(VariableIdConflictFixComponent);
    fixture.componentRef.setInput('conflicts', conflicts);
    fixture.detectChanges();
  };
  const ways = () => Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll('.way-title'),
    title => title.textContent?.trim()
  );

  it('offers to give an element a new id only where an element is involved', async () => {
    await create([{
      id: 'd_2',
      variables: [{ kind: 'derived', id: 'd_1', alias: 'd_2' }, { kind: 'derived', id: 'd_2' }]
    }]);

    expect(ways()).toEqual(['variable-id-conflicts.rename-derived.title']);
  });

  it('offers both ways where an element is involved', async () => {
    await create([{
      id: '05',
      variables: [{ kind: 'base', id: '05', alias: '_00a' }, { kind: 'derived', id: 'd_1', alias: '05' }]
    }]);

    expect(ways()).toEqual([
      'variable-id-conflicts.keep-derived.title',
      'variable-id-conflicts.rename-derived.title'
    ]);
  });
});
