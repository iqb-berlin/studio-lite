import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Component, OnDestroy, OnInit, ViewChild
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
  CreateUnitDto, UnitDownloadSettingsDto, UnitInListDto
} from '@studio-lite-lib/api-dto';
import { MatTabNav } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import * as _moment from 'moment';
import { saveAs } from 'file-saver';
import { AppService } from '../app.service';
import { BackendService } from './backend.service';
import { BackendService as AppBackendService } from '../backend.service';
import { WorkspaceService } from './workspace.service';

import { NewUnitComponent, NewUnitData } from './dialogs/new-unit.component';
import { SelectUnitComponent, SelectUnitData } from './dialogs/select-unit.component';
import { UnitCollection } from './workspace.classes';
import { RequestMessageDialogComponent } from '../components/request-message-dialog.component';
import { ExportUnitComponent } from './dialogs/export-unit.component';
import { VeronaModuleCollection } from '../classes/verona-module-collection.class';
import { MoveUnitComponent, MoveUnitData } from './dialogs/move-unit.component';
import { EditWorkspaceSettingsComponent } from '../components/edit-workspace-settings.component';
import { WorkspaceUserListComponent } from './dialogs/workspace-user-list.component';

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
  navLinks = ['metadata', 'editor', 'preview', 'schemer', 'comments'];

  constructor(
    public appService: AppService,
    public workspaceService: WorkspaceService,
    private backendService: BackendService,
    private appBackendService: AppBackendService,
    private newUnitDialog: MatDialog,
    private selectUnitDialog: MatDialog,
    private messsageDialog: MatDialog,
    private editSettingsDialog: MatDialog,
    private showUsersDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private uploadReportDialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService
  ) {
    this.uploadProcessId = Math.floor(Math.random() * 20000000 + 10000000).toString();
    this.workspaceService.workspaceSettings = {
      defaultEditor: '',
      defaultPlayer: '',
      defaultSchemer: '',
      unitGroups: [],
      stableModulesOnly: true
    };
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.workspaceService.unitList = new UnitCollection([]);
      this.workspaceService.selectedWorkspaceId = Number(this.route.snapshot.params['ws']);
      this.routingSubscription = this.route.params.subscribe(params => {
        this.workspaceService.resetUnitData();
        const unitParam = params['u'];
        if (unitParam) {
          this.workspaceService.selectedUnit$.next(Number(params['u']));
        } else {
          this.workspaceService.selectedUnit$.next(0);
        }
      });

      this.appBackendService.getWorkspaceData(this.workspaceService.selectedWorkspaceId).subscribe(
        wResponse => {
          if (wResponse) {
            this.workspaceService.selectedWorkspaceName = `${wResponse.groupName}: ${wResponse.name}`;
            this.appService.appConfig.setPageTitle(this.workspaceService.selectedWorkspaceName);
            if (wResponse.settings) {
              this.workspaceService.workspaceSettings = wResponse.settings;
            }
            this.workspaceService.isWorkspaceGroupAdmin =
              this.appService.isWorkspaceGroupAdmin(this.workspaceService.selectedWorkspaceId);
            this.updateUnitList();
          } else {
            this.snackBar.open(
              'Konnte Daten für Arbeitsbereich nicht laden', 'Fehler', { duration: 3000 }
            );
          }
        }
      );
      this.appBackendService.getModuleList('editor').subscribe(moduleList => {
        this.appService.editorList = new VeronaModuleCollection(moduleList);
      });
      this.appBackendService.getModuleList('player').subscribe(moduleList => {
        this.appService.playerList = new VeronaModuleCollection(moduleList);
      });
      this.appBackendService.getModuleList('schemer').subscribe(moduleList => {
        this.appService.schemerList = new VeronaModuleCollection(moduleList);
      });
    });
  }

  updateUnitList(unitToSelect?: number): void {
    this.backendService.getUnitList(this.workspaceService.selectedWorkspaceId).subscribe(
      uResponse => {
        this.workspaceService.unitList = new UnitCollection(uResponse);
        const newUnitGroups: string[] = [];
        if (this.workspaceService.workspaceSettings.unitGroups) {
          this.workspaceService.workspaceSettings.unitGroups.forEach(g => {
            if (g && newUnitGroups.indexOf(g) < 0) newUnitGroups.push(g);
          });
        }
        this.workspaceService.unitList.groups.forEach(g => {
          if (g.name && newUnitGroups.indexOf(g.name) < 0) newUnitGroups.push(g.name);
        });
        newUnitGroups.sort();
        this.workspaceService.workspaceSettings.unitGroups = newUnitGroups;
        if (unitToSelect) this.selectUnit(unitToSelect);
        if (uResponse.length === 0) {
          this.workspaceService.selectedUnit$.next(0);
          this.router.navigate([`/a/${this.workspaceService.selectedWorkspaceId}`]);
        }
      }
    );
  }

  async selectUnit(unitId?: number): Promise<boolean> {
    if (unitId && unitId > 0) {
      const selectedTab = this.nav ? this.nav.selectedIndex : -1;
      const routeSuffix = selectedTab >= 0 ? `/${this.navLinks[selectedTab]}` : '';
      return this.router.navigate([`${unitId}${routeSuffix}`], { relativeTo: this.route.parent });
    }
    return this.router.navigate(
      [`a/${this.workspaceService.selectedWorkspaceId}`],
      { relativeTo: this.route.root }
    );
  }

  addUnit() {
    this.addUnitDialog({
      title: 'Neue Aufgabe',
      subTitle: '',
      key: '',
      label: '',
      groups: this.workspaceService.workspaceSettings.unitGroups || []
    }).then((createUnitDto: CreateUnitDto | boolean) => {
      if (typeof createUnitDto !== 'boolean') {
        this.appService.dataLoading = true;
        createUnitDto.player = this.workspaceService.workspaceSettings.defaultPlayer;
        createUnitDto.editor = this.workspaceService.workspaceSettings.defaultEditor;
        createUnitDto.schemer = this.workspaceService.workspaceSettings.defaultSchemer;
        this.backendService.addUnit(
          this.workspaceService.selectedWorkspaceId, createUnitDto
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
    if (newGroup && this.workspaceService.workspaceSettings.unitGroups &&
      this.workspaceService.workspaceSettings.unitGroups.indexOf(newGroup) < 0) {
      this.workspaceService.workspaceSettings.unitGroups.push(newGroup);
      this.appBackendService.setWorkspaceSettings(
        this.workspaceService.selectedWorkspaceId, this.workspaceService.workspaceSettings
      ).subscribe(isOK => {
        this.snackBar.open(isOK ? 'Neue Gruppe gespeichert.' : 'Konnte neue Gruppe nicht speichern',
          isOK ? '' : 'Fehler', { duration: 3000 });
      });
    }
  }

  private async addUnitDialog(newUnitData: NewUnitData): Promise<CreateUnitDto | boolean> {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      const dialogRef = this.newUnitDialog.open(NewUnitComponent, {
        width: '500px',
        data: newUnitData
      });
      return lastValueFrom(dialogRef.afterClosed().pipe(
        map(dialogResult => {
          if (typeof dialogResult !== 'undefined') {
            if (dialogResult !== false) {
              return <CreateUnitDto>{
                key: (<UntypedFormGroup>dialogResult).get('key')?.value.trim(),
                name: (<UntypedFormGroup>dialogResult).get('label')?.value,
                groupName: (<UntypedFormGroup>dialogResult).get('groupSelect')?.value ||
                  (<UntypedFormGroup>dialogResult).get('groupDirect')?.value || ''
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
          this.workspaceService.selectedWorkspaceId,
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
          return false;
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
          subTitle: `Kopie von ${unitSource.key}${unitSource.name ? ` - ${unitSource.name}` : ''}`,
          key: unitSource.key,
          label: unitSource.name || '',
          groups: this.workspaceService.workspaceSettings.unitGroups || []
        }).then((createUnitDto: CreateUnitDto | boolean) => {
          if (typeof createUnitDto !== 'boolean') {
            this.appService.dataLoading = true;
            createUnitDto.createFrom = unitSource.id;
            this.backendService.addUnit(
              this.workspaceService.selectedWorkspaceId, createUnitDto
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
        currentWorkspaceId: this.workspaceService.selectedWorkspaceId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          const dialogComponent = dialogRef.componentInstance;
          if (dialogComponent.targetWorkspace > 0) {
            this.backendService.moveOrCopyUnits(
              this.workspaceService.selectedWorkspaceId,
              dialogComponent.selectedUnits,
              dialogComponent.targetWorkspace, moveOnly
            ).subscribe(uploadStatus => {
              if (typeof uploadStatus === 'boolean') {
                this.snackBar.open(`Konnte Aufgabe(n) nicht ${moveOnly ? 'verschieben' : 'kopieren'}.`,
                  'Fehler', { duration: 3000 });
              } else if (uploadStatus.messages && uploadStatus.messages.length > 0) {
                const dialogRef2 = this.uploadReportDialog.open(RequestMessageDialogComponent, {
                  width: '500px',
                  height: '600px',
                  data: uploadStatus
                });
                dialogRef2.afterClosed().subscribe(() => {
                  this.updateUnitList();
                });
              } else {
                this.snackBar.open(
                  `Aufgabe(n) ${moveOnly ? 'verschoben' : 'kopiert'}`, '', { duration: 1000 }
                );
                this.updateUnitList();
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
        width: '900px'
      });

      dialogRef.afterClosed().subscribe((result: UnitDownloadSettingsDto | boolean) => {
        if (result !== false) {
          this.appService.dataLoading = true;
          this.backendService.downloadUnits(
            this.workspaceService.selectedWorkspaceId,
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
    const dialogRef = this.editSettingsDialog.open(EditWorkspaceSettingsComponent, {
      width: '500px',
      data: this.workspaceService.workspaceSettings
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.workspaceService.workspaceSettings.defaultEditor = result.controls.editorSelector.value;
        this.workspaceService.workspaceSettings.defaultPlayer = result.controls.playerSelector.value;
        this.workspaceService.workspaceSettings.defaultSchemer = result.controls.schemerSelector.value;
        this.workspaceService.workspaceSettings.stableModulesOnly = result.controls.stableModulesOnlyCheckbox.value;
        this.appBackendService.setWorkspaceSettings(
          this.workspaceService.selectedWorkspaceId, this.workspaceService.workspaceSettings
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

  userList(): void {
    this.backendService.getUsersList(this.workspaceService.selectedWorkspaceId).subscribe(dataResponse => {
      if (dataResponse !== false) {
        this.showUsersDialog.open(WorkspaceUserListComponent, {
          width: '800px',
          data: {
            title: `Liste der Nutzer:innen für "${this.workspaceService.selectedWorkspaceName}"`,
            users: dataResponse
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
          this.workspaceService.selectedWorkspaceId,
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
