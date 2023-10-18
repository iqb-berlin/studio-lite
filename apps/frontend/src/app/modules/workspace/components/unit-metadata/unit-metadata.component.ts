import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  templateUrl: './unit-metadata.component.html',
  styleUrls: ['unit-metadata.component.scss']
})

export class UnitMetadataComponent implements OnInit, OnDestroy {
  metadata: any = { lang: this.translateService.store.currentLang };
  private ngUnsubscribe = new Subject<void>();

  constructor(private workspaceService: WorkspaceService,
              private translateService: TranslateService) {}

  ngOnInit(): void {
    this.workspaceService.selectedUnit$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.workspaceService.loadUnitMetadata().then(() => this.setMetadata());
      });
  }

  private setMetadata() {
    const selectedUnitId = this.workspaceService.selectedUnit$.getValue();
    if (selectedUnitId > 0 && this.workspaceService.unitMetadataStore) {
      const unitMetadata = this.workspaceService.unitMetadataStore.getData();
      this.metadata = JSON.parse(JSON.stringify(unitMetadata.metadata)); // use duplicate to destroy the reference
      if (!this.metadata.lang) {
        this.metadata.lang = this.translateService.store.currentLang;
      }
    }
  }

  onMetadataChange(metadata: any): void {
    this.workspaceService.unitMetadataStore?.setMetadata(metadata);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
