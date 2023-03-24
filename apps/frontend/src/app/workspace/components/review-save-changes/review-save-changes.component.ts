import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'studio-lite-review-save-changes',
  templateUrl: './review-save-changes.component.html',
  styleUrls: ['./review-save-changes.component.scss']
})
export class ReviewSaveChangesComponent {
  @Input() changed!: boolean;
  @Output() discardChanges: EventEmitter<null> = new EventEmitter<null>();
  @Output() saveChanges: EventEmitter<null> = new EventEmitter<null>();
}
