import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitPrintHeaderComponent } from './unit-print-header.component';

describe('UnitPrintHeaderComponent', () => {
  let component: UnitPrintHeaderComponent;
  let fixture: ComponentFixture<UnitPrintHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitPrintHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPrintHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
