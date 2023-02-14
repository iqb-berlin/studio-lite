import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UnitDataComponent } from './unit-data.component';

describe('UnitDataComponent', () => {
  let component: UnitDataComponent;
  let fixture: ComponentFixture<UnitDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitDataComponent],
      imports: [RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
