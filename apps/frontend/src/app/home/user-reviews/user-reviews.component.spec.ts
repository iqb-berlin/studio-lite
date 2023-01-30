import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { UserReviewsComponent } from './user-reviews.component';

describe('UserReviewsComponent', () => {
  let component: UserReviewsComponent;
  let fixture: ComponentFixture<UserReviewsComponent>;

  @Component({ selector: 'studio-lite-area-title', template: '' })
  class MockAreaTitleComponent {
    @Input() title!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UserReviewsComponent,
        MockAreaTitleComponent
      ],
      imports: [
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
