import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-unit-list',
  templateUrl: './unit-list.component.html',
  styleUrls: ['./unit-list.component.scss']
})
export class UnitListComponent {
  @Output() unitSelect: EventEmitter<number> = new EventEmitter<number>();
  @Input() selectedUnitId!: number;
  @Input() unitList!: { [key: string]: UnitInListDto[] };
}
