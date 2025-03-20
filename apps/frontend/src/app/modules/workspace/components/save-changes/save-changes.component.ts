import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'studio-lite-save-changes',
  templateUrl: './save-changes.component.html',
  styleUrls: ['./save-changes.component.scss'],
  imports: [MatButton, MatTooltip, MatIcon, TranslateModule]
})
export class SaveChangesComponent {
  @Input() changed!: boolean;
  @Output() discardChanges: EventEmitter<null> = new EventEmitter<null>();
  @Output() saveChanges: EventEmitter<null> = new EventEmitter<null>();
}
