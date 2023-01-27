import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMenuActionComponent } from './user-menu-action.component';

describe('UserMenuActionComponent', () => {
  let component: UserMenuActionComponent;
  let fixture: ComponentFixture<UserMenuActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserMenuActionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenuActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
