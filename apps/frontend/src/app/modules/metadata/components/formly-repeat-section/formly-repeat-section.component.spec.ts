import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormlyRepeatSectionComponent } from './formly-repeat-section.component';

describe('FormlyRepeatSectionComponent', () => {
  let component: FormlyRepeatSectionComponent;
  let fixture: ComponentFixture<FormlyRepeatSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormlyRepeatSectionComponent],
      imports: [
        MatIconModule,
        MatButtonModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormlyRepeatSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
