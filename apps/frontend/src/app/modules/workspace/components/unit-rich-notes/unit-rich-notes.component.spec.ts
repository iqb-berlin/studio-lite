import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import {
  UnitRichNoteDto, UnitRichNotesDto, UnitRichNoteTagDto
} from '@studio-lite-lib/api-dto';
import { UnitRichNotesComponent } from './unit-rich-notes.component';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { RichNoteNode, UnitRichNoteNodeComponent } from '../unit-rich-note-node/unit-rich-note-node.component';
import { UnitRichNoteDialogComponent } from '../unit-rich-note-dialog/unit-rich-note-dialog.component';

describe('UnitRichNotesComponent', () => {
  let component: UnitRichNotesComponent;
  let fixture: ComponentFixture<UnitRichNotesComponent>;
  let workspaceServiceMock: DeepMocked<WorkspaceService>;
  let workspaceBackendServiceMock: DeepMocked<WorkspaceBackendService>;
  let dialogMock: DeepMocked<MatDialog>;
  let snackBarMock: DeepMocked<MatSnackBar>;
  // the tags the workspace holds; a test that needs others puts them in here
  let richNoteTags: UnitRichNoteTagDto[];

  const mockTags: UnitRichNoteTagDto[] = [
    { id: 't1', label: [{ lang: 'de', value: 'T1' }], children: [] }
  ];

  beforeEach(async () => {
    richNoteTags = [...mockTags];
    workspaceServiceMock = createMock<WorkspaceService>({
      userAccessLevel$: new BehaviorSubject<number>(2),
      isWorkspaceGroupAdmin$: new BehaviorSubject<boolean>(false),
      selectedUnit$: new BehaviorSubject<number>(10),
      selectedWorkspaceId: 1,
      richNoteTags$: new BehaviorSubject<UnitRichNoteTagDto[]>(mockTags),
      richNoteTags
    });

    workspaceBackendServiceMock = createMock<WorkspaceBackendService>({
      getUnitRichNotes: jest.fn().mockReturnValue(of({ notes: [], tags: [] } as UnitRichNotesDto)),
      getUnitItems: jest.fn().mockReturnValue(of([]))
    });

    dialogMock = createMock<MatDialog>();
    snackBarMock = createMock<MatSnackBar>();

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
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UnitRichNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

  it('should show no notes of the unit before when those of the next fail to load (#1952)', () => {
    const notes = [{
      id: 1, tagId: 't1', content: 'test', unitId: 10
    }] as UnitRichNoteDto[];
    workspaceBackendServiceMock.getUnitRichNotes.mockReturnValueOnce(of({ notes, tags: mockTags }));
    workspaceServiceMock.selectedUnit$.next(10);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('studio-lite-unit-rich-note-node').length).toBe(1);

    workspaceBackendServiceMock.getUnitRichNotes.mockReturnValueOnce(of(null));
    workspaceServiceMock.selectedUnit$.next(11);
    fixture.detectChanges();

    expect(element.querySelectorAll('studio-lite-unit-rich-note-node').length).toBe(0);
    expect(element.querySelector('[data-cy="unit-rich-notes-not-loaded"]')).not.toBeNull();
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

  const label = [{ lang: 'de', value: 'Tag' }];
  const tag = (id: string, children: UnitRichNoteTagDto[] = []): UnitRichNoteTagDto => ({ id, label, children });
  const note = (id: number, tagId: string, content = 'text'): UnitRichNoteDto => createMock<UnitRichNoteDto>({
    id, tagId, content, unitId: 10
  });
  type NodeShape = { tagId: string, notes: number[], children: NodeShape[] };
  const shapeOf = (nodes: RichNoteNode[]): NodeShape[] => nodes.map(node => ({
    tagId: node.tagId, notes: node.notes.map(n => n.id), children: shapeOf(node.children)
  }));
  const loadNotes = (tags: UnitRichNoteTagDto[], notes: UnitRichNoteDto[]) => {
    richNoteTags.splice(0, richNoteTags.length, ...tags);
    workspaceBackendServiceMock.getUnitRichNotes.mockReturnValue(of({ notes, tags }));
    workspaceServiceMock.selectedUnit$.next(10);
  };
  const closeDialogWith = (result: unknown) => dialogMock.open.mockReturnValue(
    createMock<MatDialogRef<unknown>>({ afterClosed: () => of(result) })
  );

  it('should show every top-level tag, and a tag further down only with a note somewhere under it', () => {
    loadNotes([tag('t1', [tag('t1.a', [tag('t1.a.x')]), tag('t1.b')]), tag('t2')], [note(1, 't1.a.x')]);

    expect(shapeOf(component.displayNodes)).toEqual([
      {
        tagId: 't1',
        notes: [],
        children: [{
          tagId: 't1.a', notes: [], children: [{ tagId: 't1.a.x', notes: [1], children: [] }]
        }]
      },
      { tagId: 't2', notes: [], children: [] }
    ]);
  });

  it.each([
    [2, false, true],
    [1, true, true],
    [1, false, false]
  ])('should let a user of access level %s, group admin %s, write notes: %s', (level, isAdmin, canWrite) => {
    (workspaceServiceMock.userAccessLevel$ as BehaviorSubject<number>).next(level);
    (workspaceServiceMock.isWorkspaceGroupAdmin$ as BehaviorSubject<boolean>).next(isAdmin);
    closeDialogWith(undefined);

    component.openNoteDialog();
    component.deleteNote(1);

    expect(dialogMock.open).toHaveBeenCalledTimes(canWrite ? 2 : 0);
  });

  it('should offer only the tags of its top-level tag for a note added under a tag', () => {
    const tags = [tag('t1', [tag('t1.a')]), tag('t2')];
    loadNotes(tags, []);
    closeDialogWith(undefined);

    component.openNoteDialog(undefined, 't1.a');

    expect(dialogMock.open).toHaveBeenCalledWith(UnitRichNoteDialogComponent, expect.objectContaining({
      data: expect.objectContaining({ note: { tagId: 't1.a' }, tags: [tags[0]] })
    }));
  });

  // The ids of a vocabulary are URLs: split at the first dot, they named no tag, and all were offered
  // (#2006).
  it('should offer only the tags of its top-level tag for a note added under a vocabulary tag', () => {
    const base = 'https://w3id.org/iqb/v06/t1';
    const tags = [tag(`${base}/transcript`, [tag(`${base}/original`)]), tag(`${base}/didactical_guide`)];
    loadNotes(tags, []);
    closeDialogWith(undefined);

    component.openNoteDialog(undefined, `${base}/original`);

    expect(dialogMock.open).toHaveBeenCalledWith(UnitRichNoteDialogComponent, expect.objectContaining({
      data: expect.objectContaining({ tags: [tags[0]] })
    }));
  });

  it('should save an edited note and show it as saved', () => {
    loadNotes(mockTags, [note(1, 't1', 'old')]);
    const edited = {
      id: 1, tagId: 't1', content: 'new', links: [], itemReferences: []
    };
    closeDialogWith(edited);
    workspaceBackendServiceMock.patchUnitRichNote.mockReturnValue(of(true));

    component.openNoteDialog(component.notes[0]);

    expect(workspaceBackendServiceMock.patchUnitRichNote).toHaveBeenCalledWith(1, 10, 1, edited);
    expect(component.displayNodes[0].notes[0].content).toBe('new');
  });

  it('should add a new note and show the notes as they are stored then', () => {
    loadNotes(mockTags, []);
    closeDialogWith({
      tagId: 't1', content: 'new', links: [], itemReferences: ['i1']
    });
    workspaceBackendServiceMock.addUnitRichNote.mockReturnValue(of(7));
    workspaceBackendServiceMock.getUnitRichNotes.mockReturnValue(of({ notes: [note(7, 't1', 'new')], tags: mockTags }));

    component.openNoteDialog(undefined, 't1');

    expect(workspaceBackendServiceMock.addUnitRichNote).toHaveBeenCalledWith(1, 10, expect.objectContaining({
      unitId: 10, tagId: 't1', content: 'new', links: [], itemReferences: ['i1']
    }));
    expect(shapeOf(component.displayNodes)).toEqual([{ tagId: 't1', notes: [7], children: [] }]);
  });

  it('should delete a note once the delete button confirms', () => {
    loadNotes(mockTags, [note(1, 't1'), note(2, 't1')]);
    closeDialogWith(true);
    workspaceBackendServiceMock.deleteUnitRichNote.mockReturnValue(of(true));

    component.deleteNote(1);

    expect(workspaceBackendServiceMock.deleteUnitRichNote).toHaveBeenCalledWith(1, 10, 1);
    expect(shapeOf(component.displayNodes)).toEqual([{ tagId: 't1', notes: [2], children: [] }]);
  });

  // The dialog is closed by the time the answer comes: the text was gone, and only the general error
  // box said that something failed (#2005).
  describe('when saving, deleting or loading the notes again fails', () => {
    const closeDialogWithOnce = (result: unknown) => dialogMock.open.mockReturnValueOnce(
      createMock<MatDialogRef<unknown>>({ afterClosed: () => of(result) })
    );
    const dialogNote = (call: number) => (dialogMock.open.mock.calls[call][1]?.data as { note?: unknown }).note;

    it('should say so and open the edited note again', () => {
      loadNotes(mockTags, [note(1, 't1', 'old')]);
      const edited = {
        id: 1, tagId: 't1', content: 'new', links: [], itemReferences: []
      };
      closeDialogWithOnce(edited);
      closeDialogWithOnce(undefined);
      workspaceBackendServiceMock.patchUnitRichNote.mockReturnValue(of(false));

      component.openNoteDialog(component.notes[0]);

      expect(snackBarMock.open).toHaveBeenCalledWith('workspace.rich-note-not-saved', 'error', { duration: 3000 });
      expect(dialogNote(1)).toEqual(edited);
      expect(component.displayNodes[0].notes[0].content).toBe('old');
    });

    it('should say so and open the new note again', () => {
      loadNotes(mockTags, []);
      const written = {
        tagId: 't1', content: 'new', links: [], itemReferences: ['i1']
      };
      closeDialogWithOnce(written);
      closeDialogWithOnce(undefined);
      workspaceBackendServiceMock.addUnitRichNote.mockReturnValue(of(null));

      component.openNoteDialog(undefined, 't1');

      expect(snackBarMock.open).toHaveBeenCalledWith('workspace.rich-note-not-saved', 'error', { duration: 3000 });
      expect(dialogNote(1)).toEqual(written);
    });

    // Stored, but not shown, a note invites a second save that stores it twice
    it('should show the stored note when the notes cannot be loaded again', () => {
      loadNotes(mockTags, []);
      closeDialogWith({
        tagId: 't1', content: 'new', links: [], itemReferences: []
      });
      workspaceBackendServiceMock.addUnitRichNote.mockReturnValue(of(7));
      workspaceBackendServiceMock.getUnitRichNotes.mockReturnValue(of(null));

      component.openNoteDialog(undefined, 't1');

      expect(shapeOf(component.displayNodes)).toEqual([{ tagId: 't1', notes: [7], children: [] }]);
      expect(component.displayNodes[0].notes[0].content).toBe('new');
    });

    // The notes loaded again for the unit the note was written for came after those of the unit
    // shown by then, and stood there in their place
    it('should not show the notes of the unit before when they are loaded again too late', () => {
      const tags = [tag('t1')];
      loadNotes(tags, []);
      const notesOfUnit10 = new Subject<UnitRichNotesDto | null>();
      workspaceBackendServiceMock.getUnitRichNotes.mockImplementation((_, unitId) => (unitId === 10 ?
        notesOfUnit10 : of({ notes: [note(8, 't1')], tags })));
      closeDialogWith({
        tagId: 't1', content: 'new', links: [], itemReferences: []
      });
      workspaceBackendServiceMock.addUnitRichNote.mockReturnValue(of(7));
      component.openNoteDialog(undefined, 't1');
      workspaceServiceMock.selectedUnit$.next(11);

      notesOfUnit10.next({ notes: [note(7, 't1', 'new')], tags });

      expect(shapeOf(component.displayNodes)).toEqual([{ tagId: 't1', notes: [8], children: [] }]);
    });

    // Opened over the notes of another unit, a second save would file the note there
    it.each<[string, () => void]>([
      ['another unit is shown', () => workspaceServiceMock.selectedUnit$.next(11)],
      ['the notes were left', () => fixture.destroy()]
    ])('should only say so when %s by the time saving fails', (_, moveOn) => {
      loadNotes(mockTags, []);
      const answer = new Subject<number | null>();
      closeDialogWithOnce({
        tagId: 't1', content: 'new', links: [], itemReferences: []
      });
      workspaceBackendServiceMock.addUnitRichNote.mockReturnValue(answer);
      component.openNoteDialog(undefined, 't1');
      moveOn();

      answer.next(null);

      expect(snackBarMock.open).toHaveBeenCalledWith('workspace.rich-note-not-saved', 'error', { duration: 3000 });
      expect(dialogMock.open).toHaveBeenCalledTimes(1);
    });

    it('should say so and keep the note when deleting it fails', () => {
      loadNotes(mockTags, [note(1, 't1')]);
      closeDialogWith(true);
      workspaceBackendServiceMock.deleteUnitRichNote.mockReturnValue(of(false));

      component.deleteNote(1);

      expect(snackBarMock.open).toHaveBeenCalledWith('workspace.rich-note-not-deleted', 'error', { duration: 3000 });
      expect(shapeOf(component.displayNodes)).toEqual([{ tagId: 't1', notes: [1], children: [] }]);
    });
  });

  // Esc, a click beside the dialog and navigation close it with undefined (#1844)
  it.each([false, undefined])('should keep the note when the delete dialog closes with %s', result => {
    loadNotes(mockTags, [note(1, 't1')]);
    closeDialogWith(result);

    component.deleteNote(1);

    expect(workspaceBackendServiceMock.deleteUnitRichNote).not.toHaveBeenCalled();
  });
});
