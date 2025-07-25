// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceGroupDto } from '@studio-lite-lib/api-dto';
import { UserWorkspacesAreaComponent } from './user-workspaces-area.component';
import { environment } from '../../../environments/environment';
import { HomeComponent } from '../home/home.component';
import { AreaTitleComponent } from '../area-title/area-title.component';
import { WrappedIconComponent } from '../../modules/shared/components/wrapped-icon/wrapped-icon.component';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { WarningComponent } from '../warning/warning.component';
import { UserWorkspacesGroupsComponent } from '../user-workspaces-groups/user-workspaces-groups.component';
import { BackendService } from '../../services/backend.service';

describe('UserWorkspacesAreaComponent', () => {
  let component: UserWorkspacesAreaComponent;
  let fixture: ComponentFixture<UserWorkspacesAreaComponent>;

  @Component({ selector: 'studio-lite-user-menu', template: '', standalone: false })
  class MockUserMenuComponent {}

  @Component({ selector: 'studio-lite-user-workspaces-groups', template: '', standalone: false })
  class MockUserWorkspacesGroupsComponent {
    @Input() workspaceGroups!: WorkspaceGroupDto[];
  }

  @Component({ selector: 'studio-lite-warning', template: '', standalone: false })
  class MockWarningComponent {
    @Input() warnMessage!: string;
  }

  @Component({ selector: 'studio-lite-area-title', template: '', standalone: false })
  class MockAreaTitleComponent {
    @Input() title!: string;
  }

  @Component({ selector: 'studio-lite-wrapped-icon', template: '', standalone: false })
  class MockWrappedIconComponent {
    @Input() icon!: string;
  }

  class MockBackendService {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: BackendService,
          useValue: MockBackendService
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    }).overrideComponent(HomeComponent, {
      remove: {
        imports: [
          AreaTitleComponent,
          WrappedIconComponent,
          UserMenuComponent,
          WarningComponent,
          UserWorkspacesGroupsComponent
        ]
      },
      add: {
        imports: [
          MockUserMenuComponent,
          MockUserWorkspacesGroupsComponent,
          MockAreaTitleComponent,
          MockWarningComponent,
          MockWrappedIconComponent
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(UserWorkspacesAreaComponent);
    component = fixture.componentInstance;
    component.workspaceGroups = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
