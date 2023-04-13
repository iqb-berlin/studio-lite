import { Component, Input } from '@angular/core';
import { Progress } from '../../models/types';

@Component({
  selector: 'studio-lite-status-indication',
  templateUrl: './status-indication.component.html',
  styleUrls: ['./status-indication.component.scss']
})
export class StatusIndicationComponent {
  @Input() presentationProgress!: Progress;
  @Input() responseProgress!: Progress;
  @Input() hasFocus!: boolean;
}
