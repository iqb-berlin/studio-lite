import {
  AfterViewInit, Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogContent } from '@angular/material/dialog';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton, MatFabButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { IsCommentCommittablePipe } from '../../pipes/is-comment-commitable.pipe';
import { WrappedIconComponent } from '../../../../components/wrapped-icon/wrapped-icon.component';
import { ItemSelectionComponent } from '../../../../components/item-selection/item-selection.component';
import {
  RichTextEditorDirective
} from '../../../../directives/rich-text-editor.directive';

@Component({
  selector: 'studio-lite-comment-editor',
  templateUrl: './comment-editor.component.html',
  styleUrls: ['./comment-editor.component.scss'],
  imports: [
    MatIconButton,
    MatTooltip,
    WrappedIconComponent,
    MatSelect,
    MatInput,
    TiptapEditorDirective,
    MatDialogContent,
    MatFabButton,
    TranslateModule,
    IsCommentCommittablePipe,
    ItemSelectionComponent,
    FormsModule
  ]
})
export class CommentEditorComponent extends RichTextEditorDirective implements AfterViewInit {
  @Input() submitLabel!: string;
  @Input() editorHTML: string = '';

  @Output() handleSubmit = new EventEmitter<{ text: string, items: string[] }>();
  @Output() handleCancel = new EventEmitter<void>();

  ngAfterViewInit() {
    this.editor.commands.focus();
    this.editor.on('update', () => {
      this.updateEditorHtml();
    });
  }

  private updateEditorHtml(): void {
    this.editorHTML = this.editor.getHTML();
  }

  onReset(): void {
    this.handleCancel.emit();
    this.editor.commands.clearContent(true);
    this.editor.commands.focus();
  }

  onSubmit(): void {
    const editorContent = this.editor.getHTML();
    if (editorContent !== '<p></p>') {
      this.handleSubmit.emit({ text: editorContent, items: this.selectedItems });
    } else {
      this.handleCancel.emit();
    }
    this.editor.commands.clearContent(true);
    this.editor.commands.focus();
    this.selectedItems = [];
  }

  onSelectedItemChange(): void {
    const editorContent = this.editor.getHTML();
    if (editorContent !== '<p></p>') {
      this.updateEditorHtml(); // triggers submit button state update
    }
  }
}
