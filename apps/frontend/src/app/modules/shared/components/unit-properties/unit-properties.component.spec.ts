import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitPropertiesComponent } from './unit-properties.component';

describe('UnitPrintHeaderComponent', () => {
  let component: UnitPropertiesComponent;
  let fixture: ComponentFixture<UnitPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitPropertiesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
