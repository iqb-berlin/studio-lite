import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_DIALOG_DATA, MatDialogModule, MatDialogRef
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject } from 'rxjs';
import { WorkspaceGroupFullDto } from '@studio-lite-lib/api-dto';
import { WsgAdminService } from '../../modules/wsg-admin/services/wsg-admin.service';
import { MoveWorkspaceComponent, MoveComponentData } from './move-workspace.component';

describe('MoveWorkspaceComponent', () => {
  let component: MoveWorkspaceComponent;
  let fixture: ComponentFixture<MoveWorkspaceComponent>;
  let mockWsgAdminService: Partial<WsgAdminService>;
  let mockDialogRef: Partial<MatDialogRef<MoveWorkspaceComponent>>;

  const mockDialogData: MoveComponentData = {
    title: 'Move Workspace Title',
    warning: 'Move Warning',
    content: 'Move Content',
    default: '1',
    okButtonLabel: 'Move OK',
    workspaceGroups: [
      { id: 1, name: 'Group 1' } as WorkspaceGroupFullDto,
      { id: 2, name: 'Group 2' } as WorkspaceGroupFullDto,
      { id: 3, name: 'Group 3' } as WorkspaceGroupFullDto
    ],
    selectedRows: []
  };

  beforeEach(async () => {
    mockWsgAdminService = {
      selectedWorkspaceGroupId: new BehaviorSubject<number>(1)
    };

    mockDialogRef = {
      close: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatDialogModule,
        FormsModule,
        MatSelectModule,
        MoveWorkspaceComponent
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { ...mockDialogData, workspaceGroups: [...mockDialogData.workspaceGroups] }
        },
        { provide: WsgAdminService, useValue: mockWsgAdminService },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MoveWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter out the currently selected workspace group from typedData.workspaceGroups', () => {
    expect(component.typedData.workspaceGroups.length).toBe(2);
    expect(component.typedData.workspaceGroups.find(wsg => wsg.id === 1)).toBeUndefined();
    expect(component.typedData.workspaceGroups.find(wsg => wsg.id === 2)).toBeDefined();
    expect(component.typedData.workspaceGroups.find(wsg => wsg.id === 3)).toBeDefined();
  });

  it('should render the correct title, content, and warning', () => {
    const titleElement = fixture.debugElement.query(By.css('h1[mat-dialog-title]')).nativeElement;
    const contentElements = fixture.debugElement.queryAll(By.css('mat-dialog-content p'));

    expect(titleElement.textContent).toContain(mockDialogData.title);
    expect(contentElements[0].nativeElement.textContent).toContain(mockDialogData.content);
    expect(contentElements[1].nativeElement.textContent).toContain(mockDialogData.warning);
  });

  it('should populate mat-select with filtered workspace groups', async () => {
    const selectTrigger = fixture.debugElement.query(By.css('mat-select')).nativeElement;
    selectTrigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const options = document.querySelectorAll('mat-option');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Group 2');
    expect(options[1].textContent).toContain('Group 3');
  });

  it('should close the dialog with the selected value when OK button is clicked', () => {
    component.selectedValue = '2';
    fixture.detectChanges();

    const okButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    okButton.click();

    expect(mockDialogRef.close).toHaveBeenCalledWith('2');
  });

  it('should close the dialog with false when Cancel button is clicked', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const cancelButton = buttons.find(btn => {
      const text = btn.nativeElement.textContent.trim();
      const close = btn.nativeElement.getAttribute('mat-dialog-close');
      return text === 'cancel' || close === 'false';
    });

    expect(cancelButton).toBeDefined();
    cancelButton!.nativeElement.click();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should handle cases where there are no workspace groups', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatDialogModule,
        FormsModule,
        MatSelectModule,
        MoveWorkspaceComponent
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { ...mockDialogData, workspaceGroups: [] } },
        { provide: WsgAdminService, useValue: mockWsgAdminService },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MoveWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.typedData.workspaceGroups.length).toBe(0);
    const select = fixture.debugElement.query(By.css('mat-select'));
    expect(select).toBeNull();

    const actions = fixture.debugElement.query(By.css('mat-dialog-actions'));
    expect(actions.nativeElement.classList.contains('center')).toBeTruthy();
  });
});
