import {
  Component, EventEmitter, Output
} from '@angular/core';

@Component({
  selector: 'studio-lite-search-unit',
  templateUrl: './search-unit.component.html',
  styleUrls: ['./search-unit.component.scss']
})
export class SearchUnitComponent {
  value: string = '';
  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
}
