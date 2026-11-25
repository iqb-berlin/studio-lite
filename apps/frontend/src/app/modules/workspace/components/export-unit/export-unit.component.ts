import {
  Component, Inject, OnDestroy, signal
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { BookletConfigDto, UnitDownloadSettingsDto, UnitExportContentsDto } from '@studio-lite-lib/api-dto';
import {
  MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import {
  MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle
} from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { WorkspaceService } from '../../services/workspace.service';
import { BookletConfigEditComponent } from '../booklet-config-edit/booklet-config-edit.component';
import { ExportTestTakerConfigComponent } from '../export-test-taker-config/export-test-taker-config.component';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';
import { ExportUnitFileConfigComponent } from '../export-unit-file-config/export-unit-file-config.component';
import { mapBookletConfigToModernKeys, normalizeLegacyBookletConfig } from '../../utils/booklet-config-export.utils';
import { HasTakersPipe } from '../../pipes/has-takers.pipe';
import { ExportFileSelection } from '../../utils/export-file-options.utils';
import { ExportProblemsComponent, UnitExportProblems } from '../export-problems/export-problems.component';
import { schemeProblemFinding } from '../../utils/scheme-problems.utils';

@Component({
  templateUrl: './export-unit.component.html',
  styleUrls: ['export-unit.component.scss'],
  imports: [
    MatDialogTitle, MatDialogContent, SelectUnitListComponent,
    MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle,
    ExportTestTakerConfigComponent, BookletConfigEditComponent,
    MatDialogActions, MatButton, MatDialogClose,
    TranslateModule, FormsModule, ExportUnitFileConfigComponent,
    MatFormField, MatLabel, MatError, MatInput, MatSelect, MatOption,
    HasTakersPipe
  ]
})
export class ExportUnitComponent implements OnDestroy {
  unitExportSettings: UnitDownloadSettingsDto = {
    unitIdList: [],
    exportFormat: 'xml',
    addComments: false,
    addRichNotes: false,
    addPlayers: false,
    addTestTakersReview: 0,
    addTestTakersMonitor: 0,
    addTestTakersHot: 0,
    passwordLess: false,
    bookletId: 'booklet1',
    bookletLabel: 'Testheft 1',
    groupLabel: 'Gruppe 1',
    bookletSettings: []
  };

  bookletConfigSettings: BookletConfigDto | undefined;

  // The download button locks while the booklet id is invalid, so the reason shows while typing, not only on blur.
  readonly showErrorWhileTyping = new ShowOnDirtyErrorStateMatcher();

  // undefined until the file config has the export contents; the download waits for them (#2119).
  // null when they could not be read: the export stays possible, with a note that nothing was checked.
  private readonly unitsWithExportProblemsState = signal<UnitExportContentsDto[] | null | undefined>(undefined);
  readonly unitsWithExportProblems = this.unitsWithExportProblemsState.asReadonly();
  private readonly problemsDialogOpen = signal(false);
  private ngUnsubscribe = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { units: number[], bookletConfigSettings: BookletConfigDto },
    public workspaceService: WorkspaceService,
    private dialogRef: MatDialogRef<ExportUnitComponent>,
    private dialog: MatDialog
  ) {
    if (this.data && this.data.bookletConfigSettings) {
      this.bookletConfigSettings = normalizeLegacyBookletConfig(data.bookletConfigSettings);
      this.setBookletConfigSettings(this.bookletConfigSettings);
    }
  }

  setBookletConfigSettings(booklet: BookletConfigDto): void {
    this.unitExportSettings.bookletSettings = mapBookletConfigToModernKeys(booklet);
  }

  // addMetadata, addItems and addCodingScheme stay unset until the file config knows what the
  // units hold -- unset means "add" to the API, as before these files became optional. Merged in
  // place: the selection arrives during change detection, and a new settings object would change a
  // binding that was already checked.
  setFileSelection(selection: ExportFileSelection): void {
    Object.assign(this.unitExportSettings, selection);
  }

  setUnitsWithExportProblems(units: UnitExportContentsDto[] | null): void {
    this.unitsWithExportProblemsState.set(units);
  }

  // The chosen units whose export would go wrong are named before it runs, with how to fix them.
  // - Both formats write an id twice where a derived alias equals an element's internal id: the
  //   Testcenter (from version 19) rejects such a unit XML, and a reader of the JSON that looks
  //   variables up by id mixes the two up (#2119).
  // - A coding the schemer rejects makes coding with the exported scheme fail (#2135) -- only when the
  //   scheme is exported. The ids are written either way: both formats carry the derived variables.
  // Exporting anyway stays possible: the other units are fine.
  download(): void {
    if (this.problemsDialogOpen()) return;
    const schemeExported = this.unitExportSettings.addCodingScheme !== false;
    const unitsInList = Object.values(this.workspaceService.unitList).flat();
    // the file config passes on only the units with a problem
    const units: UnitExportProblems[] = (this.unitsWithExportProblems() ?? [])
      .filter(contents => this.unitExportSettings.unitIdList.includes(contents.unitId))
      .map(contents => {
        const unit = unitsInList.find(unitInList => unitInList.id === contents.unitId);
        return {
          id: contents.unitId,
          key: unit?.key ?? String(contents.unitId),
          name: unit?.name,
          conflicts: contents.variableIdConflicts,
          schemeProblems: schemeExported ? contents.schemeProblems.map(schemeProblemFinding) : []
        };
      })
      .filter(unit => unit.conflicts.length || unit.schemeProblems.length);
    if (!units.length) {
      this.dialogRef.close(this.unitExportSettings);
      return;
    }
    this.problemsDialogOpen.set(true);
    this.dialog.open(ExportProblemsComponent, {
      width: '800px',
      data: { units, exportFormat: this.unitExportSettings.exportFormat }
    })
      .afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result => {
        this.problemsDialogOpen.set(false);
        if (result === true) this.dialogRef.close(this.unitExportSettings);
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
