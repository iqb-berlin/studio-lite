import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Component, Inject, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import {
  Subscription, map, lastValueFrom
} from 'rxjs';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  MessageDialogComponent,
  MessageDialogData, MessageType
} from '@studio-lite-lib/iqb-components';
import {
  CreateUnitDto, UnitDownloadSettingsDto, UnitInListDto, WorkspaceSettingsDto
} from '@studio-lite-lib/api-dto';
import { MatTabNav } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import * as _moment from 'moment';
import { saveAs } from 'file-saver';
import { AppService } from '../app.service';
import { BackendService } from './backend.service';
import { WorkspaceService } from './workspace.service';

import { NewUnitComponent, NewUnitData } from './dialogs/new-unit.component';
import { SelectUnitComponent, SelectUnitData } from './dialogs/select-unit.component';
import { BackendService as SuperAdminBackendService } from '../admin/backend.service';
import { UnitCollection } from './workspace.classes';
import { RequestMessageDialogComponent } from '../components/request-message-dialog.component';
import { ExportUnitComponent } from './dialogs/export-unit.component';
import { VeronaModuleCollection } from './verona-module-collection.class';
import { MoveUnitComponent, MoveUnitData } from './dialogs/move-unit.component';
import { EditSettingsComponent } from './dialogs/edit-settings.component';

