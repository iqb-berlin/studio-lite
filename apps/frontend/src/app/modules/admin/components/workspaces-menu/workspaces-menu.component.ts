import { Component, EventEmitter, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { WrappedIconComponent } from '../../../../components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-workspaces-menu',
  templateUrl: './workspaces-menu.component.html',
  styleUrls: ['./workspaces-menu.component.scss'],
  imports: [MatButton, MatTooltip, WrappedIconComponent, TranslateModule]
})
export class WorkspacesMenuComponent {
  @Output() downloadWorkspacesReport: EventEmitter<boolean> = new EventEmitter<boolean>();
}
