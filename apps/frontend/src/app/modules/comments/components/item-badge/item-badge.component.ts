import { Component, Input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'studio-lite-item-badge',
  imports: [
    MatTooltip,
    TranslateModule
  ],
  templateUrl: './item-badge.component.html',
  styleUrl: './item-badge.component.scss'
})
export class ItemBadgeComponent {
  @Input() label!: string;
}
