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
    TextFieldModule
  ]
})
export class UnitRichNoteDialogComponent implements OnInit, OnDestroy {
  @ViewChild(RichNoteEditorComponent) editorComponent!: RichNoteEditorComponent;
  FormGroup!: FormGroup;
  FormArray!: FormArray;
  noteForm: FormGroup;
  isEditMode = false;
  linksArray!: FormArray;
  initialItemReferences: string[] = [];
  dialogTitle = '';
  saveButtonLabel = '';
  flattenedTags: { id: string, label: string, depth: number, padding: number }[] = [];
  isSaveDisabled = true;
  private currentContent = '';
  private currentItems: string[] = [];

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
      tagId: [data.note?.tagId || '', Validators.required],
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
      const foundTag = this.flattenedTags.find(t => t.id.split('.').pop() === currentTagId);
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
      type: [link.type || ''],
      label: this.fb.array(this.initLangValues(link.label)),
      description: this.fb.array(this.initLangValues(link.description))
    }));
  }

  private initLangValues(values?: { lang: string; value: string }[]): FormGroup[] {
    if (!values || values.length === 0) {
      return [this.fb.group({ lang: ['de'], value: [''] })];
    }
    return values.map(v => this.fb.group({
      lang: [v.lang || 'de', Validators.required],
      value: [v.value || '']
    }));
  }

  addLink(): void {
    this.linksArray.push(this.fb.group({
      url: ['', Validators.required],
      type: [''],
      label: this.fb.array([this.fb.group({ lang: ['de'], value: [''] })]),
      description: this.fb.array([this.fb.group({ lang: ['de'], value: [''] })])
    }));
  }

  removeLink(index: number): void {
    this.linksArray.removeAt(index);
  }

  getLabels(linkIndex: number): FormArray {
    return this.linksArray.at(linkIndex).get('label') as FormArray;
  }

  addLabel(linkIndex: number): void {
    this.getLabels(linkIndex).push(this.fb.group({ lang: [''], value: [''] }));
  }

  removeLabel(linkIndex: number, labelIndex: number): void {
    this.getLabels(linkIndex).removeAt(labelIndex);
  }

  getDescriptions(linkIndex: number): FormArray {
    return this.linksArray.at(linkIndex).get('description') as FormArray;
  }

  addDescription(linkIndex: number): void {
    this.getDescriptions(linkIndex).push(this.fb.group({ lang: [''], value: [''] }));
  }

  removeDescription(linkIndex: number, descriptionIndex: number): void {
    this.getDescriptions(linkIndex).removeAt(descriptionIndex);
  }

  private flattenTags(tags: UnitRichNoteTagDto[], parentPath = '', depth = 0): void {
    tags.forEach(tag => {
      const fullPath = parentPath ? `${parentPath}.${tag.id}` : tag.id;
      this.flattenedTags.push({
        id: fullPath,
        label: this.getLocalizedLabel(tag.label),
        depth,
        padding: depth * 20
      });
      if (tag.children && tag.children.length) {
        this.flattenTags(tag.children, fullPath, depth + 1);
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
    if (this.noteForm.valid) {
      const editorData = this.editorComponent.getEditorData();
      if (editorData.text && editorData.text !== '<p></p>') {
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
