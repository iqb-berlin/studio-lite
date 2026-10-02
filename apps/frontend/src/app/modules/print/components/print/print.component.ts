import {
  Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
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
  /**
   * The sheet in landscape. `styles.scss` sets A4 portrait for every page, and `@page` holds for the
   * whole document, so landscape is a rule of its own that comes after it -- the width of
   * `html, body` included, or the content would stay 210 mm wide on a sheet of 297 mm (#1765).
   */
  static readonly LANDSCAPE_RULES =
    '@page { size: A4 landscape; } @media print { html, body { width: 297mm; height: 210mm; } }';

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  unitIds!: number[];
  printPreviewHeight!: number;
  printOptions!: PrintOption[];
  workspaceId!: number;
  workspaceGroupId!: number;

  private ngUnsubscribe = new Subject<void>();
  private landscapeStyle: HTMLStyleElement | null = null;

  constructor(
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.route.queryParamMap
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        this.printPreviewHeight = Number(params.get('printPreviewHeight'));
        this.printOptions = params.getAll('printOptions') as PrintOption[];
        this.unitIds = params.getAll('unitIds').map(unitId => Number(unitId));
        this.workspaceId = Number(params.get('workspaceId'));
        this.workspaceGroupId = Number(params.get('workspaceGroupId'));
        this.setLandscape(this.printOptions.includes('printLandscape'));
      });
  }

  addToScrollPosition(summand: number) {
    this.scrollContainer.nativeElement.scrollTop += summand;
  }

  ngOnDestroy(): void {
    this.setLandscape(false);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private setLandscape(landscape: boolean): void {
    if (landscape && !this.landscapeStyle) {
      this.landscapeStyle = this.document.createElement('style');
      this.landscapeStyle.textContent = PrintComponent.LANDSCAPE_RULES;
      this.document.head.appendChild(this.landscapeStyle);
    } else if (!landscape && this.landscapeStyle) {
      this.landscapeStyle.remove();
      this.landscapeStyle = null;
    }
  }
}
