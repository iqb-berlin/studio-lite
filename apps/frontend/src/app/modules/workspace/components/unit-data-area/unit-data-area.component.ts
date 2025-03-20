import {
  Component, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import {
  ActivatedRoute, Router, RouterLinkActive, RouterLink, RouterOutlet
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconAnchor } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { NamedRouterLinkPipe } from '../../pipes/named-router-link.pipe';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'studio-lite-unit-data-area',
  templateUrl: './unit-data-area.component.html',
  styleUrls: ['./unit-data-area.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatTabNav, MatTabLink, RouterLinkActive, RouterLink, MatIconAnchor, MatIcon, MatTabNavPanel, RouterOutlet, AsyncPipe, TranslateModule, NamedRouterLinkPipe]
})
export class UnitDataAreaComponent {
  @ViewChild(MatTabNav) nav: MatTabNav | undefined;
  @Input() disabledRouterLink!: string;
  @Input() navTabs!: { name: string; duplicable: boolean }[];
  @Input() routingOutlet: string = 'primary'; // angular default
  @Input() secondaryRoutingOutlet!: string;
  @Input() pinIcon!: string;
  @Output() selectedRouterIndexChange: EventEmitter<number> = new EventEmitter<number>();

  constructor(public workspaceService: WorkspaceService,
              private router: Router,
              public route: ActivatedRoute) { }

  onActiveRouterLinkChange(isActive: boolean): void {
    if (isActive) {
      setTimeout(() => {
        if (this.nav) {
          this.selectedRouterIndexChange.emit(this.nav.selectedIndex);
        }
      });
    }
  }

  togglePinnedTab(link: string[] | null): void {
    this.router
      .navigate([{ outlets: { [this.secondaryRoutingOutlet]: link } }], { relativeTo: this.route });
  }
}
