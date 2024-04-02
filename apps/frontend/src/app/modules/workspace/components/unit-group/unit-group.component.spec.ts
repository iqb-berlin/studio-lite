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
});
