import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../../services/workspace.service';
import * as profile from './profile.json';

@Component({
  templateUrl: './unit-metadata.component.html',
  styleUrls: ['unit-metadata.component.scss']
})

export class UnitMetadataComponent implements OnInit, OnDestroy {
  private PROFILES_URL:string = 'https://w3id.org/iqb/profiles/';
  metadata: any = { lang: this.translateService.store.currentLang };
  private ngUnsubscribe = new Subject<void>();
  profile!:any;
  workspaceSettings!: WorkspaceSettingsDto;
  constructor(private workspaceService: WorkspaceService,
              private translateService: TranslateService) {}

  ngOnInit(): void {
    this.workspaceSettings = this.workspaceService.workspaceSettings;
    this.profile = JSON.parse(JSON.stringify(profile));
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
    this.mapFormlyModelToValues(metadata);
    this.workspaceService.unitMetadataStore?.setMetadata(metadata);
  }

  mapFormlyModelToValues(metadata:any): any {
    return {
      profileId: this.PROFILES_URL + this.profile.id,
      entries: [
        Object.entries(metadata.values).map((value:any) => {
          const valuesId = value[1].map((val: { id: string; }) => val.id.split('/')?.pop());
          return ({
            id: value[0],
            label: [
              {
                lang: 'de',
                value: ''
              }
            ],
            value: valuesId
          });
        }
        )
      ]
    };
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
