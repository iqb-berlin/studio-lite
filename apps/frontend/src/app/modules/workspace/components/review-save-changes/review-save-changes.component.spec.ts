import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { ReviewSaveChangesComponent } from './review-save-changes.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

describe('ReviewSaveChangesComponent', () => {
  let component: ReviewSaveChangesComponent;
  let fixture: ComponentFixture<ReviewSaveChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ReviewSaveChangesComponent,
        WrappedIconComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        MatIconModule,
        MatTooltipModule,
        MatButtonModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewSaveChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
