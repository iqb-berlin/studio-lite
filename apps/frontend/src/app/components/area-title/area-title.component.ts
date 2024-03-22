import { Component, Input } from '@angular/core';

@Component({
    selector: 'studio-lite-area-title',
    templateUrl: './area-title.component.html',
    styleUrls: ['./area-title.component.scss'],
    standalone: true
})
export class AreaTitleComponent {
  @Input() title!: string;
}
