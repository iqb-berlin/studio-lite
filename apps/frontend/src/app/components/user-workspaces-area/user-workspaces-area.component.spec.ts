// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { WorkspaceGroupDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { createMock } from '@golevelup/ts-jest';
import { UserWorkspacesAreaComponent } from './user-workspaces-area.component';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../../../api/src/app/auth/service/auth.service';

describe('UserWorkspacesAreaComponent', () => {
  let component: UserWorkspacesAreaComponent;
  let fixture: ComponentFixture<UserWorkspacesAreaComponent>;

  @Component({ selector: 'studio-lite-user-menu', template: '' })
  class MockUserMenuComponent {}

  @Component({ selector: 'studio-lite-user-workspaces-groups', template: '' })
  class MockUserWorkspacesGroupsComponent {
    @Input() workspaceGroups!: WorkspaceGroupDto[];
  }

  @Component({ selector: 'studio-lite-warning', template: '' })
  class MockWarningComponent {
    @Input() warnMessage!: string;
  }

  @Component({ selector: 'studio-lite-area-title', template: '' })
  class MockAreaTitleComponent {
    @Input() title!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockUserMenuComponent,
        MockUserWorkspacesGroupsComponent,
        MockAreaTitleComponent,
        MockWarningComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        HttpClientModule
      ],
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        }, {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    }).compileComponents();

    fixture = TestBed.createComponent(UserWorkspacesAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
