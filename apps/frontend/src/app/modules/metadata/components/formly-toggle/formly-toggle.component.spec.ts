import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyToggleComponent } from './formly-toggle.component';

describe('FormlyToggleComponent', () => {
  let component: FormlyToggleComponent;
  let fixture: ComponentFixture<FormlyToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatSlideToggleModule,
        NoopAnimationsModule,
        FormlyModule.forRoot(),
        FormlyToggleComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormlyToggleComponent);
    component = fixture.componentInstance;

    (component as unknown as { field: { formControl: FormControl; props: Record<string, unknown> } }).field = {
      formControl: new FormControl(false),
      props: {}
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should focus slideToggle on container click', () => {
    const focusSpy = jest.spyOn(component.slideToggle, 'focus');
    const mouseEvent = new MouseEvent('click');
    component.onContainerClick(mouseEvent);
    expect(focusSpy).toHaveBeenCalled();
  });
});
