import {
  Component, Inject, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import {
  UnitItemDto, UnitRichNoteDto, UnitRichNoteTagDto, UnitRichNoteLinkDto
} from '@studio-lite-lib/api-dto';
import {
  AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { TextFieldModule } from '@angular/cdk/text-field';
import { Subject, takeUntil } from 'rxjs';
import { RichNoteEditorComponent } from '../rich-note-editor/rich-note-editor.component';
import { CastPipe } from '../../../../pipes/cast.pipe';
import { GetRichNoteLinkTypeLabelPipe } from '../../../../pipes/get-rich-note-link-type-label.pipe';

export interface UnitRichNoteDialogData {
  note?: UnitRichNoteDto;
  workspaceId: number;
  unitId: number;
  tags: UnitRichNoteTagDto[];
  items: UnitItemDto[];
}

@Component({
  selector: 'studio-lite-unit-rich-note-dialog',
  templateUrl: './unit-rich-note-dialog.component.html',
  styleUrls: ['./unit-rich-note-dialog.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatExpansionModule,
    TranslateModule,
    RichNoteEditorComponent,
    CastPipe,
    GetRichNoteLinkTypeLabelPipe,
    TextFieldModule
  ]
})
export class UnitRichNoteDialogComponent implements OnInit, OnDestroy {
  @ViewChild(RichNoteEditorComponent) editorComponent!: RichNoteEditorComponent;
  protected FormGroup!: FormGroup;
  protected FormArray!: FormArray;
  noteForm: FormGroup;
  isEditMode = false;
  linksArray!: FormArray;
  initialItemReferences: string[] = [];
  dialogTitle = '';
  saveButtonLabel = '';
  flattenedTags: { id: string, label: string, depth: number, padding: number }[] = [];
  isSaveDisabled = true;
  protected currentContent = '';
  protected isEditorTouched = false;
  private currentItems: string[] = [];
  linkTypes = [
    'COMPETENCE_DESCRIPTION',
    'COMPETENCE_STRUCTURE',
    'MATERIAL_DOWNLOAD',
    'MATERIAL_READ',
    'MEDIA_SOURCES',
    'ASSESSMENT_TASK_EXAMPLE',
    'TRAINING_TASK_EXAMPLE'
  ];

  private ngUnsubscribe = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<UnitRichNoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UnitRichNoteDialogData,
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {
    this.isEditMode = !!data.note;
    this.dialogTitle = this.isEditMode ? 'workspace.edit-rich-note' : 'workspace.add-rich-note';
    this.saveButtonLabel = this.isEditMode ? 'workspace.save' : 'workspace.add';
    this.initialItemReferences = data.note?.itemReferences || [];

    this.noteForm = this.fb.group({
      tagId: [data.note?.tagId || ''],
      links: this.fb.array(this.initLinks(data.note?.links))
    });
    this.linksArray = this.noteForm.get('links') as FormArray;
  }

  ngOnInit(): void {
    this.currentContent = this.data.note?.content || '';
    this.currentItems = [...this.initialItemReferences];
    this.updateSaveButtonState();

    this.flattenedTags = [];
    this.flattenTags(this.data.tags);
    this.resolveInitialTagId();
    this.updateSaveButtonState();

    this.noteForm.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.updateSaveButtonState();
      });
  }

  private resolveInitialTagId(): void {
    const currentTagId = this.noteForm.get('tagId')?.value || '';
    if (currentTagId && !this.flattenedTags.find(t => t.id === currentTagId)) {
      const foundTag = this.flattenedTags.find(t => {
        if (t.id.startsWith('http')) {
          return t.id.split('/').pop() === currentTagId || t.id.split('#').pop() === currentTagId;
        }
        return t.id.split('.').pop() === currentTagId;
      });
      if (foundTag) {
        this.noteForm.get('tagId')?.setValue(foundTag.id, { emitEvent: false });
      }
    }
  }

  static getControl(formGroup: AbstractControl, controlName: string): AbstractControl {
    return (formGroup as FormGroup).get(controlName) as AbstractControl;
  }

  static getFormArray(formGroup: AbstractControl, arrayName: string): FormArray {
    return (formGroup as FormGroup).get(arrayName) as FormArray;
  }

  private initLinks(links?: UnitRichNoteLinkDto[]): FormGroup[] {
    if (!links || links.length === 0) return [];
    return links.map(link => this.fb.group({
      url: [link.url || '', Validators.required],
      type: [link.type || 'COMPETENCE_DESCRIPTION'],
      label: [link.label || '', Validators.required],
      description: [link.description || '']
    }));
  }

  addLink(): void {
    this.linksArray.push(this.fb.group({
      url: ['', Validators.required],
      type: ['COMPETENCE_DESCRIPTION'],
      label: ['', Validators.required],
      description: ['']
    }));
  }

  removeLink(index: number): void {
    this.linksArray.removeAt(index);
  }

  private flattenTags(tags: UnitRichNoteTagDto[], depth = 0): void {
    tags.forEach(tag => {
      const fullPath = tag.id;
      this.flattenedTags.push({
        id: fullPath,
        label: this.getLocalizedLabel(tag.label),
        depth,
        padding: depth * 20
      });
      if (tag.children && tag.children.length) {
        this.flattenTags(tag.children, depth + 1);
      }
    });
  }

  private getLocalizedLabel(labels: { lang: string; value: string }[]): string {
    if (!labels || labels.length === 0) return '';
    const currentLang = this.translateService.currentLang;
    const label = labels.find(l => l.lang === currentLang) || labels[0];
    return label.value;
  }

  onContentChange(content: string): void {
    this.currentContent = content;
    this.updateSaveButtonState();
  }

  onEditorBlur(): void {
    this.isEditorTouched = true;
  }

  onSelectedItemChange(items: string[]): void {
    this.currentItems = items;
    this.updateSaveButtonState();
  }

  private updateSaveButtonState(): void {
    const isTextEmpty = !this.currentContent || this.currentContent === '<p></p>';
    const isItemsEmpty = !this.currentItems || this.currentItems.length === 0;
    const isLinksEmpty = !this.linksArray || this.linksArray.length === 0;
    this.isSaveDisabled = this.noteForm.invalid || (isTextEmpty && isItemsEmpty && isLinksEmpty);
  }

  onSave(): void {
    this.isEditorTouched = true;
    if (this.noteForm.valid) {
      const editorData = this.editorComponent.getEditorData();
      const isTextEmpty = !editorData.text || editorData.text === '<p></p>';
      const isItemsEmpty = !editorData.items || editorData.items.length === 0;
      const isLinksEmpty = !this.linksArray || this.linksArray.length === 0;

      if (!isTextEmpty || !isItemsEmpty || !isLinksEmpty) {
        this.dialogRef.close({
          ...this.noteForm.value,
          content: editorData.text,
          itemReferences: editorData.items,
          id: this.data.note?.id
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
