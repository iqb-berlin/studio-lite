import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'studio-lite-save-changes',
  templateUrl: './save-changes.component.html',
  styleUrls: ['./save-changes.component.scss']
})
export class SaveChangesComponent {
  @Input() changed!: boolean;
  @Output() discardChanges: EventEmitter<null> = new EventEmitter<null>();
  @Output() saveChanges: EventEmitter<null> = new EventEmitter<null>();
}
