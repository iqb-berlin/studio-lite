import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { UnitGroupComponent } from './unit-group.component';

describe('UnitGroupComponent', () => {
  let component: UnitGroupComponent;
  let fixture: ComponentFixture<UnitGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitGroupComponent],
      imports: [
        TranslateModule.forRoot(),
        MatIconModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
