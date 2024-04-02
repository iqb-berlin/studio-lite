// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { ReviewComponent } from './review.component';

describe('ReviewComponent', () => {
  let component: ReviewComponent;
  let fixture: ComponentFixture<ReviewComponent>;

  @Component({ selector: 'studio-lite-unit-nav', template: '' })
  class MockUnitNav {}

  @Component({ selector: 'studio-lite-add-comment-button', template: '' })
  class MockAddCommentButton {
    @Input() showOthersComments!: boolean;
    @Input() unitDbId!: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockUnitNav,
        MockAddCommentButton
      ],
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule,
        HttpClientModule,
        MatButtonModule,
        MatDialogModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
