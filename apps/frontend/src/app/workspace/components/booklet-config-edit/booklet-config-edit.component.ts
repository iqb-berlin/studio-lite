import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';

const bookletConfigDefault = {
  pagingMode: '',
  pageNaviButtons: '',
  unitNaviButtons: '',
  controllerDesign: '',
  unitScreenHeader: '',
  unitTitle: ''
};

@Component({
  selector: 'studio-lite-booklet-config-edit',
  templateUrl: './booklet-config-edit.component.html',
  styleUrls: ['./booklet-config-edit.component.scss']
})
export class BookletConfigEditComponent {
  pagingModeOptions = ['separate', 'concat-scroll', 'concat-scroll-snap'];
  pageNaviButtonsOptions = ['OFF', 'SEPARATE_BOTTOM'];
  unitNaviButtonsOptions = ['OFF', 'ARROWS_ONLY', 'FULL'];
  controllerDesignOptions = ['2018', '2022'];
  unitScreenHeaderOptions = ['OFF', 'WITH_UNIT_TITLE', 'WITH_BOOKLET_TITLE', 'WITH_BLOCK_TITLE', 'EMPTY'];
  unitTitleOptions = ['OFF', 'ON'];
  bookletConfig: BookletConfigDto = bookletConfigDefault;
  @Output() configChanged = new EventEmitter<BookletConfigDto>();
  @Input('disabled') disabled = false;
  @Input('config')
  set config(value: BookletConfigDto | undefined) {
    this.bookletConfig = value || bookletConfigDefault;
  }

  get config(): BookletConfigDto {
    return this.bookletConfig;
  }
}