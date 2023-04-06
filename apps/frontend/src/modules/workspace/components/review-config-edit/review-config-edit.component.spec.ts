import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { ReviewConfigEditComponent } from './review-config-edit.component';

describe('ReviewConfigEditComponent', () => {
  let component: ReviewConfigEditComponent;
  let fixture: ComponentFixture<ReviewConfigEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewConfigEditComponent],
      imports: [
        FormsModule,
        MatCheckboxModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewConfigEditComponent);
    component = fixture.componentInstance;
    component.config = undefined;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
