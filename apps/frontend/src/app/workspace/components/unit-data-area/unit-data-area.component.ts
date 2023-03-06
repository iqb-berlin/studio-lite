import {
  Component, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { MatTabNav } from '@angular/material/tabs';
import { WorkspaceService } from '../../workspace.service';

@Component({
  selector: 'studio-lite-unit-data-area',
  templateUrl: './unit-data-area.component.html',
  styleUrls: ['./unit-data-area.component.scss']
})
export class UnitDataAreaComponent {
  @ViewChild(MatTabNav) nav: MatTabNav | undefined;
  @Input() navLinks!: string[];
  @Output() selectedRouterIndexChange: EventEmitter<number> = new EventEmitter<number>();

  constructor(public workspaceService: WorkspaceService) { }

  onActiveRouterLinkChange(isActive: boolean): void {
    if (isActive) {
      setTimeout(() => {
        if (this.nav) {
          this.selectedRouterIndexChange.emit(this.nav.selectedIndex);
        }
      });
    }
  }
}
