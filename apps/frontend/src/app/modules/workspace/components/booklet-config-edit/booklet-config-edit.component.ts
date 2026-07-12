import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'studio-lite-booklet-config-edit',
  templateUrl: './booklet-config-edit.component.html',
  styleUrls: ['./booklet-config-edit.component.scss'],
  imports: [MatFormField, MatLabel, MatSelect, MatInput, FormsModule, MatOption, TranslateModule]
})
export class BookletConfigEditComponent {
  pagingModeOptions = ['separate', 'buttons', 'concat-scroll', 'concat-scroll-snap'];
  pageNaviButtonsOptions = ['OFF', 'SEPARATE_BOTTOM'];
  unitNaviButtonsOptions = ['OFF', 'ARROWS_ONLY', 'FULL'];
  controllerDesignOptions = ['2018', '2022'];
  unitScreenHeaderOptions = ['OFF', 'WITH_UNIT_TITLE', 'WITH_BOOKLET_TITLE', 'WITH_BLOCK_TITLE', 'EMPTY'];
  unitTitleOptions = ['OFF', 'ON'];
  loadingModeOptions = ['LAZY', 'EAGER'];
  logPolicyOptions = ['disabled', 'lean', 'rich', 'debug'];
  restoreCurrentPageOnReturnOptions = ['OFF', 'ON'];
  lockTestOnTerminationOptions = ['ON', 'OFF'];
  askForFullscreenOptions = ['ON', 'OFF'];
  headerContentOptions = ['NONE', 'BOOKLET_LABEL', 'BLOCK_LABEL', 'UNIT_LABEL'];
  navbarUnitLabelOptions = ['HIDDEN', 'INDEX', 'LABEL'];
  navbarPageLabelOptions = ['HIDDEN', 'INDEX', 'LABEL', 'LIST'];
  navbarButtonOptions = ['HIDDEN', 'DYNAMIC', 'UNITS', 'PAGES'];
  boolOptions = ['FALSE', 'TRUE'];
  browserBehaviourOptions = ['standard', 'preventNav'];
  forceOptions = ['OFF', 'ON', 'ALWAYS'];

  bookletConfig!: BookletConfigDto;

  @Output() configChanged = new EventEmitter<BookletConfigDto>();
  @Input() disabled = false;
  @Input() context: 'review' | 'export' = 'review';
  @Input('config')
  set config(value: BookletConfigDto | undefined) {
    // Default the review-context fields to '' (not undefined) so their empty
    // <mat-option value=""> is selected instead of showing a placeholder that
    // would overlap - and block clicks on - the floating field label.
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
