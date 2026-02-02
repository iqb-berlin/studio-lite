// eslint-disable-next-line max-classes-per-file
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceGroupDto } from '@studio-lite-lib/api-dto';
import { UserWorkspacesAreaComponent } from './user-workspaces-area.component';

describe('UserWorkspacesAreaComponent', () => {
  let component: UserWorkspacesAreaComponent;
  let fixture: ComponentFixture<UserWorkspacesAreaComponent>;

  @Component({ selector: 'studio-lite-user-workspaces-groups', template: '', standalone: true })
  class MockUserWorkspacesGroupsComponent {
    @Input() workspaceGroups!: WorkspaceGroupDto[];
  }

  @Component({ selector: 'studio-lite-warning', template: '', standalone: true })
  class MockWarningComponent {
    @Input() warnMessage!: string;
  }

  @Component({ selector: 'studio-lite-area-title', template: '', standalone: true })
  class MockAreaTitleComponent {
    @Input() title!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MockUserWorkspacesGroupsComponent,
        MockWarningComponent,
        MockAreaTitleComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserWorkspacesAreaComponent);
    component = fixture.componentInstance;
    component.workspaceGroups = [];
    component.warning = '';
    component.isAdmin = false;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should accept workspaceGroups input', () => {
    component.workspaceGroups = [{
      id: 1, name: 'Group 1', workspaces: [], isAdmin: false
    }];
    fixture.detectChanges();

    expect(component.workspaceGroups.length).toBe(1);
  });

  it('should accept warning input', () => {
    component.warning = 'Test warning message';
    fixture.detectChanges();

    expect(component.warning).toBe('Test warning message');
  });

  it('should accept isAdmin input', () => {
    component.isAdmin = true;
    fixture.detectChanges();

    expect(component.isAdmin).toBe(true);
  });

  it('should handle empty workspaceGroups array', () => {
    component.workspaceGroups = [];
    fixture.detectChanges();

    expect(component.workspaceGroups).toEqual([]);
    expect(component.workspaceGroups.length).toBe(0);
  });

  it('should handle multiple workspace groups', () => {
    component.workspaceGroups = [
      {
        id: 1, name: 'Group 1', workspaces: [], isAdmin: false
      },
      {
        id: 2, name: 'Group 2', workspaces: [], isAdmin: true
      },
      {
        id: 3, name: 'Group 3', workspaces: [], isAdmin: false
      }
    ];
    fixture.detectChanges();

    expect(component.workspaceGroups.length).toBe(3);
  });

  it('should handle empty warning string', () => {
    component.warning = '';
    fixture.detectChanges();

    expect(component.warning).toBe('');
  });

  it('should handle isAdmin as false', () => {
    component.isAdmin = false;
    fixture.detectChanges();

    expect(component.isAdmin).toBe(false);
  });

  it('should accept all inputs together', () => {
    component.workspaceGroups = [{
      id: 1, name: 'Test Group', workspaces: [], isAdmin: true
    }];
    component.warning = 'Important warning';
    component.isAdmin = true;
    fixture.detectChanges();

    expect(component.workspaceGroups.length).toBe(1);
    expect(component.warning).toBe('Important warning');
    expect(component.isAdmin).toBe(true);
  });
});
