import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnitRichNoteLinkDto, UnitRichNoteTagDto } from '@studio-lite-lib/api-dto';
import { UnitRichNoteDialogComponent } from './unit-rich-note-dialog.component';
import { RichNoteEditorComponent } from '../rich-note-editor/rich-note-editor.component';

describe('UnitRichNoteDialogComponent', () => {
  let component: UnitRichNoteDialogComponent;
  let fixture: ComponentFixture<UnitRichNoteDialogComponent>;
  let dialogRefMock: DeepMocked<MatDialogRef<UnitRichNoteDialogComponent>>;

  const mockTags: UnitRichNoteTagDto[] = [
    {
      id: 'parent',
      label: [{ lang: 'de', value: 'Parent' }],
      children: [
        { id: 'child', label: [{ lang: 'de', value: 'Child' }] }
      ]
    }
  ];
  interface DialogData {
    workspaceId: number;
    unitId: number;
    tags: UnitRichNoteTagDto[];
    items: string[];
    note?: { tagId: string, content: string, links?: UnitRichNoteLinkDto[] };
  }

  async function setupTestBed(data: DialogData) {
    await TestBed.configureTestingModule({
      imports: [
        UnitRichNoteDialogComponent,
        ReactiveFormsModule,
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: data }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitRichNoteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    dialogRefMock = createMock<MatDialogRef<UnitRichNoteDialogComponent>>();
  });

  it('should flatten tags on init', async () => {
    await setupTestBed({
      workspaceId: 1,
      unitId: 1,
      tags: mockTags,
      items: []
    });
    expect(component.flattenedTags.length).toBe(2);
    expect(component.flattenedTags[0].id).toBe('parent');
    expect(component.flattenedTags[1].id).toBe('child');
  });

  // Each test builds its own dialog: one that relies on the component of the test before it passes
  // only in the order of this file (#1942).
  const setupNewNote = () => setupTestBed({
    workspaceId: 1,
    unitId: 1,
    tags: mockTags,
    items: []
  });

  it('should disable save button if content is empty', async () => {
    await setupNewNote();
    // with a tag, so that it is the empty content that blocks, not the invalid form
    component.noteForm.get('tagId')?.setValue('parent.child');
    component.onContentChange('');
    expect(component.isSaveDisabled).toBe(true);
  });

  it('should enable save button if tag and content are present', async () => {
    await setupNewNote();
    component.noteForm.get('tagId')?.setValue('parent.child');
    component.onContentChange('<p>some content</p>');
    expect(component.isSaveDisabled).toBe(false);
  });

  it('should enable save button if tag and items are present, even if text is empty', async () => {
    await setupNewNote();
    component.noteForm.get('tagId')?.setValue('parent.child');
    component.onContentChange('');
    component.onSelectedItemChange(['item1']);
    expect(component.isSaveDisabled).toBe(false);
  });

  it('should add and remove links', async () => {
    await setupTestBed({
      workspaceId: 1,
      unitId: 1,
      tags: mockTags,
      items: []
    });

    expect(component.linksArray.length).toBe(0);
    component.addLink();
    expect(component.linksArray.length).toBe(1);
    component.removeLink(0);
    expect(component.linksArray.length).toBe(0);
  });

  it('should close dialog with data on save', async () => {
    await setupTestBed({
      workspaceId: 1,
      unitId: 1,
      tags: mockTags,
      items: []
    });

    component.noteForm.get('tagId')?.setValue('child');
    component.onContentChange('<p>test content</p>');

    // Mock editor component
    component.editorComponent = {
      getEditorData: () => ({ text: '<p>test content</p>', items: ['item1'] })
    } as unknown as RichNoteEditorComponent;

    component.onSave();
    expect(dialogRefMock.close).toHaveBeenCalledWith({
      tagId: 'child',
      links: [],
      content: '<p>test content</p>',
      itemReferences: ['item1'],
      id: undefined
    });
  });

  const editorWith = (text: string, items: string[]) => {
    component.editorComponent = createMock<RichNoteEditorComponent>({ getEditorData: () => ({ text, items }) });
  };

  // A note stored with the last part of its tag's id finds the tag by it, as long as one has it.
  it.each([
    ['the dotted id', 'parent.child', 'child', 'parent.child'],
    ['the path of a vocabulary concept', 'https://w3id.org/iqb/t/child', 'child', 'https://w3id.org/iqb/t/child'],
    ['the fragment of a vocabulary concept', 'https://w3id.org/iqb/t#child', 'child', 'https://w3id.org/iqb/t#child'],
    ['none, keeping the stored id', 'parent.other', 'child', 'child']
  ])('should select the tag whose id ends with the stored one: %s', async (_, childId, storedId, selected) => {
    await setupTestBed({
      note: { tagId: storedId, content: '<p>test</p>' },
      workspaceId: 1,
      unitId: 1,
      tags: [{ id: 'parent', label: [{ lang: 'de', value: 'Parent' }], children: [{ id: childId, label: [] }] }],
      items: []
    });

    expect(component.noteForm.get('tagId')?.value).toBe(selected);
  });

  it('should list a tag without a label with an empty name', async () => {
    await setupTestBed({
      workspaceId: 1, unitId: 1, tags: [{ id: 'bare', label: [] }], items: []
    });

    expect(component.flattenedTags).toEqual([{
      id: 'bare', label: '', depth: 0, padding: 0
    }]);
  });

  it('should keep the links of the note it edits, one without a type as a competence description', async () => {
    await setupTestBed({
      note: {
        tagId: 'parent',
        content: '<p>test</p>',
        links: [
          {
            url: 'https://a.de', label: 'A', description: 'about A', type: 'MATERIAL_READ'
          },
          { url: 'https://b.de', label: 'B' }
        ]
      },
      workspaceId: 1,
      unitId: 1,
      tags: mockTags,
      items: []
    });
    editorWith('<p>test</p>', []);

    component.onSave();

    expect(dialogRefMock.close).toHaveBeenCalledWith(expect.objectContaining({
      links: [
        {
          url: 'https://a.de', type: 'MATERIAL_READ', label: 'A', description: 'about A'
        },
        {
          url: 'https://b.de', type: 'COMPETENCE_DESCRIPTION', label: 'B', description: ''
        }
      ]
    }));
  });

  // a note may consist of item references or links alone
  it.each([
    ['item references', '', ['item1'], false],
    ['links', '<p></p>', [], true]
  ])('should save a note without text that has %s', async (_, text: string, items: string[], withLink: boolean) => {
    await setupNewNote();
    if (withLink) {
      component.addLink();
      component.linksArray.at(0).patchValue({ url: 'https://a.de', label: 'A' });
    }
    editorWith(text, items);

    component.onSave();

    expect(dialogRefMock.close).toHaveBeenCalledWith(expect.objectContaining({
      content: text,
      itemReferences: items,
      links: withLink ? [expect.objectContaining({ url: 'https://a.de' })] : []
    }));
  });
});
