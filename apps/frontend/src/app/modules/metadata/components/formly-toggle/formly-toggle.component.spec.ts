import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormlyToggleComponent } from './formly-toggle.component';

describe('FormlyToggleComponent', () => {
  let component: FormlyToggleComponent;
  let fixture: ComponentFixture<FormlyToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormlyToggleComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormlyToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
