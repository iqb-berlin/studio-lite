import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';

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
  private ngUnsubscribe = new Subject<void>();

  ngOnInit(): void {
    this.expandAll.pipe(takeUntil(this.ngUnsubscribe)).subscribe(expanded => {
      this.expanded = expanded;
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
