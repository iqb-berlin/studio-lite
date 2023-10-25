import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  templateUrl: './unit-metadata.component.html',
  styleUrls: ['unit-metadata.component.scss']
})

export class UnitMetadataComponent implements OnInit, OnDestroy {
  metadataLoader: BehaviorSubject<any> = new BehaviorSubject({});
  language: string;
  private ngUnsubscribe = new Subject<void>();
  workspaceSettings!: WorkspaceSettingsDto;

  constructor(private workspaceService: WorkspaceService,
              private translateService: TranslateService) {
    this.language = this.translateService.currentLang;
  }

  ngOnInit(): void {
    this.workspaceSettings = this.workspaceService.workspaceSettings;
    this.workspaceService.selectedUnit$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.workspaceService.loadUnitMetadata().then(() => this.loadMetaData());
      });
  }

  private loadMetaData() {
    const selectedUnitId = this.workspaceService.selectedUnit$.getValue();
    if (selectedUnitId > 0 && this.workspaceService.unitMetadataStore) {
      const unitMetadata = this.workspaceService.unitMetadataStore.getData();
      this.metadataLoader.next(unitMetadata.metadata);
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
