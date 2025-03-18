import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'studio-lite-wrapped-icon',
    templateUrl: './wrapped-icon.component.html',
    styleUrls: ['./wrapped-icon.component.scss'],
    imports: [MatIcon]
})
export class WrappedIconComponent {
  @Input() icon!: string;
}
