import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { UserMenuComponent } from './user-menu.component';

describe('UserMenuComponent', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture<UserMenuComponent>;

  @Component({ selector: 'studio-lite-user-menu-action', template: '' })
  class MockStudioLiteUserMenuActionComponent {
    @Input() type!: string;
    @Input() iconName!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UserMenuComponent,
        MockStudioLiteUserMenuActionComponent
      ],
      imports: [
        MatIconModule,
        MatMenuModule,
        TranslateModule.forRoot()
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
