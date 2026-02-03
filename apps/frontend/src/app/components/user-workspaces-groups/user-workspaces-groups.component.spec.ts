import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserWorkspacesGroupsComponent } from './user-workspaces-groups.component';

describe('UserWorkspacesGroupsComponent', () => {
  let component: UserWorkspacesGroupsComponent;
  let fixture: ComponentFixture<UserWorkspacesGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(UserWorkspacesGroupsComponent);
    component = fixture.componentInstance;
    component.workspaceGroups = [];
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
    expect(component.workspaceGroups[0].name).toBe('Group 1');
    expect(component.workspaceGroups[1].name).toBe('Group 2');
    expect(component.workspaceGroups[2].name).toBe('Group 3');
  });

  it('should handle workspace groups with workspaces', () => {
    component.workspaceGroups = [
      {
        id: 1,
        name: 'Test Group',
        isAdmin: true,
        workspaces: [
          {
            id: 10, name: 'Workspace 1', userAccessLevel: 1
          },
          {
            id: 11, name: 'Workspace 2', userAccessLevel: 2
          }
        ]
      }
    ];
    fixture.detectChanges();

    expect(component.workspaceGroups[0].workspaces.length).toBe(2);
  });

  it('should maintain workspace group structure', () => {
    component.workspaceGroups = [{
      id: 5, name: 'Test Group', workspaces: [], isAdmin: true
    }];
    fixture.detectChanges();

    expect(component.workspaceGroups[0].id).toBe(5);
    expect(component.workspaceGroups[0].name).toBe('Test Group');
    expect(component.workspaceGroups[0].workspaces).toEqual([]);
  });
});
