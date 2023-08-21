import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'studio-lite-unit-group',
  templateUrl: './unit-group.component.html',
  styleUrls: ['./unit-group.component.scss']
})
export class UnitGroupComponent implements OnInit {
  @Input() title!: string;
  @Input() expanded!: boolean;
  @Input() count!: number;
  @Input() expandAll!: BehaviorSubject<boolean>;
  @Output() expandedChange = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.expandAll.subscribe(expanded => { this.expanded = expanded; });
  }
}
