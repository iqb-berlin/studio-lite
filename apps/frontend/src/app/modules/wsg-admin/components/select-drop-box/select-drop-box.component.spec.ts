import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceInListDto } from '@studio-lite-lib/api-dto';
import { SelectDropBoxComponent } from './select-drop-box.component';

describe('SelectDropBoxComponent', () => {
  let component: SelectDropBoxComponent;
  let fixture: ComponentFixture<SelectDropBoxComponent>;

  const mockDialogData = {
    workspaces: [{ id: 1, name: 'ws1', groupId: 1 }] as WorkspaceInListDto[],
    dropBoxId: 10,
    selectedWorkspaceName: 'ws1'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SelectDropBoxComponent,
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectDropBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize with data', () => {
    expect(component).toBeTruthy();
    expect(component.workspaces).toEqual(mockDialogData.workspaces);
    expect(component.dropBoxId).toBe(mockDialogData.dropBoxId);
    expect(component.selectedWorkspaceName).toBe(mockDialogData.selectedWorkspaceName);
  });
});
