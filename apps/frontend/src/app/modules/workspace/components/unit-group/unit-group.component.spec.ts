import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject } from 'rxjs';
import { UnitGroupComponent } from './unit-group.component';

describe('UnitGroupComponent', () => {
  let component: UnitGroupComponent;
  let fixture: ComponentFixture<UnitGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatIconModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitGroupComponent);
    component = fixture.componentInstance;
    component.expandAll = new BehaviorSubject<boolean>(true);
    fixture.detectChanges();
  });

  // The button that collapses the group was announced as expanding it (#2231).
  it('emits expandedChange when toggling via button, and names what the button does', () => {
    component.expanded = false;
    component.count = 3;
    fixture.detectChanges();

    jest.spyOn(component.expandedChange, 'emit');

    const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe('accordion.expand');
    button?.click();
    fixture.detectChanges();

    expect(component.expanded).toBe(true);
    expect(component.expandedChange.emit).toHaveBeenCalledWith(true);
    expect(fixture.nativeElement.querySelector('button')?.getAttribute('aria-label')).toBe('accordion.collapse');
  });
});
