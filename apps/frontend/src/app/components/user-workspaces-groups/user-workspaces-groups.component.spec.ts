import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceDto, WorkspaceGroupDto } from '@studio-lite-lib/api-dto';
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

  // Home answers its own auth-data request with new, equal objects; a click on a link being
  // replaced in that moment went nowhere (#1822)
  it('should keep the workspace links when the same groups arrive as new objects', () => {
    const groups = (): WorkspaceGroupDto[] => [{
      id: 1, name: 'Group 1', isAdmin: false, workspaces: [{ id: 7, name: 'WS 7' } as WorkspaceDto]
    }];
    component.workspaceGroups = groups();
    fixture.detectChanges();
    const linkBefore = fixture.nativeElement.querySelector('a.issue-item');
    expect(linkBefore).not.toBeNull();

    component.workspaceGroups = groups();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a.issue-item')).toBe(linkBefore);
  });
});
