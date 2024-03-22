import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'studio-lite-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.scss'],
  standalone: true,
  imports: [NgIf]
})
export class WarningComponent {
  @Input() warnMessage!: string;
}
