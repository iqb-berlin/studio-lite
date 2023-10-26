import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../../services/workspace.service';
import { BackendService } from '../../services/backend.service';
import { UnitSchemeStore } from '../../classes/unit-scheme-store';

@Component({
  templateUrl: './unit-metadata.component.html',
  styleUrls: ['unit-metadata.component.scss']
})

export class UnitMetadataComponent implements OnInit, OnDestroy {
  metadataLoader: BehaviorSubject<any> = new BehaviorSubject({});
  itemsLoader: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  language: string;
  private ngUnsubscribe = new Subject<void>();
  workspaceSettings!: WorkspaceSettingsDto;

  constructor(private workspaceService: WorkspaceService,
              private translateService: TranslateService,
              private backendService: BackendService
  ) {
    this.language = this.translateService.currentLang;
  }

  ngOnInit(): void {
    this.workspaceSettings = this.workspaceService.workspaceSettings;
    this.workspaceService.selectedUnit$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.workspaceService.loadUnitMetadata().then(() => this.loadMetaData());
      });
    const unitId = this.workspaceService.selectedUnit$.getValue();
    if (!this.workspaceService.unitSchemeStore) {
      this.backendService.getUnitScheme(this.workspaceService.selectedWorkspaceId, unitId)
        .subscribe(ues => {
          if (ues) {
            this.workspaceService.unitSchemeStore = new UnitSchemeStore(unitId, ues);
            this.itemsLoader.next(this.getItems());
          }
        });
    } else {
      this.itemsLoader.next(this.getItems());
    }
  }

  getItems(): string[] {
    const data = this.workspaceService.unitSchemeStore?.getData();
    if (data) {
      const variables = data.variables || [];
      const variableIds = variables.map((variable: any) => variable.id);
      const scheme = JSON.parse(data.scheme);
      const variableCodings = scheme?.variableCodings || [];
      const variableCodingIds = variableCodings.map((item: any) => item.id);
      // merge without duplicates
      return [...new Set([...variableIds, ...variableCodingIds])];
    }
    return [];
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
