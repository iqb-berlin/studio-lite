import {
  Component, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { MatTabNav } from '@angular/material/tabs';

@Component({
  selector: 'studio-lite-unit-data',
  templateUrl: './unit-data.component.html',
  styleUrls: ['./unit-data.component.scss']
})
export class UnitDataComponent {
  @ViewChild(MatTabNav) nav: MatTabNav | undefined;
  @Input() selectedUnitId!: number;
  @Input() navLinks!: string[];
  @Output() selectedRouterIndexChange: EventEmitter<number> = new EventEmitter<number>();
  onActiveRouterLinkChange(isActive: boolean) {
    if (this.nav && isActive) {
      this.selectedRouterIndexChange.emit(this.nav.selectedIndex);
    }
  }
}
