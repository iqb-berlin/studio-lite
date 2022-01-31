import {ActivatedRoute, Router, RouterLinkActive} from '@angular/router';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Component, Inject, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
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
import {UnitInListDto} from "@studio-lite-lib/api-dto";
import {UnitCollection} from "./workspace.classes";
import {MatTabNav} from "@angular/material/tabs";

@Component({
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  @ViewChild(MatTabNav) nav: MatTabNav | undefined;
  private routingSubscription: Subscription | null = null;
  private selectedUnitSubscription: Subscription | null = null;
  selectedUnits: string[] = [];
  uploadUrl = '';
  token: string | undefined;
  uploadProcessId = '';
  uploadMessages: string[] = [];
  navLinks = [
    { path: 'metadata', label: 'Eigenschaften' },
    { path: 'editor', label: 'Editor' },
    { path: 'preview', label: 'Vorschau' }
  ];

  constructor(
    @Inject('SERVER_URL') private serverUrl: string,
    private appService: AppService,
    public ds: WorkspaceService,
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
    this.uploadUrl = `${this.serverUrl}php_authoring/uploadUnitFile.php`;
    const t = localStorage.getItem('t');
    this.token = t ? t : '';
    this.uploadProcessId = Math.floor(Math.random() * 20000000 + 10000000).toString();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.routingSubscription = this.route.params.subscribe(params => {
        this.ds.selectedWorkspace = Number(params['ws']);
        this.ds.selectedUnit$.next(Number(params['u']));
        console.log(this.ds.selectedUnit$.getValue());
        this.ds.unitDefinitionOld = '';
        this.ds.unitDefinitionNew = '';
        this.ds.unitMetadataNew = null;
        this.ds.unitMetadataOld = null;
        this.ds.unitMetadataChanged = false;
        this.ds.unitMetadataChanged = false;
        this.ds.editorList = {};
        this.ds.playerList = {};
        this.ds.defaultEditor = '';
        this.ds.defaultPlayer = '';
        this.backendService.getWorkspaceData(this.ds.selectedWorkspace).subscribe(
          wResponse => {
            this.appService.appConfig.setPageTitle(`${wResponse.groupName}: ${wResponse.name}`);
/*            if (wResponse.editors) {
              this.ds.editorList = wResponse.editors;
            }
            if (wResponse.players) {
              this.ds.playerList = wResponse.players;
            }

 */
            if (wResponse.settings) {
              this.ds.defaultEditor = wResponse.settings.defaultEditor;
              this.ds.defaultPlayer = wResponse.settings.defaultPlayer;
            }
            this.updateUnitList();
          },
          err => {
            this.snackBar.open(
              `Konnte Daten für Arbeitsbereich nicht laden (${err.code})`, 'Fehler', { duration: 3000 }
            );
          }
        );
      });
    });
  }

  updateUnitList(unitToSelect?: number): void {
    this.backendService.getUnitList(this.ds.selectedWorkspace).subscribe(
      uResponse => {
        this.ds.unitList = new UnitCollection(uResponse);
        const selectedUnit = unitToSelect || this.ds.selectedUnit$.getValue();
        let unitExists = false;
        this.ds.unitList.units().forEach(u => {
          if (u.id === selectedUnit) {
            unitExists = true;
          }
        });
        if (unitExists) {
          if (unitToSelect) {
            this.router.navigate([`u/${unitToSelect}`], { relativeTo: this.route });
          } else {
            this.ds.selectedUnit$.next(selectedUnit);
          }
        } else {
          this.ds.selectedUnit$.next(0);
          this.router.navigate([`/a/${this.ds.selectedWorkspace}`]);
        }
      },
      err => {
        this.appService.errorMessage = err.msg();
        this.ds.unitList = new UnitCollection([]);
        this.ds.selectedUnit$.next(0);
        this.router.navigate([`/a/${this.ds.selectedWorkspace}`]);
      }
    );
  }

  onUnitSelectionChange(): void {
    if (this.selectedUnits.length > 0) {
      const unitId = this.selectedUnits[0];
      const selectedTab = this.nav ? this.nav.selectedIndex : -1;
      const routeSuffix = selectedTab >= 0 ? `/${this.navLinks[selectedTab].path}` : '';
      this.selectedUnits = [];
      this.router.navigate([`${unitId}${routeSuffix}`], { relativeTo: this.route.parent });
    }
  }

  addUnit(): void {
    const dialogRef = this.newUnitDialog.open(NewUnitComponent, {
      width: '600px',
      data: {
        title: 'Neue Aufgabe',
        key: '',
        label: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          this.appService.dataLoading = true;
          this.backendService.addUnit(
            this.ds.selectedWorkspace,
            (<FormGroup>result).get('key')?.value.trim(),
            (<FormGroup>result).get('label')?.value,
            this.ds.defaultEditor,
            this.ds.defaultPlayer
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
      }
    });
  }

  deleteUnit(): void {
    const dialogRef = this.selectUnitDialog.open(SelectUnitComponent, {
      width: '400px',
      height: '700px',
      data: {
        title: 'Aufgabe(n) löschen',
        buttonLabel: 'Löschen'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          this.backendService.deleteUnits(
            this.ds.selectedWorkspace,
            (result as UnitInListDto[]).map(ud => ud.id)
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
      }
    });
  }

  moveUnit(): void {
    const dialogRef = this.selectUnitDialog.open(MoveUnitComponent, {
      width: '600px',
      height: '700px',
      data: {
        title: 'Aufgabe(n) verschieben',
        buttonLabel: 'Verschieben',
        currentWorkspaceId: this.ds.selectedWorkspace
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          const dialogComponent = dialogRef.componentInstance;
          const wsSelected = dialogComponent.selectForm ? dialogComponent.selectForm.get('wsSelector') : false;
          if (wsSelected) {
            this.backendService.moveUnits(
              this.ds.selectedWorkspace,
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
    const myUnitId = this.ds.selectedUnit$.getValue();
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
          this.ds.selectedWorkspace,
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
          this.ds.selectedWorkspace,
          <WorkspaceSettings>{
            defaultEditor: result.controls.editorSelector.value,
            defaultPlayer: result.controls.playerSelector.value
          }
        ).subscribe(isOK => {
          if (isOK === false) {
            this.snackBar.open('Einstellungen konnten nicht gespeichert werden.', '', { duration: 3000 });
          } else {
            this.snackBar.open('Einstellungen gespeichert', '', { duration: 1000 });
            this.ds.defaultPlayer = result.controls.playerSelector.value;
            this.ds.defaultEditor = result.controls.editorSelector.value;
          }
        });
      }
    });
  }

  saveUnitData(): void {
    this.ds.saveUnitData().subscribe(saveResult => {
      if (saveResult === true) {
        this.snackBar.open('Änderungen an Aufgabedaten gespeichert', '', { duration: 1000 });
      } else {
        this.snackBar.open('Problem: Konnte Aufgabendaten nicht speichern', '', { duration: 3000 });
      }
    });
  }

  finishUnitUpload() : void {
    this.uploadMessages = [];
    this.appService.dataLoading = true;
    this.backendService.startUnitUploadProcessing(this.ds.selectedWorkspace, this.uploadProcessId).subscribe(
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
            this.selectedUnits = [];
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
        if (this.ds.unitMetadataOld) {
          this.ds.unitMetadataNew = {
            id: this.ds.unitMetadataOld.id,
            key: this.ds.unitMetadataOld.key,
            label: this.ds.unitMetadataOld.label,
            description: this.ds.unitMetadataOld.description,
            editorid: this.ds.unitMetadataOld.editorid,
            playerid: this.ds.unitMetadataOld.playerid,
            lastchanged: this.ds.unitMetadataOld.lastchanged
          };
        }
        this.ds.unitMetadataChanged = false;
        this.ds.unitDefinitionNew = this.ds.unitDefinitionOld;
        this.ds.unitDefinitionChanged = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routingSubscription !== null) {
      this.routingSubscription.unsubscribe();
    }
    if (this.selectedUnitSubscription !== null) {
      this.selectedUnitSubscription.unsubscribe();
    }
  }
}
