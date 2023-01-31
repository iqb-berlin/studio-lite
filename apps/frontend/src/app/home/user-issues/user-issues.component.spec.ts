import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserIssuesComponent } from './user-issues.component';

describe('UserIssuesComponent', () => {
  let component: UserIssuesComponent;
  let fixture: ComponentFixture<UserIssuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserIssuesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
