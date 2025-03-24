import {
  AfterViewInit, Component, ElementRef, OnDestroy, ViewChild
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from '../../services/workspace.service';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { UnitSchemeStore } from '../../classes/unit-scheme-store';
import { ModuleService } from '../../../shared/services/module.service';
import { SubscribeUnitDefinitionChangesDirective } from '../../directives/subscribe-unit-definition-changes.directive';
import { RolePipe } from '../../pipes/role.pipe';

@Component({
  selector: 'studio-lite-unit-schemer',
  templateUrl: './unit-schemer.component.html',
  styleUrls: ['./unit-schemer.component.scss'],
  host: { class: 'unit-schemer' },
  imports: []
})
export class UnitSchemerComponent extends SubscribeUnitDefinitionChangesDirective implements AfterViewInit, OnDestroy {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;
  private readonly postMessageSubscription: Subscription;
  private unitIdChangedSubscription: Subscription | undefined;
  private iFrameElement: HTMLIFrameElement | undefined;
  private postMessageTarget: Window | undefined;
  private sessionId = '';
  private lastSchemerId = '';
  ngUnsubscribe = new Subject<void>();
  message = '';

  constructor(
    private backendService: BackendService,
    public workspaceService: WorkspaceService,
    private snackBar: MatSnackBar,
    private moduleService: ModuleService,
    private appService: AppService,
    private translateService: TranslateService
  ) {
    super();
    this.postMessageSubscription = this.appService.postMessage$.subscribe((m: MessageEvent) => {
      const msgData = m.data;
      const msgType = msgData.type;

      if ((msgType !== undefined) && (msgType !== null) && (m.source === this.iFrameElement?.contentWindow)) {
        this.postMessageTarget = m.source as Window;
        switch (msgType) {
          case 'vosReadyNotification':
            this.sessionId = Math.floor(Math.random() * 20000000 + 10000000).toString();
            this.postMessageTarget = m.source as Window;
            this.sendUnitData();
            break;

          case 'vosSchemeChangedNotification':
            if (msgData.sessionId === this.sessionId) {
              if (msgData.codingScheme) {
                this.workspaceService.codingScheme = JSON.parse(msgData.codingScheme);
                this.workspaceService.getUnitSchemeStore()?.setData(msgData.codingScheme, msgData.codingSchemeType);
                // } else { TODO: find solution for vosGetSchemeRequest
                //   this.postMessageTarget.postMessage({
                //     type: 'vosGetSchemeRequest',
                //     sessionId: this.sessionId
                //   }, '*');
              }
            }
            break;

          default:
            // eslint-disable-next-line no-console
            console.warn(`processMessagePost ignored message: ${msgType}`);
            break;
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.iFrameElement = this.hostingIframe.nativeElement;
    this.unitIdChangedSubscription = this.workspaceService.selectedUnit$.subscribe(() => {
      this.message = '';
      this.workspaceService.loadUnitProperties().then(() => this.sendUnitData());
    });
    this.addSubscriptionForUnitDefinitionChanges();
  }

  async sendUnitData() {
    const unitId = this.workspaceService.selectedUnit$.getValue();
    const unitMetadataStore = this.workspaceService.getUnitMetadataStore();
    if (unitId && unitId > 0 && unitMetadataStore) {
      const unitMetadata = unitMetadataStore.getData();
      if (Object.keys(this.moduleService.schemers).length === 0) await this.moduleService.loadList();
      const schemerId = unitMetadata.schemer ?
        VeronaModuleFactory.getBestMatch(unitMetadata.schemer, Object.keys(this.moduleService.schemers)) : '';
      if (schemerId) {
        if ((schemerId === this.lastSchemerId) && this.postMessageTarget) {
          let unitSchemeStore = this.workspaceService.getUnitSchemeStore();
          if (unitSchemeStore) {
            this.postUnitScheme(unitSchemeStore);
          } else {
            this.backendService.getUnitScheme(this.workspaceService.selectedWorkspaceId, unitId).subscribe(
              ues => {
                if (ues) {
                  unitSchemeStore = new UnitSchemeStore(unitId, ues);
                  this.workspaceService.setUnitSchemeStore(unitSchemeStore);
                  this.postUnitScheme(unitSchemeStore);
                } else {
                  this.snackBar.open(
                    this.translateService.instant('workspace.coding-scheme-not-loaded'),
                    this.translateService.instant('workspace.error'),
                    { duration: 3000 });
                }
              }
            );
          }
        } else {
          this.buildSchemer(schemerId);
          // schemer gets unit data via ReadyNotification
        }
      } else {
        this.message = this.translateService.instant('workspace.no-schemer');
        this.buildSchemer();
      }
    } else {
      this.message = this.translateService.instant('workspace.unit-not-found');
      this.buildSchemer();
    }
  }

  private postUnitScheme(unitSchemeStore: UnitSchemeStore): void {
    const unitScheme = unitSchemeStore.getData();
    const variables = this.workspaceService.getUnitDefinitionStore()?.getData()
      .variables || unitScheme.variables;
    if (this.postMessageTarget) {
      this.postMessageTarget.postMessage({
        type: 'vosStartCommand',
        sessionId: this.sessionId,
        schemerConfig: {
          definitionReportPolicy: 'eager',
          role: new RolePipe().transform(this.workspaceService.userAccessLevel)
        },
        codingScheme: unitScheme.scheme || '',
        codingSchemeType: unitScheme.schemeType || '',
        variables: variables || []
      }, '*');
    }
  }

  private buildSchemer(schemerId?: string) {
    this.postMessageTarget = undefined;
    if (this.iFrameElement) {
      this.iFrameElement.srcdoc = '';
      if (schemerId) {
        this.moduleService.getModuleHtml(this.moduleService.schemers[schemerId]).then(schemerData => {
          if (schemerData) {
            this.setupSchemerIFrame(schemerData);
            this.lastSchemerId = schemerId;
          } else {
            this.message = this.translateService
              .instant('workspace.schemer-not-loaded', { id: schemerId });
            this.lastSchemerId = '';
          }
        });
      } else {
        this.lastSchemerId = '';
      }
    }
  }

  private setupSchemerIFrame(schemerHtml: string): void {
    if (this.iFrameElement && this.iFrameElement.parentElement) {
      this.iFrameElement.srcdoc = schemerHtml;
    }
  }

  ngOnDestroy(): void {
    if (this.unitIdChangedSubscription) this.unitIdChangedSubscription.unsubscribe();
    if (this.postMessageSubscription !== null) this.postMessageSubscription.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
