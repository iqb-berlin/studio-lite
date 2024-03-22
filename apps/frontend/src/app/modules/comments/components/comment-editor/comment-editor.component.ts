import {
  Component, EventEmitter, Input, OnInit, Output
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
import { IsCommentCommittablePipe } from '../../pipes/is-comment-commitable.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogContent } from '@angular/material/dialog';
import { NgxTiptapModule } from 'ngx-tiptap';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton, MatFabButton } from '@angular/material/button';

@Component({
    selector: 'studio-lite-comment-editor',
    templateUrl: './comment-editor.component.html',
    styleUrls: ['./comment-editor.component.scss'],
    standalone: true,
    imports: [MatIconButton, MatTooltip, WrappedIconComponent, MatSelect, MatInput, NgxTiptapModule, MatDialogContent, MatFabButton, TranslateModule, IsCommentCommittablePipe]
})
export class CommentEditorComponent implements OnInit {
  @Input() submitLabel!: string;
  @Input() initialHTML: string = '';
  @Input() editorHTML: string = '';
  @Input() label: string = '';

  @Output() handleSubmit = new EventEmitter<string>();
  @Output() handleCancel = new EventEmitter<void>();

  editor!: Editor;
  selectedFontColor: string = 'black';
  selectedHighlightColor: string = 'black';
  bulletListStyle: string = 'disc';

  ngOnInit() {
    this.editor = new Editor({
      extensions: [StarterKit, Underline, Superscript, Subscript,
        TextStyle, Color,
        Image.configure({
          inline: false,
          allowBase64: true,
          HTMLAttributes: {
            style: 'max-width: 500px;'
          }
        }),
        Highlight.configure({
          multicolor: true
        })],
      content: this.initialHTML
    });
    this.editor.commands.focus();
    this.editor.on('update', ({ editor }) => {
      this.editorHTML = editor.getHTML();
    });
  }

  onReset(): void {
    this.handleCancel.emit();
    this.editor.commands.clearContent(true);
    this.editor.commands.focus();
  }

  onSubmit(): void {
    const editorContent = this.editor.getHTML();
    if (editorContent !== '<p></p>') {
      this.handleSubmit.emit(editorContent);
    } else {
      this.handleCancel.emit();
    }
    this.editor.commands.clearContent(true);
    this.editor.commands.focus();
  }

  async addImage(): Promise<void> {
    const mediaSrc = await CommentEditorComponent.loadImage(['image/*']);
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
  }

  applyHighlightColor(): void {
    this.editor.chain().focus().toggleHighlight({ color: this.selectedHighlightColor }).run();
  }
}
