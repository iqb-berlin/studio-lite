import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnitRichNoteTagDto } from '@studio-lite-lib/api-dto';
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
    note?: { tagId: string, content: string };
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

  it('should create', async () => {
    await setupTestBed({
      workspaceId: 1,
      unitId: 1,
      tags: mockTags,
      items: []
    });
    expect(component).toBeTruthy();
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

  it('should resolve legacy tagId to full path', async () => {
    const legacyData = {
      note: { tagId: 'child', content: '<p>test</p>' },
      workspaceId: 1,
      unitId: 1,
      tags: mockTags,
      items: []
    };

    await setupTestBed(legacyData);
    expect(component.noteForm.get('tagId')?.value).toBe('child');
  });

  it('should disable save button if content is empty', () => {
    component.onContentChange('');
    expect(component.isSaveDisabled).toBe(true);
  });

  it('should enable save button if tag and content are present', () => {
    component.noteForm.get('tagId')?.setValue('parent.child');
    component.onContentChange('<p>some content</p>');
    expect(component.isSaveDisabled).toBe(false);
  });

  it('should enable save button if tag and items are present, even if text is empty', () => {
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
});
