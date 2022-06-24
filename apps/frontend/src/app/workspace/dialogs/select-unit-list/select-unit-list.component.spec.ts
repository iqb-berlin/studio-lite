import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectUnitListComponent } from './select-unit-list.component';

describe('SelectUnitListComponent', () => {
  let component: SelectUnitListComponent;
  let fixture: ComponentFixture<SelectUnitListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectUnitListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectUnitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
