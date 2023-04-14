import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { PageData } from '../../models/page-data';

@Component({
  selector: 'studio-lite-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss']
})
export class PageNavigationComponent {
  @Input() pageList!: PageData[];
  @Output() gotoPage = new EventEmitter<{ action: string, index?: number }>();
}
