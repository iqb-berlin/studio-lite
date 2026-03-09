import {
  AfterViewInit, Component, ElementRef, ViewChild
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { AppService } from '../../../../services/app.service';
import { UnitSchemeStore } from '../../classes/unit-scheme-store';
import { ModuleService } from '../../../../services/module.service';
import {
  UnitDefinitionDirective
} from '../../../../directives/unit-definition.directive';
import { RolePipe } from '../../pipes/role.pipe';

@Component({
  selector: 'studio-lite-unit-schemer',
  templateUrl: './unit-schemer.component.html',
  styleUrls: ['./unit-schemer.component.scss'],
  host: { class: 'unit-schemer' },
  imports: [MatProgressSpinner]
})
export class UnitSchemerComponent
  extends UnitDefinitionDirective
  implements AfterViewInit {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;

  constructor(
    public backendService: WorkspaceBackendService,
    public workspaceService: WorkspaceService,
    public snackBar: MatSnackBar,
    public moduleService: ModuleService,
    public appService: AppService,
    public translateService: TranslateService
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.setHostingIframe();
    this.subscribeForPostMessages();
    this.subscribeForSelectedUnitChange();
    this.addSubscriptionForUnitDefinitionChanges();
  }

  onSelectedUnitChange(): void {
    if (this.unitLoaded.getValue()) {
      this.unitLoaded.next(false);
      this.message = '';
      this.workspaceService
        .loadUnitProperties()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => this.onLoadUnitProperties());
    } else {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
      this.ngUnsubscribe = new Subject<void>();
      this.unitLoaded.next(true);
      this.subscribeForPostMessages();
      this.subscribeForSelectedUnitChange();
      this.addSubscriptionForUnitDefinitionChanges();
    }
  }

  handleIncomingMessage(m: MessageEvent) {
    const msgData = m.data;
    const msgType = msgData.type;
    if (
      msgType !== undefined &&
      msgType !== null &&
      m.source === this.iFrameElement?.contentWindow
    ) {
      this.postMessageTarget = m.source as Window;
      switch (msgType) {
        case 'vosReadyNotification':
          this.sessionId = UnitSchemerComponent.getSessionId();
          this.postMessageTarget = m.source as Window;
          this.sendScheme(
            this.workspaceService.selectedUnit$.getValue(),
            this.workspaceService.getUnitSchemeStore()
          );
          break;

        case 'vosSchemeChangedNotification':
          if (msgData.sessionId === this.sessionId) {
            if (msgData.codingScheme) {
              this.workspaceService.codingScheme = JSON.parse(
                msgData.codingScheme
              );
              this.workspaceService
                .getUnitSchemeStore()
                ?.setData(msgData.codingScheme, msgData.codingSchemeType);
              // } else { TODO: find solution for vosGetSchemeRequest
              //   this.postMessageTarget.postMessage({
              //     type: 'vosGetSchemeRequest',
              //     sessionId: this.sessionId
              //   }, '*');
            }
            if (msgData.sharedParameters) {
              this.sharedParameters = this.getMergedSharedParameters(msgData.sharedParameters);
            }
          }
          break;

        default:
          // eslint-disable-next-line no-console
          console.warn(`processMessagePost ignored message: ${msgType}`);
          break;
      }
    }
  }

  sendChangeData(): void {
    this.sendScheme(
      this.workspaceService.selectedUnit$.getValue(),
      this.workspaceService.getUnitSchemeStore()
    );
  }

  private sendScheme(
    unitId: number,
    unitSchemeStore: UnitSchemeStore | undefined
  ) {
    if (!unitId) {
      this.message = this.translateService.instant('workspace.unit-not-found');
      this.postMessageTarget = undefined;
      return;
    }
    if (unitSchemeStore) {
      this.postStore(unitSchemeStore);
    } else {
      this.backendService
        .getUnitScheme(this.workspaceService.selectedWorkspaceId, unitId)
        .subscribe(ues => {
          if (ues) {
            const newUnitSchemeStore = new UnitSchemeStore(unitId, ues);
            this.workspaceService.setUnitSchemeStore(newUnitSchemeStore);
            this.postStore(newUnitSchemeStore);
          } else {
            this.snackBar.open(
              this.translateService.instant(
                'workspace.coding-scheme-not-loaded'
              ),
              this.translateService.instant('workspace.error'),
              { duration: 3000 }
            );
          }
        });
    }
  }

  private subscribeForVeronaModuleLoaded(): void {
    this.getVeronaModuleId(
      this.workspaceService.getUnitMetadataStore(),
      'schemer'
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(schemerId => {
        if (schemerId) {
          if (schemerId === this.lastVeronaModuleId && this.postMessageTarget) {
            this.sendScheme(
              this.workspaceService.selectedUnit$.getValue(),
              this.workspaceService.getUnitSchemeStore()
            );
          } else {
            this.postMessageTarget = undefined;
            this.buildVeronaModule(schemerId, 'schemer');
            // schemer gets unit data via ReadyNotification
          }
        } else {
          this.postMessageTarget = undefined;
          this.message = this.translateService.instant('workspace.no-schemer');
        }
      });
  }

  onLoadUnitProperties() {
    this.subscribeForVeronaModuleLoaded();
  }

  postStore(unitSchemeStore: UnitSchemeStore): void {
    const unitScheme = unitSchemeStore.getData();
    const variables =
      this.workspaceService.getUnitDefinitionStore()?.getData().variables ||
      unitScheme.variables;
    if (this.postMessageTarget) {
      this.postMessageTarget.postMessage(
        {
          type: 'vosStartCommand',
          sessionId: this.sessionId,
          schemerConfig: {
            definitionReportPolicy: 'eager',
            role: new RolePipe().transform(
              this.workspaceService.userAccessLevel
            ),
            directDownloadUrl: this.backendService.getDirectDownloadLink(),
            sharedParameters: this.sharedParameters
          },
          codingScheme: unitScheme.scheme || '',
          codingSchemeType: unitScheme.schemeType || '',
          variables: variables || []
        },
        '*'
      );
      this.unitLoaded.next(true);
    }
  }
}
