import { Component, Inject, ViewChild } from '@angular/core';
import {
  UnitItemDto, UnitRichNoteDto, UnitRichNoteTagDto, UnitRichNoteLinkDto
} from '@studio-lite-lib/api-dto';
import {
  FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
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
    CastPipe
  ]
})
export class UnitRichNoteDialogComponent {
  @ViewChild(RichNoteEditorComponent) editorComponent!: RichNoteEditorComponent;
  FormGroup!: FormGroup;
  FormArray!: FormArray;
  noteForm: FormGroup;
  isEditMode = false;
  flattenedTags: { id: string, label: string, depth: number }[] = [];
  initialItemReferences: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<UnitRichNoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UnitRichNoteDialogData,
    private fb: FormBuilder
  ) {
    this.isEditMode = !!data.note;
    this.initialItemReferences = data.note?.itemReferences || [];
    this.flattenTags(data.tags);
    this.noteForm = this.fb.group({
      tagId: [data.note?.tagId || '', Validators.required],
      links: this.fb.array(this.initLinks(data.note?.links))
    });
  }

  get links(): FormArray {
    return this.noteForm.get('links') as FormArray;
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
      value: [v.value || '', Validators.required]
    }));
  }

  addLink(): void {
    this.links.push(this.fb.group({
      url: ['', Validators.required],
      type: [''],
      label: this.fb.array([this.fb.group({ lang: ['de'], value: [''] })]),
      description: this.fb.array([this.fb.group({ lang: ['de'], value: [''] })])
    }));
  }

  removeLink(index: number): void {
    this.links.removeAt(index);
  }

  getLabels(linkIndex: number): FormArray {
    return this.links.at(linkIndex).get('label') as FormArray;
  }

  addLabel(linkIndex: number): void {
    this.getLabels(linkIndex).push(this.fb.group({ lang: [''], value: [''] }));
  }

  removeLabel(linkIndex: number, labelIndex: number): void {
    this.getLabels(linkIndex).removeAt(labelIndex);
  }

  getDescriptions(linkIndex: number): FormArray {
    return this.links.at(linkIndex).get('description') as FormArray;
  }

  addDescription(linkIndex: number): void {
    this.getDescriptions(linkIndex).push(this.fb.group({ lang: [''], value: [''] }));
  }

  removeDescription(linkIndex: number, descriptionIndex: number): void {
    this.getDescriptions(linkIndex).removeAt(descriptionIndex);
  }

  private flattenTags(tags: UnitRichNoteTagDto[], depth = 0): void {
    tags.forEach(tag => {
      this.flattenedTags.push({ id: tag.id, label: tag.label, depth });
      if (tag.children && tag.children.length) {
        this.flattenTags(tag.children, depth + 1);
      }
    });
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
}
