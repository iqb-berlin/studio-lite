import { TranslateParser, TranslateService } from '@ngx-translate/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Injectable } from '@angular/core';

@Injectable()
export class PaginatorIntlService extends MatPaginatorIntl {
  private rangeLabelIntl!: string;

  constructor(private translateService: TranslateService, private translateParser: TranslateParser) {
    super();
    this.init();
  }

  init() {
    this.getTranslations();
    this.translateService.onLangChange
      .subscribe(() => this.getTranslations());
  }

  getTranslations() {
    this.translateService.get([
      'paginator.items-per-page',
      'paginator.next-page',
      'paginator.previous-page',
      'paginator.range'
    ])
      .subscribe(translation => {
        this.itemsPerPageLabel = translation['paginator.items-per-page'];
        this.nextPageLabel = translation['paginator.next-page'];
        this.previousPageLabel = translation['paginator.previous-page'];
        this.rangeLabelIntl = translation['paginator.range'];
        this.changes.next();
      });
  }

  override getRangeLabel = (pageIndex: number, pageSize: number, length: number): string => {
    const total = Math.max(length, 0);
    const startIndex = (pageIndex * pageSize);
    const end = startIndex < total ?
      Math.min(startIndex + pageSize, total) :
      startIndex + pageSize;
    const start = startIndex + 1; // +1 because we want to start counting from 1, not 0
    return this.translateParser
      .interpolate(this.rangeLabelIntl, { start, end, total }) || '';
  };
}
