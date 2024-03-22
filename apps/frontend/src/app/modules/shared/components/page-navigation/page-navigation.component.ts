import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { PageData } from '../../../workspace/models/page-data.interface';
import { TranslateModule } from '@ngx-translate/core';
import { WrappedIconComponent } from '../wrapped-icon/wrapped-icon.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'studio-lite-page-navigation',
    templateUrl: './page-navigation.component.html',
    styleUrls: ['./page-navigation.component.scss'],
    standalone: true,
    imports: [NgIf, NgFor, WrappedIconComponent, TranslateModule]
})
export class PageNavigationComponent {
  @Input() pageList!: PageData[];
  @Output() gotoPage = new EventEmitter<{ action: string, index?: number }>();
}
