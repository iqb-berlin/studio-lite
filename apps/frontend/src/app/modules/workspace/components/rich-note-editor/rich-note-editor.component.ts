import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { Editor } from '@tiptap/core';
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
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { FormsModule } from '@angular/forms';
import { WrappedIconComponent } from '../../../../components/wrapped-icon/wrapped-icon.component';
import { ItemSelectionComponent } from '../../../comments/components/item-selection/item-selection.component';

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
    FormsModule
  ]
})
export class RichNoteEditorComponent implements OnInit, OnDestroy {
  @Input() initialHTML = '';
  @Input() placeholder = '';
  @Input() unitItems: UnitItemDto[] = [];
  @Input() selectedItems: string[] = [];

  @Output() selectedItemsChange = new EventEmitter<string[]>();
  @Output() contentChange = new EventEmitter<string>();
  @Output() editorBlur = new EventEmitter<void>();

  editor!: Editor;
  selectedFontColor = 'black';
  selectedHighlightColor = 'black';
  fontColorButtonStyle = '';
  highlightColorButtonStyle = '';
  editorStates = {
    bold: false,
    italic: false,
    underline: false,
    superscript: false,
    subscript: false,
    strike: false,
    bulletList: false
  };

  ngOnInit(): void {
    this.editor = new Editor({
      extensions: [
        StarterKit,
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
      ],
      content: this.initialHTML,
      onTransaction: () => {
        this.updateEditorStates();
      },
      onUpdate: () => {
        this.contentChange.emit(this.editor.getHTML());
      },
      onBlur: () => {
        this.editorBlur.emit();
      }
    });
    this.editor.commands.focus();
    this.updateEditorStates();
    this.updateColorButtonStyles();
  }

  private updateColorButtonStyles(): void {
    this.fontColorButtonStyle = `linear-gradient(135deg, white 60%, ${this.selectedFontColor} 60%)`;
    this.highlightColorButtonStyle = `linear-gradient(135deg, white 60%, ${this.selectedHighlightColor} 60%)`;
  }

  private updateEditorStates(): void {
    this.editorStates = {
      bold: this.editor.isActive('bold'),
      italic: this.editor.isActive('italic'),
      underline: this.editor.isActive('underline'),
      superscript: this.editor.isActive('superscript'),
      subscript: this.editor.isActive('subscript'),
      strike: this.editor.isActive('strike'),
      bulletList: this.editor.isActive('bulletList')
    };
  }

  getEditorData(): { text: string, items: string[] } {
    return {
      text: this.editor.getHTML(),
      items: this.selectedItems
    };
  }

  async addImage(): Promise<void> {
    const mediaSrc = await RichNoteEditorComponent.loadImage(['image/*']);
    this.editor.commands.setImage({ src: mediaSrc });
  }

  private static async loadImage(fileTypes: string[] = []): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const fileUploadElement = document.createElement('input');
      fileUploadElement.type = 'file';
      fileUploadElement.accept = fileTypes.toString();
      fileUploadElement.addEventListener('change', event => {
        const uploadedFile = (event.target as HTMLInputElement).files?.[0];
        const reader = new FileReader();
        reader.onload = loadEvent => resolve(loadEvent.target?.result as string);
        reader.onerror = errorEvent => reject(errorEvent);
        if (uploadedFile) {
          reader.readAsDataURL(uploadedFile);
        }
      });
      fileUploadElement.click();
    });
  }

  toggleBold(): void {
    this.editor.chain().toggleBold().focus().run();
  }

  toggleItalic(): void {
    this.editor.chain().toggleItalic().focus().run();
  }

  toggleUnderline(): void {
    this.editor.chain().toggleUnderline().focus().run();
  }

  toggleStrike(): void {
    this.editor.commands.toggleStrike();
  }

  toggleSuperscript(): void {
    this.editor.chain().toggleSuperscript().focus().run();
  }

  toggleSubscript(): void {
    this.editor.chain().toggleSubscript().focus().run();
  }

  toggleBulletList(): void {
    this.editor.chain().toggleBulletList().focus().run();
  }

  applyFontColor(): void {
    this.editor.chain().focus().setColor(this.selectedFontColor).run();
    this.updateColorButtonStyles();
  }

  applyHighlightColor(): void {
    this.editor.chain().focus().toggleHighlight({ color: this.selectedHighlightColor }).run();
    this.updateColorButtonStyles();
  }

  onSelectedItemChange(items: string[]): void {
    this.selectedItems = items;
    this.selectedItemsChange.emit(this.selectedItems);
  }

  onFontColorInput(event: Event): void {
    this.selectedFontColor = (event.target as HTMLInputElement).value;
    this.applyFontColor();
  }

  onHighlightColorInput(event: Event): void {
    this.selectedHighlightColor = (event.target as HTMLInputElement).value;
    this.applyHighlightColor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }
}
