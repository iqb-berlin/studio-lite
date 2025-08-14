import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'studio-lite-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.scss'],
  imports: [
    MatIcon
  ]
})
export class WarningComponent {
  @Input() warnMessage!: string;
}
