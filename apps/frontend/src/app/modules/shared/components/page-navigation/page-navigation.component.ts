import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PageData } from '../../../workspace/models/page-data.interface';
import { WrappedIconComponent } from '../wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss'],
  imports: [WrappedIconComponent, TranslateModule]
})
export class PageNavigationComponent {
  @Input() pageList!: PageData[];
  @Output() gotoPage = new EventEmitter<{ action: string, index?: number }>();
}
