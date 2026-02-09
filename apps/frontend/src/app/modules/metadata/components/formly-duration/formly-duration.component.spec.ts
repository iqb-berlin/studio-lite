import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormlyDurationComponent } from './formly-duration.component';

describe('FormlyDurationComponent', () => {
  let component: FormlyDurationComponent;
  let fixture: ComponentFixture<FormlyDurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        FormlyDurationComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormlyDurationComponent);
    component = fixture.componentInstance;

    (component as unknown as { field: { formControl: FormControl; props: Record<string, unknown> } }).field = {
      formControl: new FormControl(0),
      props: {}
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize duration from formControl value on ngOnInit', () => {
    component.formControl.setValue(125);
    component.ngOnInit();
    expect(component.duration).toEqual({ minutes: '02', seconds: '05' });
  });

  it('should update duration when formControl value changes', () => {
    component.formControl.setValue(65);
    fixture.detectChanges();
    expect(component.duration).toEqual({ minutes: '01', seconds: '05' });
  });

  it('should update formControl when durationChange is called', () => {
    component.duration = { minutes: '03', seconds: '10' };
    component.durationChange();
    expect(component.formControl.value).toBe(190);
  });

  it('should set min/max values correctly in setMinMaxValues', () => {
    component.props.minValue = 75;
    component.props.maxValue = 150;
    (component as unknown as { setMinMaxValues: () => void }).setMinMaxValues();

    expect(component.minMinutes).toBe(1);
    expect(component.minSeconds).toBe(0);
    expect(component.maxMinutes).toBe(2);
    expect(component.maxSeconds).toBe(60);
  });

  it('should handle small min values', () => {
    component.props.minValue = 45;
    (component as unknown as { setMinMaxValues: () => void }).setMinMaxValues();
    expect(component.minMinutes).toBe(0);
    expect(component.minSeconds).toBe(45);
  });
});
