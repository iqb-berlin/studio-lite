import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { NgFor } from '@angular/common';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'studio-lite-booklet-config-edit',
  templateUrl: './booklet-config-edit.component.html',
  styleUrls: ['./booklet-config-edit.component.scss'],
  standalone: true,
  imports: [MatSlideToggle, MatFormField, MatLabel, MatSelect, FormsModule, MatOption, NgFor, TranslateModule]
})
export class BookletConfigEditComponent {
  pagingModeOptions = ['separate', 'buttons', 'concat-scroll', 'concat-scroll-snap'];
  pageNaviButtonsOptions = ['OFF', 'SEPARATE_BOTTOM'];
  unitNaviButtonsOptions = ['OFF', 'ARROWS_ONLY', 'FULL'];
  controllerDesignOptions = ['2018', '2022'];
  unitScreenHeaderOptions = ['OFF', 'WITH_UNIT_TITLE', 'WITH_BOOKLET_TITLE', 'WITH_BLOCK_TITLE', 'EMPTY'];
  unitTitleOptions = ['OFF', 'ON'];

  bookletConfig!: BookletConfigDto;

  @Output() configChanged = new EventEmitter<BookletConfigDto>();
  @Input() disabled = false;
  @Input('config')
  set config(value: BookletConfigDto | undefined) {
    this.bookletConfig = value || {
      pagingMode: '',
      pageNaviButtons: '',
      unitNaviButtons: '',
      controllerDesign: '',
      unitScreenHeader: '',
      unitTitle: ''
    };
  }
}
