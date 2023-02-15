import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UnitDataAreaComponent } from './unit-data-area.component';

describe('UnitDataAreaComponent', () => {
  let component: UnitDataAreaComponent;
  let fixture: ComponentFixture<UnitDataAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitDataAreaComponent],
      imports: [RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitDataAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
