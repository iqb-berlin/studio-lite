import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagingModeSelectionComponent } from './paging-mode-selection.component';

describe('PagingModeSelectionComponent', () => {
  let component: PagingModeSelectionComponent;
  let fixture: ComponentFixture<PagingModeSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PagingModeSelectionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PagingModeSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