@Component({
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  @ViewChild(MatTabNav) nav: MatTabNav | undefined;
  private routingSubscription: Subscription | null = null;
  private uploadSubscription: Subscription | null = null;
  uploadProcessId = '';
  uploadUrl = '';
  uploadMessages: string[] = [];
  navLinks = [
    { path: 'metadata', label: 'Eigenschaften' },
    { path: 'editor', label: 'Editor' },
    { path: 'preview', label: 'Vorschau' },
    { path: 'schemer', label: 'Kodierung' }
  ];

  workspacesSettings: WorkspaceSettingsDto;

  constructor(
    @Inject('SERVER_URL') private serverUrl: string,
    private appService: AppService,
    public workspaceService: WorkspaceService,
    private backendService: BackendService,
    private bsSuper: SuperAdminBackendService,
    private newUnitDialog: MatDialog,
    private selectUnitDialog: MatDialog,
    private messsageDialog: MatDialog,
    private editSettingsDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private uploadReportDialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService
  ) {
    this.uploadProcessId = Math.floor(Math.random() * 20000000 + 10000000).toString();
    this.workspacesSettings = {
      defaultEditor: '',
      defaultPlayer: '',
      unitGroups: []
    };
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.workspaceService.unitList = new UnitCollection([]);
      this.workspaceService.selectedWorkspace = Number(this.route.snapshot.params['ws']);
      this.routingSubscription = this.route.params.subscribe(params => {
        this.workspaceService.resetUnitData();
        const unitParam = params['u'];
        if (unitParam) {
          this.workspaceService.selectedUnit$.next(Number(params['u']));
        } else {
          this.workspaceService.selectedUnit$.next(0);
        }
      });

      this.backendService.getWorkspaceData(this.workspaceService.selectedWorkspace).subscribe(
        wResponse => {
          if (wResponse) {
            this.appService.appConfig.setPageTitle(`${wResponse.groupName}: ${wResponse.name}`);
            if (wResponse.settings) {
              this.workspacesSettings = wResponse.settings;
            }
            this.updateUnitList();
          } else {
            this.snackBar.open(
              'Konnte Daten für Arbeitsbereich nicht laden', 'Fehler', { duration: 3000 }
            );
          }
        }
      );
      this.backendService.getModuleList('editor').subscribe(moduleList => {
        this.workspaceService.editorList = new VeronaModuleCollection(moduleList);
      });
      this.backendService.getModuleList('player').subscribe(moduleList => {
        this.workspaceService.playerList = new VeronaModuleCollection(moduleList);
      });
      this.backendService.getModuleList('schemer').subscribe(moduleList => {
        this.workspaceService.schemerList = new VeronaModuleCollection(moduleList);
      });
    });
  }

  updateUnitList(unitToSelect?: number): void {
    this.backendService.getUnitList(this.workspaceService.selectedWorkspace).subscribe(
      uResponse => {
        this.workspaceService.unitList = new UnitCollection(uResponse);
        if (unitToSelect) this.selectUnit(unitToSelect);
        if (uResponse.length === 0) {
          this.workspaceService.selectedUnit$.next(0);
          this.router.navigate([`/a/${this.workspaceService.selectedWorkspace}`]);
        }
      }
    );
  }

  async selectUnit(unitId?: number): Promise<boolean> {
    if (unitId && unitId > 0) {
      const selectedTab = this.nav ? this.nav.selectedIndex : -1;
      const routeSuffix = selectedTab >= 0 ? `/${this.navLinks[selectedTab].path}` : '';
      return this.router.navigate([`${unitId}${routeSuffix}`], { relativeTo: this.route.parent });
    }
    return this.router.navigate(
      [`a/${this.workspaceService.selectedWorkspace}`],
      { relativeTo: this.route.root }
    );
  }

  addUnit() {
    this.addUnitDialog({
      title: 'Neue Aufgabe',
      subTitle: '',
      key: '',
      label: '',
      groups: this.workspacesSettings.unitGroups || []
    }).then((createUnitDto: CreateUnitDto | boolean) => {
      if (typeof createUnitDto !== 'boolean') {
        this.appService.dataLoading = true;
        createUnitDto.player = this.workspacesSettings.defaultPlayer;
        createUnitDto.editor = this.workspacesSettings.defaultEditor;
        this.backendService.addUnit(
          this.workspaceService.selectedWorkspace, createUnitDto
        ).subscribe(
          respOk => {
            if (respOk) {
              this.snackBar.open('Aufgabe hinzugefügt', '', { duration: 1000 });
              this.addUnitGroup(createUnitDto.groupName);
              this.updateUnitList(respOk);
            } else {
              this.snackBar.open('Konnte Aufgabe nicht hinzufügen', 'Fehler', { duration: 3000 });
            }
            this.appService.dataLoading = false;
          }
        );
      }
    });
  }

  private addUnitGroup(newGroup: string | undefined) {
    if (newGroup && this.workspacesSettings.unitGroups &&
      this.workspacesSettings.unitGroups.indexOf(newGroup) < 0) {
      this.workspacesSettings.unitGroups.push(newGroup);
      this.backendService.setWorkspaceSettings(
        this.workspaceService.selectedWorkspace,this.workspacesSettings).subscribe(isOK => {
        this.snackBar.open(isOK ? 'Neue Gruppe gespeichert.' : 'Konnte neue Gruppe nicht speichern',
          isOK ? '' : 'Fehler', { duration: 3000 });
      });
    }
  }

  private async addUnitDialog(newUnitData: NewUnitData): Promise<CreateUnitDto | boolean> {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      const dialogRef = this.newUnitDialog.open(NewUnitComponent, {
        width: '600px',
        data: newUnitData,
      });
      return lastValueFrom(dialogRef.afterClosed().pipe(
        map(dialogResult => {
          if (typeof dialogResult !== 'undefined') {
            if (dialogResult !== false) {
              return <CreateUnitDto>{
                key: (<FormGroup>dialogResult).get('key')?.value.trim(),
                name: (<FormGroup>dialogResult).get('label')?.value,
                groupName: (<FormGroup>dialogResult).get('groupSelect')?.value ||
                  (<FormGroup>dialogResult).get('groupDirect')?.value || ''
              };
            }
          }
          return false;
        })
      ));
    }
    return false;
  }

  deleteUnit(): void {
    this.deleteUnitDialog().then((unitsToDelete: number[] | boolean) => {
      if (typeof unitsToDelete !== 'boolean') {
        this.backendService.deleteUnits(
          this.workspaceService.selectedWorkspace,
          unitsToDelete
        ).subscribe(
          ok => {
            // todo db-error?
            if (ok) {
              this.updateUnitList();
              this.snackBar.open('Aufgabe(n) gelöscht', '', { duration: 1000 });
            } else {
              this.snackBar.open('Konnte Aufgabe(n) nicht löschen.', 'Fehler', { duration: 3000 });
              this.appService.dataLoading = false;
            }
          }
        );
      }
    });
  }

  private async deleteUnitDialog(): Promise<number[] | boolean> {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      const dialogRef = this.selectUnitDialog.open(SelectUnitComponent, {
        width: '500px',
        height: '700px',
        data: <SelectUnitData>{
          title: 'Aufgabe(n) löschen',
          buttonLabel: 'Löschen',
          fromOtherWorkspacesToo: false,
          multiple: true
        }
      });
      return lastValueFrom(dialogRef.afterClosed().pipe(
        map(dialogResult => {
          if (typeof dialogResult !== 'undefined') {
            const dialogComponent = dialogRef.componentInstance;
            if (dialogResult !== false && dialogComponent.selectedUnitIds.length > 0) {
              return dialogComponent.selectedUnitIds;
            }
          }
          return false
        })
      ));
    }
    return false;
  }

  addUnitFromExisting(): void {
    this.addUnitFromExistingDialog().then((unitSource: UnitInListDto | boolean) => {
      if (typeof unitSource !== 'boolean') {
        this.addUnitDialog({
          title: 'Neue Aufgabe aus vorhandener',
          subTitle: `Kopie von ${unitSource.key}${unitSource.name ? ' - ' + unitSource.name : ''}`,
          key: unitSource.key,
          label: unitSource.name || '',
          groups: this.workspacesSettings.unitGroups || []
        }).then((createUnitDto: CreateUnitDto | boolean) => {
          if (typeof createUnitDto !== 'boolean') {
            this.appService.dataLoading = true;
            createUnitDto.createFrom = unitSource.id;
            this.backendService.addUnit(
              this.workspaceService.selectedWorkspace, createUnitDto
            ).subscribe(
              respOk => {
                if (respOk) {
                  this.snackBar.open('Aufgabe hinzugefügt', '', { duration: 1000 });
                  this.addUnitGroup(createUnitDto.groupName);
                  this.updateUnitList(respOk);
                } else {
                  this.snackBar.open('Konnte Aufgabe nicht hinzufügen', 'Fehler', { duration: 3000 });
                }
                this.appService.dataLoading = false;
              }
            );
          }
        });
      }
    });
  }

  private async addUnitFromExistingDialog(): Promise<UnitInListDto | boolean> {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      const dialogRef = this.selectUnitDialog.open(SelectUnitComponent, {
        width: '500px',
        height: '700px',
        data: <SelectUnitData>{
          title: 'Neue Aufgabe (Kopie)',
          buttonLabel: 'Weiter',
          fromOtherWorkspacesToo: true,
          multiple: false
        }
      });
      return lastValueFrom(dialogRef.afterClosed().pipe(
        map(dialogResult => {
          if (typeof dialogResult !== 'undefined') {
            const dialogComponent = dialogRef.componentInstance;
            if (dialogResult !== false && dialogComponent.selectedUnitIds.length === 1) {
              return <UnitInListDto>{
                id: dialogComponent.selectedUnitIds[0],
                key: dialogComponent.selectedUnitKey,
                name: dialogComponent.selectedUnitName
              };
            }
          }
          return false;
        })
      ));
    }
    return false;
  }

  moveOrCopyUnit(moveOnly: boolean): void {
    const dialogRef = this.selectUnitDialog.open(MoveUnitComponent, {
      width: '500px',
      height: '700px',
      data: <MoveUnitData>{
        title: moveOnly ? 'Aufgabe(n) verschieben' : 'Aufgabe(n) kopieren',
        buttonLabel: moveOnly ? 'Verschieben' : 'Kopieren',
        currentWorkspaceId: this.workspaceService.selectedWorkspace
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          const dialogComponent = dialogRef.componentInstance;
          if (dialogComponent.targetWorkspace > 0) {
            this.backendService.moveOrCopyUnits(
              this.workspaceService.selectedWorkspace,
              dialogComponent.selectedUnits,
              dialogComponent.targetWorkspace, moveOnly
            ).subscribe(uploadStatus => {
              if (typeof uploadStatus === 'boolean') {
                this.snackBar.open(`Konnte Aufgabe(n) nicht ${moveOnly ? 'verschieben' : 'kopieren'}.`,
                  'Fehler', {duration: 3000});
              } else {
                if (uploadStatus.messages && uploadStatus.messages.length > 0) {
                  const dialogRef = this.uploadReportDialog.open(RequestMessageDialogComponent, {
                    width: '500px',
                    height: '600px',
                    data: uploadStatus
                  });
                  dialogRef.afterClosed().subscribe(() => {
                    this.updateUnitList();
                  });
                } else {
                  this.snackBar.open(`Aufgabe(n) ${moveOnly ? 'verschoben' : 'kopiert'}`, '', {duration: 1000});
                  this.updateUnitList();
                }
              }
            });
          }
        }
      }
    });
  }

  exportUnit(): void {
    if (this.workspaceService.unitList.units().length > 0) {
      const dialogRef = this.selectUnitDialog.open(ExportUnitComponent, {
        width: '800px'
      });

      dialogRef.afterClosed().subscribe((result: UnitDownloadSettingsDto | boolean) => {
        if (result !== false) {
          this.appService.dataLoading = true;
          this.backendService.downloadUnits(
            this.workspaceService.selectedWorkspace,
            result as UnitDownloadSettingsDto
          ).subscribe(b => {
            if (b) {
              if (typeof b === 'number') {
                this.appService.dataLoading = b;
              } else {
                const thisMoment = _moment().format('YYYY-MM-DD');
                saveAs(b, `${thisMoment} studio unit download.zip`);
                this.appService.dataLoading = false;
              }
            }
          });
        }
      });
    } else {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: this.translate.instant('unit-download.dialog.title'),
          content: 'Dieser Arbeitsbereich enthält keine Units!',
          type: MessageType.error
        }
      });
    }
  }

  settings(): void {
    const dialogRef = this.editSettingsDialog.open(EditSettingsComponent, {
      width: '600px',
      height: '300px',
      data: this.workspacesSettings
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.backendService.setWorkspaceSettings(
          this.workspaceService.selectedWorkspace,
          <WorkspaceSettingsDto>{
            defaultEditor: result.controls.editorSelector.value,
            defaultPlayer: result.controls.playerSelector.value,
            unitGroups: []
          }
        ).subscribe(isOK => {
          if (!isOK) {
            this.snackBar.open('Einstellungen konnten nicht gespeichert werden.', '', { duration: 3000 });
          } else {
            this.snackBar.open('Einstellungen gespeichert', '', { duration: 1000 });
          }
        });
      }
    });
  }

  saveUnitData(): void {
    this.workspaceService.saveUnitData().then(saveResult => {
      if (saveResult) {
        this.snackBar.open('Änderungen an Aufgabedaten gespeichert', '', { duration: 1000 });
      } else {
        this.snackBar.open('Problem: Konnte Aufgabendaten nicht speichern', '', { duration: 3000 });
      }
    });
  }

  discardChanges(): void {
    const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: 'Verwerfen der Änderungen',
        content: 'Die Änderungen an der Aufgabe werden verworfen. Fortsetzen?',
        confirmButtonLabel: 'Verwerfen',
        showCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        if (this.workspaceService.unitMetadataStore) this.workspaceService.unitMetadataStore.restore();
        if (this.workspaceService.unitDefinitionStore) this.workspaceService.unitDefinitionStore.restore();
        const unitId = this.workspaceService.selectedUnit$.getValue();
        this.workspaceService.selectedUnit$.next(unitId);
      }
    });
  }

  resetUpload() {
    if (this.uploadSubscription !== null) {
      this.uploadSubscription.unsubscribe();
      this.uploadSubscription = null;
    }
  }

  onFileSelected(targetElement: EventTarget | null) {
    if (targetElement) {
      const inputElement = targetElement as HTMLInputElement;
      if (inputElement.files && inputElement.files.length > 0) {
        this.appService.dataLoading = true;
        this.uploadSubscription = this.backendService.uploadUnits(
          this.workspaceService.selectedWorkspace,
          inputElement.files
        ).subscribe(uploadStatus => {
          if (typeof uploadStatus === 'number') {
            if (uploadStatus < 0) {
              this.appService.dataLoading = false;
              console.error(uploadStatus);
            } else {
              this.appService.dataLoading = uploadStatus;
            }
          } else {
            this.appService.dataLoading = false;
            if (uploadStatus.messages && uploadStatus.messages.length > 0) {
              const dialogRef = this.uploadReportDialog.open(RequestMessageDialogComponent, {
                width: '500px',
                height: '600px',
                data: uploadStatus
              });
              dialogRef.afterClosed().subscribe(() => {
                this.resetUpload();
                this.updateUnitList();
              });
            } else {
              this.resetUpload();
              this.updateUnitList();
            }
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.routingSubscription !== null) {
      this.routingSubscription.unsubscribe();
    }
    if (this.uploadSubscription !== null) {
      this.uploadSubscription.unsubscribe();
    }
  }
}
