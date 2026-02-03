import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { AccountActionComponent } from './account-action.component';

describe('AccountActionComponent', () => {
  let component: AccountActionComponent;
  let fixture: ComponentFixture<AccountActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountActionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept changePassword type', () => {
    component.type = 'changePassword';
    component.iconName = 'vpn_key';
    fixture.detectChanges();

    expect(component.type).toBe('changePassword');
    expect(component.iconName).toBe('vpn_key');
  });

  it('should accept logout type', () => {
    component.type = 'logout';
    component.iconName = 'exit_to_app';
    fixture.detectChanges();

    expect(component.type).toBe('logout');
    expect(component.iconName).toBe('exit_to_app');
  });

  it('should accept editMyData type', () => {
    component.type = 'editMyData';
    component.iconName = 'edit';
    fixture.detectChanges();

    expect(component.type).toBe('editMyData');
    expect(component.iconName).toBe('edit');
  });

  it('should have type and iconName inputs', () => {
    expect(component.type).toBeUndefined();
    expect(component.iconName).toBeUndefined();
  });
});
