import {
  Component, EventEmitter, Input, OnDestroy, Output
} from '@angular/core';
import { CreateUnitDto, UnitInListDto } from '@studio-lite-lib/api-dto';
import { lastValueFrom, map, Subscription } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectUnitComponent, SelectUnitData } from '../../dialogs/select-unit.component';
import { WorkspaceService } from '../../workspace.service';
import { NewUnitComponent, NewUnitData } from '../../dialogs/new-unit.component';
import { AppService } from '../../../app.service';
import { BackendService } from '../../backend.service';
import { BackendService as AppBackendService } from '../../../backend.service';
import { RequestMessageDialogComponent } from '../../../components/request-message-dialog.component';

@Component({
  selector: 'studio-lite-add-unit',
  templateUrl: './add-unit.component.html',
  styleUrls: ['./add-unit.component.scss']
})
export class AddUnitComponent implements OnDestroy {
  @Input() selectedRouterLink!: number;
  @Input() navLinks!: string[];
  @Output() unitListUpdate: EventEmitter<number | undefined> = new EventEmitter<number | undefined>();
  private uploadSubscription: Subscription | null = null;
  constructor(
    private workspaceService: WorkspaceService,
    private appService: AppService,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private appBackendService: AppBackendService,
    private selectUnitDialog: MatDialog,
    private newUnitDialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private uploadReportDialog: MatDialog
  ) {}

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
                  this.unitListUpdate.emit(respOk);
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
              this.unitListUpdate.emit(respOk);
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
          isOK ? '' : 'Fehler',
          { duration: 3000 });
      });
    }
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
                groupName: (<UntypedFormGroup>dialogResult).get('groupDirect')?.value ||
                  (<UntypedFormGroup>dialogResult).get('groupSelect')?.value || ''
              };
            }
          }
          return false;
        })
      ));
    }
    return false;
  }

  async selectUnit(unitId?: number): Promise<boolean> {
    if (unitId && unitId > 0) {
      const selectedTab = this.selectedRouterLink;
      const routeSuffix = selectedTab >= 0 ? `/${this.navLinks[selectedTab]}` : '';
      return this.router.navigate([`${unitId}${routeSuffix}`], { relativeTo: this.route.parent });
    }
    return this.router.navigate(
      [`a/${this.workspaceService.selectedWorkspaceId}`],
      { relativeTo: this.route.root }
    );
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
                this.unitListUpdate.emit();
              });
            } else {
              this.resetUpload();
              this.unitListUpdate.emit();
            }
          }
        });
      }
    }
  }

  resetUpload() {
    if (this.uploadSubscription !== null) {
      this.uploadSubscription.unsubscribe();
      this.uploadSubscription = null;
    }
  }

  ngOnDestroy(): void {
    if (this.uploadSubscription !== null) {
      this.uploadSubscription.unsubscribe();
    }
  }
}
