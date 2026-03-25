import { Component, EventEmitter, Output } from '@angular/core';
import { AnyExtension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TranslateModule } from '@ngx-translate/core';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { WrappedIconComponent } from '../../../../components/wrapped-icon/wrapped-icon.component';
import { ItemSelectionComponent } from '../../../../components/item-selection/item-selection.component';
import { BulletListExtension } from '../../../../extensions/bullet-list.extension';
import { OrderedListExtension } from '../../../../extensions/ordered-list.extension';
import {
  RichTextEditorDirective
} from '../../../../directives/rich-text-editor.directive';

@Component({
  selector: 'studio-lite-rich-note-editor',
  templateUrl: './rich-note-editor.component.html',
  styleUrls: ['./rich-note-editor.component.scss'],
  standalone: true,
  imports: [
    MatIconButton,
    MatTooltip,
    WrappedIconComponent,
    MatSelect,
    MatInput,
    TiptapEditorDirective,
    TranslateModule,
    ItemSelectionComponent,
    FormsModule,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger
  ]
})
export class RichNoteEditorComponent extends RichTextEditorDirective {
  @Output() selectedItemsChange = new EventEmitter<string[]>();
  @Output() contentChange = new EventEmitter<string>();
  @Output() editorBlur = new EventEmitter<void>();

  currentBulletListStyle = 'disc';
  currentOrderedListStyle = 'decimal';

  protected override getExtensions(): AnyExtension[] {
    return [
      StarterKit.configure({
        bulletList: false,
        orderedList: false
      }),
      BulletListExtension,
      OrderedListExtension,
      Underline,
      Superscript,
      Subscript,
      TextStyle,
      Color,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          style: 'max-width: 500px;'
        }
      }),
      Placeholder.configure({
        placeholder: this.placeholder
      }),
      Highlight.configure({
        multicolor: true
      })
    ];
  }

  onEditorUpdate(): void {
    this.contentChange.emit(this.editor.getHTML());
  }

  onEditorBlur(): void {
    this.editorBlur.emit();
  }

  updateEditorStates(): void {
    const bulletAttrs = this.editor.getAttributes('bulletList') as { listStyle?: string };
    this.currentBulletListStyle = bulletAttrs.listStyle || 'disc';
    const orderedAttrs = this.editor.getAttributes('orderedList') as { listStyle?: string };
    this.currentOrderedListStyle = orderedAttrs.listStyle || 'decimal';
  }

  setBulletListStyle(style: string): void {
    this.editor.chain().focus().setBulletListStyle(style).run();
  }

  toggleOrderedList(): void {
    this.editor.chain().toggleOrderedList().focus().run();
  }

  setOrderedListStyle(style: string): void {
    this.editor.chain().focus().setOrderedListStyle(style).run();
  }

  onSelectedItemChange(items: string[]): void {
    this.selectedItems = items;
    this.selectedItemsChange.emit(this.selectedItems);
  }

  getEditorData(): { text: string, items: string[] } {
    return {
      text: this.editor.getHTML(),
      items: this.selectedItems
    };
  }
}
