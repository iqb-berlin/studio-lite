import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitGroupsComponent } from './unit-groups.component';

describe('UnitGroupsComponent', () => {
  let component: UnitGroupsComponent;
  let fixture: ComponentFixture<UnitGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitGroupsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
