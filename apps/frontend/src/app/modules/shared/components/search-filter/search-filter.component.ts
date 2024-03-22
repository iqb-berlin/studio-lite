import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { WrappedIconComponent } from '../wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss'],
  standalone: true,
  imports: [MatFormField, MatLabel, MatInput, MatIconButton, MatSuffix, MatTooltip, WrappedIconComponent, TranslateModule]
})
export class SearchFilterComponent {
  value: string = '';
  @Input() title!: string;
  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
}
