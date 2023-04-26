import { Component, Input } from '@angular/core';

@Component({
  selector: 'studio-lite-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.scss']
})
export class WarningComponent {
  @Input() warnMessage!: string;
}
