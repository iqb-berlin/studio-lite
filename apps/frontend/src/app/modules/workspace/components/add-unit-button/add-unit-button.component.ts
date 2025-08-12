import { Component, OnDestroy, Input } from '@angular/core';
import { CreateUnitDto, UnitInListDto } from '@studio-lite-lib/api-dto';
import { lastValueFrom, map, Subscription } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { SelectUnitComponent, SelectUnitData } from '../select-unit/select-unit.component';
import { WorkspaceService } from '../../services/workspace.service';
import { NewUnitComponent } from '../new-unit/new-unit.component';
import { AppService } from '../../../../services/app.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import {
  RequestMessageComponent
} from '../../../../components/request-message/request-message.component';
import { SelectUnitDirective } from '../../directives/select-unit.directive';
import { NewUnitData } from '../../models/new-unit.interface';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-add-unit-button',
  templateUrl: './add-unit-button.component.html',
  styleUrls: ['./add-unit-button.component.scss'],
  imports: [MatButton, MatMenuTrigger, MatTooltip, WrappedIconComponent, MatMenu, MatMenuItem, MatIcon, TranslateModule]
})
export class AddUnitButtonComponent extends SelectUnitDirective implements OnDestroy {
  private uploadSubscription: Subscription | null = null;
  @Input() selectedUnitId!: number;
  @Input() disabled!: boolean;
  constructor(
    public workspaceService: WorkspaceService,
    public router: Router,
    public route: ActivatedRoute,
    private appService: AppService,
    public backendService: WorkspaceBackendService,
    private snackBar: MatSnackBar,
    private appBackendService: AppBackendService,
    private selectUnitDialog: MatDialog,
    private newUnitDialog: MatDialog,
    private translateService: TranslateService,
    private uploadReportDialog: MatDialog
  ) {
    super();
  }

  addUnitFromExisting(): void {
    this.addUnitFromExistingDialog().then((unitSource: UnitInListDto | boolean) => {
      if (typeof unitSource !== 'boolean') {
        this.addUnitDialog({
          title: this.translateService.instant('workspace.copy-new-unit'),
          subTitle: `${this.translateService
            .instant('workspace.copy-from')} ${unitSource.key}${unitSource.name ? ` - ${unitSource.name}` : ''}`,
          key: unitSource.key,
          label: unitSource.name || '',
          groups: this.workspaceService.workspaceSettings.unitGroups || []
        }).then((createUnitDto: CreateUnitDto | boolean) => {
          if (typeof createUnitDto !== 'boolean') {
            this.appService.dataLoading = true;
            createUnitDto.createFrom = unitSource.id;
            createUnitDto.createFromKey = unitSource.key;
            this.backendService.addUnit(
              this.workspaceService.selectedWorkspaceId, createUnitDto
            ).subscribe(
              respOk => {
                if (respOk) {
                  this.snackBar.open(
                    this.translateService.instant('workspace.unit-added'),
                    '',
                    { duration: 1000 }
                  );
                  this.addUnitGroup(createUnitDto.groupName);
                  this.updateUnitList(respOk);
                } else {
                  this.snackBar.open(
                    this.translateService.instant('workspace.unit-added'),
                    this.translateService.instant('workspace.error'),
                    { duration: 3000 }
                  );
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
      title: this.translateService.instant('workspace.new-unit'),
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
              this.snackBar.open(
                this.translateService.instant('workspace.unit-added'),
                '',
                { duration: 1000 });
              this.addUnitGroup(createUnitDto.groupName);
              this.updateUnitList(respOk);
            } else {
              this.snackBar.open(
                this.translateService.instant('workspace.unit-added'),
                this.translateService.instant('workspace.error'),
                { duration: 3000 }
              );
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
        this.snackBar.open(isOK ?
          this.translateService.instant('workspace.group-saved') :
          this.translateService.instant('workspace.group-not-saved'),
        isOK ? '' : this.translateService.instant('workspace.error'),
        { duration: 3000 });
      });
    }
  }

  private async addUnitFromExistingDialog(): Promise<UnitInListDto | boolean> {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      const dialogRef = this.selectUnitDialog.open(SelectUnitComponent, {
        width: '800px',
        height: '700px',
        data: <SelectUnitData>{
          title: this.translateService.instant('workspace.new-copy-unit'),
          buttonLabel: this.translateService.instant('continue'),
          fromOtherWorkspacesToo: true,
          multiple: false,
          selectedUnitId: this.selectedUnitId
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
              const dialogRef = this.uploadReportDialog.open(RequestMessageComponent, {
                width: '500px',
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
