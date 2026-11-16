import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { VariableIdConflictListComponent } from './variable-id-conflict-list.component';

describe('VariableIdConflictListComponent', () => {
  let fixture: ComponentFixture<VariableIdConflictListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariableIdConflictListComponent, TranslateModule.forRoot()]
    }).compileComponents();
    fixture = TestBed.createComponent(VariableIdConflictListComponent);
  });

  // The element is named by the alias the editor shows, not by the internal id nobody can see there
  it('names each conflict by the names the authors see (#2119)', () => {
    fixture.componentRef.setInput('conflicts', [{
      id: '05',
      variables: [
        { kind: 'base', id: '05', alias: '_00a' },
        { kind: 'derived', id: 'd_1790938214783', alias: '05' }
      ]
    }]);
    fixture.detectChanges();
    const conflict = (fixture.nativeElement as HTMLElement).querySelector('[data-cy="variable-id-conflict"]');

    const names = Array.from(conflict?.querySelectorAll('.name') ?? [], name => name.textContent?.trim());
    expect(names).toEqual(['05', '_00a', '05']);
  });
});
