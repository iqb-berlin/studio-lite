import {
  Component, Input
} from '@angular/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';

const bookletConfigDefault = {
  pagingMode: '',
  pageNaviButtons: '',
  unitNaviButtons: '',
  controllerDesign: '',
  unitScreenHeader: '',
  unitTitle: ''
};

type ShownSetting = keyof typeof bookletConfigDefault;

/**
 * What the review does when a setting is left empty. These are not the testcenter's defaults that
 * the settings form names: the review imitates an older testcenter and treats an empty header as
 * one without text and an empty unit title as off (#1803). The paging mode is the player's own
 * fallback, which for aspect is `separate`.
 */
const reviewDefaults: Record<ShownSetting, string> = {
  pagingMode: 'separate',
  pageNaviButtons: 'SEPARATE_BOTTOM',
  unitNaviButtons: 'FULL',
  controllerDesign: '2022',
  unitScreenHeader: 'EMPTY',
  unitTitle: 'OFF'
};

export interface BookletSettingRow {
  key: ShownSetting;
  value: string;
  isDefault: boolean;
}

@Component({
  selector: 'studio-lite-booklet-config-show',
  templateUrl: './booklet-config-show.component.html',
  styleUrls: ['./booklet-config-show.component.scss'],
  imports: [TranslateModule]
})
export class BookletConfigShowComponent {
  bookletConfig: BookletConfigDto = bookletConfigDefault;
  settings: BookletSettingRow[] = BookletConfigShowComponent.toRows(bookletConfigDefault);

  @Input('config')
  set config(value: BookletConfigDto | undefined) {
    this.bookletConfig = value || bookletConfigDefault;
    this.settings = BookletConfigShowComponent.toRows(this.bookletConfig);
  }

  /** Every setting the review reads, with the value that applies -- the review's own when unset. */
  private static toRows(config: BookletConfigDto): BookletSettingRow[] {
    return (Object.keys(reviewDefaults) as ShownSetting[]).map(key => ({
      key,
      value: config[key] || reviewDefaults[key],
      isDefault: !config[key]
    }));
  }
}
