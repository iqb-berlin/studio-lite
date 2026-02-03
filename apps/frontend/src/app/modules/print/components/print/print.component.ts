import {
  Component, ElementRef, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { PrintOption } from '../../models/print-options.interface';
import { UnitPrintLayoutComponent } from '../unit-print-layout/unit-print-layout.component';

@Component({
  selector: 'studio-lite-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss'],
  imports: [UnitPrintLayoutComponent]
})
export class PrintComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  unitIds!: number[];
  printPreviewHeight!: number;
  printOptions!: PrintOption[];
  workspaceId!: number;
  workspaceGroupId!: number;

  private ngUnsubscribe = new Subject<void>();

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParamMap
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        this.printPreviewHeight = Number(params.get('printPreviewHeight'));
        this.printOptions = params.getAll('printOptions') as PrintOption[];
        this.unitIds = params.getAll('unitIds').map(unitId => Number(unitId));
        this.workspaceId = Number(params.get('workspaceId'));
        this.workspaceGroupId = Number(params.get('workspaceGroupId'));
      });
  }

  addToScrollPosition(summand: number) {
    this.scrollContainer.nativeElement.scrollTop += summand;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
