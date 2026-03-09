import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserFullDto } from '@studio-lite-lib/api-dto';
import { UntypedFormGroup, FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { MessageDialogComponent } from '@studio-lite-lib/iqb-components';
import { Component, Input } from '@angular/core';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { UsersMenuComponent } from './users-menu.component';
import { WrappedIconComponent } from '../../../../components/wrapped-icon/wrapped-icon.component';

describe('UsersMenuComponent', () => {
  let component: UsersMenuComponent;
  let fixture: ComponentFixture<UsersMenuComponent>;
  let mockDialog: Partial<MatDialog>;

  @Component({ selector: 'studio-lite-wrapped-icon', template: '', standalone: true })
  class MockWrappedIconComponent {
    @Input() icon!: string;
  }

  beforeEach(async () => {
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })
    };

    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot(),
        UsersMenuComponent,
        MockWrappedIconComponent
      ],
      providers: [
        { provide: MatDialog, useValue: mockDialog }
      ]
    })
      .overrideComponent(UsersMenuComponent, {
        remove: { imports: [WrappedIconComponent] },
        add: { imports: [MockWrappedIconComponent] }
      })
      .compileComponents();

    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant')
      .mockImplementation((key: string | string[]) => key as string);

    fixture = TestBed.createComponent(UsersMenuComponent);
    component = fixture.componentInstance;
    component.selectedRows = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open edit user dialog for adding user and emit event on success', () => {
    const mockFormGroup = new UntypedFormGroup({});
    (mockDialog.open as jest.Mock).mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(of(mockFormGroup))
    });
    const emitSpy = jest.spyOn(component.userAdded, 'emit');

    component.addUser();

    expect(mockDialog.open).toHaveBeenCalledWith(EditUserComponent, expect.objectContaining({
      data: expect.objectContaining({ newUser: true })
    }));
    expect(emitSpy).toHaveBeenCalledWith(mockFormGroup);
  });

  it('should not emit event if add user dialog is closed without result', () => {
    (mockDialog.open as jest.Mock).mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(of(false))
    });
    const emitSpy = jest.spyOn(component.userAdded, 'emit');

    component.addUser();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should show error dialog if no user selected for editing', () => {
    component.selectedRows = [];
    component.editUser();
    expect(mockDialog.open).toHaveBeenCalledWith(MessageDialogComponent, expect.anything());
  });

  it('should open edit user dialog for editing and emit event on success', () => {
    const mockUser = { id: 1, name: 'test' } as UserFullDto;
    component.selectedRows = [mockUser];
    const mockFormGroup = new UntypedFormGroup({ name: new FormControl('new') });
    (mockDialog.open as jest.Mock).mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(of(mockFormGroup))
    });
    const emitSpy = jest.spyOn(component.userEdited, 'emit');

    component.editUser();

    expect(mockDialog.open).toHaveBeenCalledWith(EditUserComponent, expect.objectContaining({
      data: expect.objectContaining({ newUser: false, name: 'test' })
    }));
    expect(emitSpy).toHaveBeenCalledWith({ selection: [mockUser], user: mockFormGroup });
  });
});
