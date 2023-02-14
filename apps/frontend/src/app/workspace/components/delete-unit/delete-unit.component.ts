import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { lastValueFrom, map } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectUnitComponent, SelectUnitData } from '../../dialogs/select-unit.component';
import { WorkspaceService } from '../../workspace.service';
import { BackendService } from '../../backend.service';
import { AppService } from '../../../app.service';

@Component({
  selector: 'studio-lite-delete-unit',
  templateUrl: './delete-unit.component.html',
  styleUrls: ['./delete-unit.component.scss']
})
export class DeleteUnitComponent {
  @Input() selectedRouterLink!: number;
  @Input() navLinks!: string[];
  @Output() unitListUpdate: EventEmitter<number | undefined> = new EventEmitter<number | undefined>();

  constructor(
    private appService: AppService,
    private workspaceService: WorkspaceService,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private selectUnitDialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {}

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
              this.snackBar.open('Aufgabe(n) gelöscht', '', { duration: 1000 });
              this.unitListUpdate.emit();
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
}
