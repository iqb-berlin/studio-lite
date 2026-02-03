import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { UserIssuesComponent } from './user-issues.component';
import { UserIssue } from '../../models/user-issue.interface';

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept issues input', () => {
    const testIssues: UserIssue[] = [
      { link: '/issue/1', name: 'Issue 1' },
      { link: '/issue/2', name: 'Issue 2' }
    ];

    component.issues = testIssues;
    fixture.detectChanges();

    expect(component.issues).toEqual(testIssues);
    expect(component.issues.length).toBe(2);
  });

  it('should accept empty issues array', () => {
    component.issues = [];
    fixture.detectChanges();

    expect(component.issues).toEqual([]);
    expect(component.issues.length).toBe(0);
  });

  it('should handle single issue', () => {
    component.issues = [
      { link: '/workspace/1', name: 'Workspace Issue' }
    ];
    fixture.detectChanges();

    expect(component.issues.length).toBe(1);
    expect(component.issues[0].name).toBe('Workspace Issue');
    expect(component.issues[0].link).toBe('/workspace/1');
  });

  it('should handle multiple issues', () => {
    component.issues = [
      { link: '/workspace/1', name: 'First Issue' },
      { link: '/workspace/2', name: 'Second Issue' },
      { link: '/admin/3', name: 'Third Issue' }
    ];
    fixture.detectChanges();

    expect(component.issues.length).toBe(3);
    expect(component.issues[0].name).toBe('First Issue');
    expect(component.issues[1].name).toBe('Second Issue');
    expect(component.issues[2].name).toBe('Third Issue');
  });

  it('should handle issues with various link formats', () => {
    component.issues = [
      { link: '/workspace/123', name: 'Workspace' },
      { link: '/admin', name: 'Admin' },
      { link: '/review/456', name: 'Review' }
    ];
    fixture.detectChanges();

    expect(component.issues[0].link).toBe('/workspace/123');
    expect(component.issues[1].link).toBe('/admin');
    expect(component.issues[2].link).toBe('/review/456');
  });
});
