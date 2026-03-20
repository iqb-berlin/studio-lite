import { CommonModule } from '@angular/common';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { UnitItemDto, UnitRichNoteDto } from '@studio-lite-lib/api-dto';
import { GetLocalizedValuePipe } from '../../../../pipes/get-localized-value.pipe';
import { GetItemLabelPipe } from '../../../../pipes/get-item-label.pipe';
import { IsNoteFooterVisiblePipe } from '../../../../pipes/is-note-footer-visible.pipe';

export interface RichNoteNode {
  tagId: string;
  label: { lang: string, value: string }[];
  notes: UnitRichNoteDto[];
  children: RichNoteNode[];
}

@Component({
  selector: 'studio-lite-unit-rich-note-node',
  templateUrl: './unit-rich-note-node.component.html',
  styleUrls: ['./unit-rich-note-node.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    GetLocalizedValuePipe,
    GetItemLabelPipe,
    IsNoteFooterVisiblePipe
  ]
})
export class UnitRichNoteNodeComponent {
  @Input() node!: RichNoteNode;
  @Input() unitItems: UnitItemDto[] = [];
  @Input() canWrite = false;

  @Output() addNote = new EventEmitter<string>();
  @Output() editNote = new EventEmitter<UnitRichNoteDto>();
  @Output() deleteNote = new EventEmitter<number>();
}
