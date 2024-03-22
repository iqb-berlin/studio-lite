import { Component, Input } from '@angular/core';
import { Progress } from '../../models/types';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'studio-lite-status-indication',
    templateUrl: './status-indication.component.html',
    styleUrls: ['./status-indication.component.scss'],
    standalone: true,
    imports: [MatTooltip, TranslateModule]
})
export class StatusIndicationComponent {
  @Input() presentationProgress!: Progress;
  @Input() responseProgress!: Progress;
  @Input() hasFocus!: boolean;
}
