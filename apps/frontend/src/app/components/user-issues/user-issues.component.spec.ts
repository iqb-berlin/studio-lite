import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { UserIssuesComponent } from './user-issues.component';

describe('UserIssuesComponent', () => {
  let component: UserIssuesComponent;
  let fixture: ComponentFixture<UserIssuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Home answers its own auth-data request with new, equal objects; a click on a link being
  // replaced in that moment went nowhere (#1822)
  it('should keep its links when the same issues arrive as new objects', () => {
    component.issues = [{ link: '/a/1', name: 'Arbeitsbereich 1' }];
    fixture.detectChanges();
    const linkBefore = fixture.nativeElement.querySelector('a.issue-item');

    component.issues = [{ link: '/a/1', name: 'Arbeitsbereich 1' }];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a.issue-item')).toBe(linkBefore);
  });
});
