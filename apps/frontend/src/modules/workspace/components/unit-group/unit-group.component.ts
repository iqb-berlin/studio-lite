import { Component, Input } from '@angular/core';

@Component({
  selector: 'studio-lite-unit-group',
  templateUrl: './unit-group.component.html',
  styleUrls: ['./unit-group.component.scss']
})
export class UnitGroupComponent {
  @Input() title!: string;
  @Input() expanded!: boolean;
  @Input() count!: number;
}
