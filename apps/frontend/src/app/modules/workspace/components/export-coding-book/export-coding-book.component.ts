import {
  Component, OnDestroy, OnInit, Optional
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { saveAs } from 'file-saver-es';
import { CodebookExportComponent, DEFAULT_CODEBOOK_OPTIONS } from '@iqb/ngx-coding-components/codebook-export';
import type { CodebookExportConfig, MissingsProfile, UnitSelectionItem } from '@iqb/ngx-coding-components/codebook-models';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { AppService } from '../../../../services/app.service';
import { I18nService } from '../../../../services/i18n.service';

@Component({
  templateUrl: './export-coding-book.component.html',
  imports: [CodebookExportComponent, TranslateModule],
  styleUrls: ['./export-coding-book.component.scss']
})
export class ExportCodingBookComponent implements OnInit, OnDestroy {
  units: UnitSelectionItem[] = [];
  missingsProfiles: MissingsProfile[] = [];
  unitList: number[] = [];
  contentOptions = { ...DEFAULT_CODEBOOK_OPTIONS };
  loading = false;
  exporting = false;
  error = false;
  private readonly destroyed = new Subject<void>();

  constructor(public workspaceService: WorkspaceService,
              private backendService: WorkspaceBackendService,
              private appService: AppService,
              private i18nService: I18nService,
              @Optional() private dialogRef: MatDialogRef<ExportCodingBookComponent>) {}

  get workspaceChanges(): boolean { return this.workspaceService.isChanged(); }

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      units: this.backendService.getUnitList(this.workspaceService.selectedWorkspaceId),
      profiles: this.backendService.getMissingsProfiles()
    })
      .pipe(takeUntil(this.destroyed), finalize(() => { this.loading = false; }))
      .subscribe({
        next: ({ units, profiles }) => {
          this.units = units.map(unit => ({
            unitId: unit.id, key: unit.key, unitName: unit.name || '', groupName: unit.groupName || ''
          }));
          this.unitList = units.filter(unit => unit.id === this.workspaceService.selectedUnit$.value).map(unit => unit.id);
          this.missingsProfiles = profiles.map((profile, index) => ({ id: profile.id || index + 1, label: profile.label }));
        },
        error: () => { this.error = true; }
      });
  }

  exportCodingBook(config: CodebookExportConfig): void {
    if (this.exporting || this.workspaceChanges || !config.selectedUnits.length) return;
    this.exporting = true;
    this.error = false;
    this.appService.dataLoading = true;
    this.backendService.getCodingBook(this.workspaceService.selectedWorkspaceId, config.contentOptions.missingsProfile, config.contentOptions, config.selectedUnits)
      .pipe(takeUntil(this.destroyed), finalize(() => {
        this.exporting = false;
        this.appService.dataLoading = false;
      }))
      .subscribe({
        next: data => {
          if (!data) { this.error = true; return; }
          const date = new DatePipe(this.i18nService.fullLocale).transform(new Date(), this.i18nService.fileDateFormat);
          saveAs(data, `${date} Codebook ${this.workspaceService.selectedWorkspaceName}.${config.contentOptions.exportFormat}`);
          this.dialogRef?.close({ selectedUnits: config.selectedUnits });
        },
        error: () => { this.error = true; }
      });
  }

  close(): void { this.dialogRef?.close(false); }

  ngOnDestroy(): void { this.destroyed.next(); this.destroyed.complete(); }
}
