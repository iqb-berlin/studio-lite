import { Component, Input } from '@angular/core';

@Component({
  selector: 'studio-lite-wrapped-icon',
  templateUrl: './wrapped-icon.component.html',
  styleUrls: ['./wrapped-icon.component.scss']
})
export class WrappedIconComponent {
  @Input() icon!: string;
}
