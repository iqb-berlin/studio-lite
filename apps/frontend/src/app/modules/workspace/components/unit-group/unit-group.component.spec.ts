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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates expanded when expandAll emits', () => {
    component.expanded = false;
    component.expandAll.next(true);

    expect(component.expanded).toBe(true);
  });

  it('emits expandedChange when toggling via button', () => {
    component.expanded = false;
    component.count = 3;
    fixture.detectChanges();

    jest.spyOn(component.expandedChange, 'emit');

    const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('button');
    expect(button).not.toBeNull();
    button?.click();

    expect(component.expanded).toBe(true);
    expect(component.expandedChange.emit).toHaveBeenCalledWith(true);
  });
});
