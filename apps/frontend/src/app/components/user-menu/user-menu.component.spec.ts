// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { UserMenuComponent } from './user-menu.component';
import { AuthService } from '../../../../../api/src/app/auth/service/auth.service';

class MockAuthService {

}
describe('UserMenuComponent', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture<UserMenuComponent>;

  @Component({ selector: 'studio-lite-account-action', template: '' })
  class MockAccountActionComponentComponent {
    @Input() type!: string;
    @Input() iconName!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockAccountActionComponentComponent],
      imports: [
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
        HttpClientModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: AuthService,
          useClass: MockAuthService
        },
        {
          provide: 'SERVER_URL',
          useValue: 'http://localhost:3333'
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
