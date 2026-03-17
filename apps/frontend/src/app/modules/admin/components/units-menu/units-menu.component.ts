import { Component, EventEmitter, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { WrappedIconComponent } from '../../../../components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-units-menu',
  templateUrl: './units-menu.component.html',
  styleUrls: ['./units-menu.component.scss'],
  imports: [MatButton, MatTooltip, WrappedIconComponent, TranslateModule]
})
export class UnitsMenuComponent {
  @Output() downloadUnits: EventEmitter<boolean> = new EventEmitter<boolean>();
}
