// eslint-disable-next-line max-classes-per-file
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UserMenuComponent } from './user-menu.component';
import { WrappedIconComponent } from '../../modules/shared/components/wrapped-icon/wrapped-icon.component';
import { AccountActionComponent } from '../account-action/account-action.component';
import { ChangePasswordDirective } from '../../directives/change-password.directive';
import { EditMyDataDirective } from '../../directives/edit-my-data.directive';
import { LogoutDirective } from '../../directives/logout.directive';
import { AppService } from '../../services/app.service';

describe('UserMenuComponent', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture<UserMenuComponent>;
  let appService: AppService;

  @Component({ selector: 'studio-lite-account-action', standalone: true, template: '' })
  class MockAccountActionComponent {
    @Input() type!: string;
    @Input() iconName!: string;
  }

  @Component({ selector: 'studio-lite-wrapped-icon', standalone: true, template: '' })
  class MockWrappedIconComponent {
    @Input() icon!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserMenuComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: 'APP_VERSION',
          useValue: '1.2.3'
        }
      ]
    }).overrideComponent(UserMenuComponent, {
      remove: {
        imports: [
          WrappedIconComponent,
          AccountActionComponent,
          ChangePasswordDirective,
          EditMyDataDirective,
          LogoutDirective
        ]
      },
      add: { imports: [MockAccountActionComponent, MockWrappedIconComponent] }
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
    appService = TestBed.inject(AppService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have injected APP_VERSION', () => {
    expect(component.appVersion).toBe('1.2.3');
  });

  it('should have appService injected', () => {
    expect(component.appService).toBeTruthy();
    expect(component.appService).toBeInstanceOf(AppService);
  });

  it('should initialize userName from appService authData', () => {
    expect(component.userName).toBe(appService.authData.userName);
  });

  it('should initialize userLongName from appService authData', () => {
    expect(component.userLongName).toBe(appService.authData.userLongName);
  });

  it('should set isUserLoggedIn to true when userId is greater than 0', () => {
    appService.authData = { ...appService.authData, userId: 1 };
    const newComponent = new UserMenuComponent(appService, '1.0.0');

    expect(newComponent.isUserLoggedIn).toBe(true);
  });

  it('should set isUserLoggedIn to false when userId is 0', () => {
    appService.authData = { ...appService.authData, userId: 0 };
    const newComponent = new UserMenuComponent(appService, '1.0.0');

    expect(newComponent.isUserLoggedIn).toBe(false);
  });

  it('should initialize isAdmin from appService authData', () => {
    expect(component.isAdmin).toBe(appService.authData.isAdmin);
  });

  it('should set hasReviews to true when reviews array has items', () => {
    const mockReview = {
      id: 1, name: 'Review 1', workspaceId: 1
    };
    appService.authData = { ...appService.authData, reviews: [mockReview] };
    const newComponent = new UserMenuComponent(appService, '1.0.0');

    expect(newComponent.hasReviews).toBe(true);
  });

  it('should set hasReviews to false when reviews array is empty', () => {
    appService.authData = { ...appService.authData, reviews: [] };
    const newComponent = new UserMenuComponent(appService, '1.0.0');

    expect(newComponent.hasReviews).toBe(false);
  });
});
