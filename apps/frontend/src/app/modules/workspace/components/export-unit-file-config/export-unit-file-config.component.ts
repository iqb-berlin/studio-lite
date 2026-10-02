import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { UnitExportContentsDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatCard } from '@angular/material/card';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { ModuleService } from '../../../../services/module.service';
import {
  ExportFileSelection, ExportFileState, ExportFormat, getExportFileSelection, getExportFileStates
} from '../../utils/export-file-options.utils';

/**
 * The file half of the export dialog: the format (XML or JSON) and what travels with the units --
 * players and the optional files (metadata, items, coding scheme, comments, rich notes).
 *
 * The optional files follow the chosen units: a file is offered and checked once one of them has
 * content for it, and locked with a hint while none has ({@link getExportFileStates}).
 *
 * Units without a player are named here, because an export that is meant to run elsewhere is
 * incomplete without one. The player is checked against the whole workspace, not the chosen units.
 */
@Component({
  selector: 'studio-lite-export-unit-file-config',
  templateUrl: './export-unit-file-config.component.html',
  styleUrls: ['./export-unit-file-config.component.scss'],
  imports: [MatCheckbox, FormsModule, TranslateModule, MatCard, MatRadioGroup, MatRadioButton]
})
export class ExportUnitFileConfigComponent implements OnInit, OnChanges, OnDestroy {
  unitsWithOutPlayer: number[] = [];
  enablePlayerOption = true;
  fileStates: ExportFileState[] = [];
  @Input() exportFormat: ExportFormat = 'json';
  @Input() selectedUnitIds: number[] = [];
  @Input() addPlayers!: boolean;
  @Output() exportFormatChange = new EventEmitter<ExportFormat>();
  @Output() addPlayersChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() fileSelectionChange = new EventEmitter<ExportFileSelection>();
  @Output() unitsWithOutPlayerChange = new EventEmitter<number[]>();

  // undefined until the answer arrives; null when the request failed
  private exportContents: UnitExportContentsDto[] | null | undefined;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    public workspaceService: WorkspaceService,
    private moduleService: ModuleService,
    private backendService: WorkspaceBackendService
  ) {}

  ngOnInit(): void {
    this.backendService.getUnitListWithProperties(
      this.workspaceService.selectedWorkspaceId
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(unitsWithMetadata => {
      unitsWithMetadata.forEach(umd => {
        if (umd.player) {
          const validPlayerId = VeronaModuleFactory.isValid(umd.player, Object.keys(this.moduleService.players));
          if (!validPlayerId) this.unitsWithOutPlayer.push(umd.id);
        } else {
          this.unitsWithOutPlayer.push(umd.id);
        }
      });
      this.enablePlayerOption = this.unitsWithOutPlayer.length < unitsWithMetadata.length;
    });
    this.backendService.getUnitExportContents(
      this.workspaceService.selectedWorkspaceId
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(exportContents => {
      this.exportContents = exportContents;
      this.updateFileStates();
    });
  }

  ngOnChanges(): void {
    this.updateFileStates();
  }

  setFileChecked(state: ExportFileState, checked: boolean): void {
    this.fileStates = this.fileStates
      .map(fileState => (fileState === state ? { ...fileState, checked } : fileState));
    this.fileSelectionChange.emit(getExportFileSelection(this.fileStates));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // Until the contents are known no box is offered and nothing is emitted, so the settings keep
  // their defaults instead of a selection made without knowing what the units hold.
  private updateFileStates(): void {
    if (this.exportContents === undefined) return;
    this.fileStates = getExportFileStates(
      this.exportFormat,
      this.selectedUnitIds,
      this.exportContents,
      this.fileStates
    );
    this.fileSelectionChange.emit(getExportFileSelection(this.fileStates));
  }
}
