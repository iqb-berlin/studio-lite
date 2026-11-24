import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VariableIdConflictListComponent } from './variable-id-conflict-list.component';

describe('VariableIdConflictListComponent', () => {
  let fixture: ComponentFixture<VariableIdConflictListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariableIdConflictListComponent, TranslateModule.forRoot()]
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', {
      'variable-id-conflicts': {
        'stands-for': 'Die ID „{{id}}“ stünde für:',
        base: 'das Element „{{name}}“',
        derived: 'die abgeleitete Variable „{{name}}“'
      }
    });
    translate.use('de');
    fixture = TestBed.createComponent(VariableIdConflictListComponent);
  });

  // The element is named by the alias the editor shows, not by the internal id nobody can see there;
  // each line is one sentence with the name in it, as the word order differs between languages (#2135)
  it('names each conflict by the names the authors see (#2119)', () => {
    fixture.componentRef.setInput('conflicts', [{
      id: '05',
      variables: [
        { kind: 'base', id: '05', alias: '_00a' },
        { kind: 'derived', id: 'd_1790938214783', alias: '05' }
      ]
    }]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const conflict = element.querySelector('[data-cy="variable-id-conflict"]');

    expect(conflict?.firstChild?.textContent?.trim()).toBe('Die ID „05“ stünde für:');
    expect(Array.from(
      element.querySelectorAll('[data-cy="variable-id-conflict-variable"]'),
      line => line.textContent?.trim()
    )).toEqual(['das Element „_00a“', 'die abgeleitete Variable „05“']);
  });
});
