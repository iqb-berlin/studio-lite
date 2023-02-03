import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserMenuComponent } from './user-menu.component';

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
        UserMenuComponent,
        MockAccountActionComponentComponent
      ],
      imports: [
        MatTooltipModule,
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
