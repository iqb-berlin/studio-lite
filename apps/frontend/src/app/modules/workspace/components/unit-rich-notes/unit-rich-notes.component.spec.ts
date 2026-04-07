import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import {
  UnitRichNoteDto, UnitRichNotesDto, UnitRichNoteTagDto
} from '@studio-lite-lib/api-dto';
import { UnitRichNotesComponent } from './unit-rich-notes.component';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { UnitRichNoteNodeComponent } from '../unit-rich-note-node/unit-rich-note-node.component';

describe('UnitRichNotesComponent', () => {
  let component: UnitRichNotesComponent;
  let fixture: ComponentFixture<UnitRichNotesComponent>;
  let workspaceServiceMock: DeepMocked<WorkspaceService>;
  let workspaceBackendServiceMock: DeepMocked<WorkspaceBackendService>;
  let dialogMock: DeepMocked<MatDialog>;

  const mockTags: UnitRichNoteTagDto[] = [
    { id: 't1', label: [{ lang: 'de', value: 'T1' }], children: [] }
  ];

  beforeEach(async () => {
    workspaceServiceMock = createMock<WorkspaceService>({
      userAccessLevel$: new BehaviorSubject<number>(2),
      isWorkspaceGroupAdmin$: new BehaviorSubject<boolean>(false),
      selectedUnit$: new BehaviorSubject<number>(10),
      selectedWorkspaceId: 1,
      richNoteTags$: new BehaviorSubject<UnitRichNoteTagDto[]>(mockTags),
      richNoteTags: mockTags
    });

    workspaceBackendServiceMock = createMock<WorkspaceBackendService>({
      getUnitRichNotes: jest.fn().mockReturnValue(of({ notes: [], tags: [] } as UnitRichNotesDto)),
      getUnitItems: jest.fn().mockReturnValue(of([]))
    });

    dialogMock = createMock<MatDialog>();

    await TestBed.configureTestingModule({
      imports: [
        UnitRichNotesComponent,
        UnitRichNoteNodeComponent,
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

  it('should rebuild display nodes when notes are loaded', () => {
    const notes = [{
      id: 1, tagId: 't1', content: 'test', unitId: 10
    }];
    workspaceBackendServiceMock.getUnitRichNotes.mockReturnValue(of({ notes, tags: mockTags } as UnitRichNotesDto));

    // Trigger re-load
    workspaceServiceMock.selectedUnit$.next(10);
    fixture.detectChanges();

    expect(component.notes.length).toBe(1);
    expect(component.displayNodes.length).toBe(1);
    expect(component.displayNodes[0].tagId).toBe('t1');
  });

  it('should group notes with invalid tagIds into an "unassigned" node', () => {
    const notes = [
      {
        id: 1, tagId: 't1', content: 'valid', unitId: 10
      },
      {
        id: 2, tagId: 'invalid-tag', content: 'invalid', unitId: 10
      }
    ];
    (component as unknown as { notes: UnitRichNoteDto[] }).notes = notes as UnitRichNoteDto[];
    component.rebuildDisplayNodes();

    expect(component.displayNodes.length).toBe(2);
    expect(component.displayNodes[0].tagId).toBe('t1');
    expect(component.displayNodes[1].tagId).toBe('unassigned');
    expect(component.displayNodes[1].notes.length).toBe(1);
    expect(component.displayNodes[1].notes[0].id).toBe(2);
  });
});
