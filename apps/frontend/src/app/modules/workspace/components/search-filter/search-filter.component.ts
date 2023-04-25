import {
  Component, EventEmitter, Output
} from '@angular/core';

@Component({
  selector: 'studio-lite-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent {
  value: string = '';
  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
}
