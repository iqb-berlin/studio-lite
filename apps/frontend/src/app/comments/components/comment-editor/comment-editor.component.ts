import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'studio-lite-comment-editor',
  templateUrl: './comment-editor.component.html',
  styleUrls: ['./comment-editor.component.scss']
})
export class CommentEditorComponent implements OnInit {
  @Input() submitLabel!: string;
  @Input() initialText: string = '';

  @Output() handleSubmit = new EventEmitter<string>();
  @Output() handleCancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      comment: [this.initialText, Validators.required]
    });
  }

  onReset(): void {
    this.handleCancel.emit();
  }

  onSubmit(): void {
    this.handleSubmit.emit(this.form.value.comment);
    this.form.reset();
  }
}
