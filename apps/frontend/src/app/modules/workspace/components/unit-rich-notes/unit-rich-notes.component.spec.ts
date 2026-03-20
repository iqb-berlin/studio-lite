import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { createMock } from '@golevelup/ts-jest';
import { UnitRichNotesDto } from '@studio-lite-lib/api-dto';
import { UnitRichNotesComponent } from './unit-rich-notes.component';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';

describe('UnitRichNotesComponent', () => {
  let component: UnitRichNotesComponent;
  let fixture: ComponentFixture<UnitRichNotesComponent>;
  let workspaceServiceMock: jest.Mocked<WorkspaceService>;
  let workspaceBackendServiceMock: jest.Mocked<WorkspaceBackendService>;
  let dialogMock: jest.Mocked<MatDialog>;

  beforeEach(async () => {
    workspaceServiceMock = createMock<WorkspaceService>({
      userAccessLevel$: new BehaviorSubject<number>(2),
      isWorkspaceGroupAdmin$: new BehaviorSubject<boolean>(false),
      selectedUnit$: new BehaviorSubject<number>(10),
      selectedWorkspaceId: 1,
      richNoteTags: []
    });

    workspaceBackendServiceMock = createMock<WorkspaceBackendService>({
      getUnitRichNotes: jest.fn().mockReturnValue(of({ notes: [], tags: [] } as UnitRichNotesDto)),
      getUnitItems: jest.fn().mockReturnValue(of([]))
    });

    dialogMock = createMock<MatDialog>();

    await TestBed.configureTestingModule({
      imports: [
        UnitRichNotesComponent,
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WorkspaceService, useValue: workspaceServiceMock },
        { provide: WorkspaceBackendService, useValue: workspaceBackendServiceMock },
        { provide: MatDialog, useValue: dialogMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UnitRichNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set canWrite to true if user has write access', () => {
    workspaceServiceMock.userAccessLevel$.next(2);
    fixture.detectChanges();
    expect(component.canWrite).toBe(true);
  });

  it('should set canWrite to true if user is workspace group admin', () => {
    workspaceServiceMock.userAccessLevel$.next(1);
    workspaceServiceMock.isWorkspaceGroupAdmin$.next(true);
    fixture.detectChanges();
    expect(component.canWrite).toBe(true);
  });

  it('should set canWrite to false if user has no access', () => {
    workspaceServiceMock.userAccessLevel$.next(1);
    workspaceServiceMock.isWorkspaceGroupAdmin$.next(false);
    fixture.detectChanges();
    expect(component.canWrite).toBe(false);
  });

  it('should load notes on init', () => {
    expect(workspaceBackendServiceMock.getUnitRichNotes).toHaveBeenCalledWith(1, 10);
  });

  it('should open dialog when calling openNoteDialog', () => {
    component.canWrite = true;
    (dialogMock.open as jest.Mock).mockReturnValue({ afterClosed: () => of(null) });
    component.openNoteDialog();
    expect(dialogMock.open).toHaveBeenCalled();
  });
});
