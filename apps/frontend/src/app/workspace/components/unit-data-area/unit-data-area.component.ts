import {
  Component, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { MatTabNav } from '@angular/material/tabs';

@Component({
  selector: 'studio-lite-unit-data-area',
  templateUrl: './unit-data-area.component.html',
  styleUrls: ['./unit-data-area.component.scss']
})
export class UnitDataAreaComponent {
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
