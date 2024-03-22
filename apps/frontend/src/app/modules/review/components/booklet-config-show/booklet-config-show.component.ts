import {
  Component, Input
} from '@angular/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';

const bookletConfigDefault = {
  pagingMode: '',
  pageNaviButtons: '',
  unitNaviButtons: '',
  controllerDesign: '',
  unitScreenHeader: '',
  unitTitle: ''
};

@Component({
  selector: 'studio-lite-booklet-config-show',
  templateUrl: './booklet-config-show.component.html',
  styleUrls: ['./booklet-config-show.component.scss'],
  standalone: true,
  imports: [NgIf, TranslateModule]
})
export class BookletConfigShowComponent {
  bookletConfig: BookletConfigDto = bookletConfigDefault;
  @Input('config')
  set config(value: BookletConfigDto | undefined) {
    this.bookletConfig = value || bookletConfigDefault;
  }
}
