import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitMetaDataComponent } from './unit-meta-data.component';

describe('UnitPrintHeaderComponent', () => {
  let component: UnitMetaDataComponent;
  let fixture: ComponentFixture<UnitMetaDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitMetaDataComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitMetaDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
