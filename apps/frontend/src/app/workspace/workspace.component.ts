import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Component, Inject, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { CreateUnitDto, UnitInListDto, WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { MatTabNav } from '@angular/material/tabs';
import { Subscription, map, lastValueFrom } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { AppService } from '../app.service';
import { BackendService, WorkspaceSettings } from './backend.service';
import { WorkspaceService } from './workspace.service';
import { NewUnitComponent } from './dialogs/new-unit.component';
import { SelectUnitComponent } from './dialogs/select-unit.component';
import { MoveUnitComponent } from './dialogs/moveunit.component';
import { BackendService as SuperAdminBackendService } from '../admin/backend.service';
import { ExportUnitComponent } from './dialogs/export-unit.component';
import { EditSettingsComponent } from './dialogs/edit-settings.component';
import { ModuleCollection, UnitCollection } from './workspace.classes';

@Component({
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  @ViewChild(MatTabNav) nav: MatTabNav | undefined;
  private routingSubscription: Subscription | null = null;
  uploadProcessId = '';
  uploadUrl = '';
  uploadMessages: string[] = [];
  navLinks = [
    { path: 'metadata', label: 'Eigenschaften' },
    { path: 'editor', label: 'Editor' },
    { path: 'preview', label: 'Vorschau' }
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
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
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
          this.appService.appConfig.setPageTitle(`${wResponse.groupName}: ${wResponse.name}`);
          if (wResponse.settings) {
            this.workspacesSettings = wResponse.settings;
          }
          this.updateUnitList();
        },
        err => {
          this.snackBar.open(
            `Konnte Daten für Arbeitsbereich nicht laden (${err.code})`, 'Fehler', { duration: 3000 }
          );
        }
      );
      this.backendService.getModuleList('editor').subscribe(moduleList => {
        this.workspaceService.editorList = new ModuleCollection(moduleList);
      });
      this.backendService.getModuleList('player').subscribe(moduleList => {
        this.workspaceService.playerList = new ModuleCollection(moduleList);
      });
    });
  }

  updateUnitList(unitToSelect?: number): void {
    this.backendService.getUnitList(this.workspaceService.selectedWorkspace).subscribe(
      uResponse => {
        this.workspaceService.unitList = new UnitCollection(uResponse);
        if (unitToSelect) this.selectUnit(unitToSelect);
      },
      err => {
        this.appService.errorMessage = err.msg();
        this.workspaceService.unitList = new UnitCollection([]);
        this.workspaceService.selectedUnit$.next(0);
        this.router.navigate([`/a/${this.workspaceService.selectedWorkspace}`]);
      }
    );
  }

  async selectUnit(unitId?: number): Promise<boolean> {
    if (unitId && unitId > 0) {
      const selectedTab = this.nav ? this.nav.selectedIndex : -1;
      const routeSuffix = selectedTab >= 0 ? `/${this.navLinks[selectedTab].path}` : '';
      return this.router.navigate([`${unitId}${routeSuffix}`], { relativeTo: this.route.parent });
    }
    return this.router.navigate([`a/${this.workspaceService.selectedWorkspace}`], { relativeTo: this.route.root });
  }

  addUnit() {
    this.addUnitDialog().then((createUnitDto: CreateUnitDto | boolean) => {
      if (typeof createUnitDto !== 'boolean') {
        this.appService.dataLoading = true;
        this.backendService.addUnit(
          this.workspaceService.selectedWorkspace, createUnitDto
        ).subscribe(
          respOk => {
            if (respOk > 0) {
              this.snackBar.open('Aufgabe hinzugefügt', '', { duration: 1000 });
              this.updateUnitList(respOk);
            } else {
              this.snackBar.open('Konnte Aufgabe nicht hinzufügen', 'Fehler', { duration: 3000 });
            }
            this.appService.dataLoading = false;
          },
          err => {
            this.snackBar.open(`Konnte Aufgabe nicht hinzufügen (${err.code})`, 'Fehler', { duration: 3000 });
            this.appService.dataLoading = false;
          }
        );
      }
    });
  }

  async addUnitDialog(): Promise<CreateUnitDto | boolean> {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      const dialogRef = this.newUnitDialog.open(NewUnitComponent, {
        width: '600px',
        data: {
          title: 'Neue Aufgabe',
          key: '',
          label: ''
        }
      });
      return lastValueFrom(dialogRef.afterClosed().pipe(
        map(dialogResult => {
          if (typeof dialogResult !== 'undefined') {
            if (dialogResult !== false) {
              return <CreateUnitDto>{
                key: (<FormGroup>dialogResult).get('key')?.value.trim(),
                name: (<FormGroup>dialogResult).get('label')?.value
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
          },
          err => {
            this.snackBar.open(`Konnte Aufgabe(n) nicht löschen (${err.code})`, 'Fehler', { duration: 3000 });
            this.appService.dataLoading = false;
          }
        );
      }
    });
  }

  async deleteUnitDialog(): Promise<number[] | boolean> {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      const dialogRef = this.selectUnitDialog.open(SelectUnitComponent, {
        width: '400px',
        height: '700px',
        data: {
          title: 'Aufgabe(n) löschen',
          buttonLabel: 'Löschen'
        }
      });
      return lastValueFrom(dialogRef.afterClosed().pipe(
        map(dialogResult => {
          if (typeof dialogResult !== 'undefined') {
            if (dialogResult !== false) {
              return (dialogResult as UnitInListDto[]).map(ud => ud.id);
            }
          }
          return false;
        })
      ));
    }
    return false;
  }

  moveUnit(): void {
    const dialogRef = this.selectUnitDialog.open(MoveUnitComponent, {
      width: '600px',
      height: '700px',
      data: {
        title: 'Aufgabe(n) verschieben',
        buttonLabel: 'Verschieben',
        currentWorkspaceId: this.workspaceService.selectedWorkspace
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          const dialogComponent = dialogRef.componentInstance;
          const wsSelected = dialogComponent.selectForm ? dialogComponent.selectForm.get('wsSelector') : false;
          if (wsSelected) {
            this.backendService.moveUnits(
              this.workspaceService.selectedWorkspace,
              (dialogComponent.tableSelectionCheckbox.selected as UnitInListDto[]).map(ud => ud.id),
              wsSelected.value
            ).subscribe(
              moveResponse => {
                if (typeof moveResponse === 'number') {
                  this.snackBar.open(`Es konnte(n) ${moveResponse} Aufgabe(n) nicht verschoben werden.`,
                    'Fehler', { duration: 3000 });
                } else {
                  this.snackBar.open('Aufgabe(n) verschoben', '', { duration: 1000 });
                }
                this.updateUnitList();
              },
              err => {
                this.snackBar.open(`Konnte Aufgabe nicht verschieben (${err.code})`, 'Fehler', { duration: 3000 });
              }
            );
          }
        }
      }
    });
  }

  copyUnit(): void {
    const myUnitId = this.workspaceService.selectedUnit$.getValue();
    /*
    if (myUnitId > 0) {
      this.backendService.getUnitMetadata(
        this.ds.selectedWorkspace,
        myUnitId
      ).subscribe(
        newUnit => {
          if (newUnit.id === myUnitId) {
            const dialogRef = this.newUnitDialog.open(NewUnitComponent, {
              width: '600px',
              data: {
                title: `Aufgabe ${newUnit.key} in neue Aufgabe kopieren`,
                key: newUnit.key,
                label: newUnit.label
              }
            });

            dialogRef.afterClosed().subscribe(result => {
              if (typeof result !== 'undefined') {
                if (result !== false) {
                  this.appService.dataLoading = true;
                  this.backendService.copyUnit(
                    this.ds.selectedWorkspace,
                    myUnitId,
                    (<FormGroup>result).get('key')?.value,
                    (<FormGroup>result).get('label')?.value
                  ).subscribe(
                    respOk => {
                      // todo db-error?
                      if (respOk) {
                        this.snackBar.open('Aufgabe hinzugefügt', '', { duration: 1000 });
                        this.updateUnitList(respOk);
                      } else {
                        this.snackBar.open('Konnte Aufgabe nicht hinzufügen', 'Fehler', { duration: 3000 });
                      }
                      this.appService.dataLoading = false;
                    },
                    err => {
                      this.snackBar.open(`Konnte Aufgabe nicht hinzufügen (${err.msg()})`,
                        'Fehler', { duration: 3000 });
                      this.appService.dataLoading = false;
                    }
                  );
                }
              }
            });
          }
        },
        err => {
          this.snackBar.open(`Fehler beim Laden der Aufgabeneigenschaften (${err.msg()})`,
            'Fehler', { duration: 3000 });
          this.appService.dataLoading = false;
        }
      );
    } else {
      this.snackBar.open('Bitte erst Aufgabe auswählen', 'Hinweis', { duration: 3000 });
    }

     */
  }

  exportUnit(): void {
    const dialogRef = this.selectUnitDialog.open(ExportUnitComponent, {
      width: '400px',
      height: '700px',
      data: {
        title: 'Aufgabe(n) als Datei speichern',
        buttonLabel: 'Download'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.backendService.downloadUnits(
          this.workspaceService.selectedWorkspace,
          result
        ).subscribe(
          (binaryData: Blob) => {
            // todo db-error?
            // const file = new File(binaryData, 'unitDefs.voud.zip', {type: 'application/zip'});
            const nowDate = new Date();
            let fileName = `${nowDate.getFullYear().toString()}-`;
            fileName += `${(nowDate.getMonth() < 9 ? '0' : '')}${nowDate.getMonth() + 1}-`;
            fileName += `${(nowDate.getDate() < 10 ? '0' : '')}${nowDate.getDate()}`;
            // saveAs(binaryData, `${fileName} UnitDefs.voud.zip`);
            // todo save units
            this.snackBar.open('Aufgabe(n) gespeichert', '', { duration: 1000 });
          }
        );
      }
    });
  }

  settings(): void {
    const dialogRef = this.editSettingsDialog.open(EditSettingsComponent, {
      width: '400px',
      height: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.backendService.setWorkspaceSettings(
          this.workspaceService.selectedWorkspace,
          <WorkspaceSettings>{
            defaultEditor: result.controls.editorSelector.value,
            defaultPlayer: result.controls.playerSelector.value
          }
        ).subscribe(isOK => {
          if (isOK === false) {
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

  finishUnitUpload() : void {
    this.uploadMessages = [];
    this.appService.dataLoading = true;
    this.backendService.startUnitUploadProcessing(this.workspaceService.selectedWorkspace, this.uploadProcessId).subscribe(
      okdata => {
        let okCount = 0;
        okdata.forEach(uploadInfo => {
          if (uploadInfo.success) {
            okCount += 1;
          } else {
            this.uploadMessages.push(`${uploadInfo.filename}: ${uploadInfo.message}`);
          }
          if (this.uploadMessages.length > 0) {
            this.snackBar.open('Problem: Konnte Aufgabendateien nicht hochladen', '', { duration: 3000 });
          } else {
            this.snackBar.open(`${okCount} Aufgabe(n) wurden importiert`, '', { duration: 3000 });
          }
          if (okCount > 0) {
            this.updateUnitList();
            // this.selectedUnits = [];
          }
        });
        this.appService.dataLoading = false;
      },
      err => {
        this.uploadMessages.push(`${err.code}: ${err.info}`);
        this.snackBar.open(`Problem: Konnte Aufgabendateien nicht hochladen: ${err.msg()}`, '', { duration: 3000 });
        this.appService.dataLoading = false;
      }
    );
    this.uploadProcessId = Math.floor(Math.random() * 20000000 + 10000000).toString();
    this.snackBar.open('Dateien wurden an den Server gesendet - bitte warten', '', { duration: 10000 });
  }

  clearUploadMessages(): void {
    this.uploadMessages = [];
  }

  discardChanges(): void {
    const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: 'Verwerfen der Änderungen',
        content: 'Die Änderungen an der Aufgabe werden verworfen. Fortsetzen?',
        confirmbuttonlabel: 'Verwerfen',
        showcancel: true
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

  ngOnDestroy(): void {
    if (this.routingSubscription !== null) {
      this.routingSubscription.unsubscribe();
    }
  }
}
