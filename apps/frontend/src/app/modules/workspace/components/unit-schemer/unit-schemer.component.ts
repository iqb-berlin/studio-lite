import {
  AfterViewInit, Component, ElementRef, OnDestroy, ViewChild
} from '@angular/core';
import {
  BehaviorSubject, from, map, Observable, of, Subject, takeUntil
} from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { TranslateService } from '@ngx-translate/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { AppService } from '../../../../services/app.service';
import { UnitSchemeStore } from '../../classes/unit-scheme-store';
import { ModuleService } from '../../../shared/services/module.service';
import { SubscribeUnitDefinitionChangesDirective } from '../../directives/subscribe-unit-definition-changes.directive';
import { RolePipe } from '../../pipes/role.pipe';
import { UnitMetadataStore } from '../../classes/unit-metadata-store';

@Component({
  selector: 'studio-lite-unit-schemer',
  templateUrl: './unit-schemer.component.html',
  styleUrls: ['./unit-schemer.component.scss'],
  host: { class: 'unit-schemer' },
  imports: [MatProgressSpinner]
})
export class UnitSchemerComponent
  extends SubscribeUnitDefinitionChangesDirective
  implements AfterViewInit, OnDestroy {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;
  private iFrameElement: HTMLIFrameElement | undefined;
  private postMessageTarget: Window | undefined;
  private sessionId = '';
  private lastSchemerId = '';
  ngUnsubscribe = new Subject<void>();
  message = '';
  unitLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  loading = false;

  constructor(
    private backendService: WorkspaceBackendService,
    public workspaceService: WorkspaceService,
    private snackBar: MatSnackBar,
    private moduleService: ModuleService,
    private appService: AppService,
    private translateService: TranslateService
  ) {
    super();
    this.unitLoaded.subscribe(loaded => setTimeout(() => {
      this.loading = !loaded;
    })
    );
  }

  ngAfterViewInit(): void {
    this.iFrameElement = this.hostingIframe.nativeElement;
    this.subscribeForPostMessages();
    this.subscribeForSelectedUnitChange();
    this.addSubscriptionForUnitDefinitionChanges();
  }

  private subscribeForSelectedUnitChange(): void {
    this.workspaceService.selectedUnit$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
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
      });
  }

  private subscribeForPostMessages(): void {
    this.appService.postMessage$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((m: MessageEvent) => {
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
              this.sessionId = Math.floor(
                Math.random() * 20000000 + 10000000
              ).toString();
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

  private getSchemerId(
    unitMetadataStore: UnitMetadataStore | undefined
  ): Observable<string> {
    if (unitMetadataStore) {
      const unitMetadata = unitMetadataStore.getData();

      const loadList$ =
        Object.keys(this.moduleService.schemers).length === 0 ?
          from(this.moduleService.loadList()) :
          of(undefined);

      return loadList$.pipe(
        map(() => (unitMetadata.schemer ?
          VeronaModuleFactory.getBestMatch(
            unitMetadata.schemer,
            Object.keys(this.moduleService.schemers)
          ) :
          '')
        )
      );
    }
    return of('');
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
      this.postUnitScheme(unitSchemeStore);
    } else {
      this.backendService
        .getUnitScheme(this.workspaceService.selectedWorkspaceId, unitId)
        .subscribe(ues => {
          if (ues) {
            const newUnitSchemeStore = new UnitSchemeStore(unitId, ues);
            this.workspaceService.setUnitSchemeStore(newUnitSchemeStore);
            this.postUnitScheme(newUnitSchemeStore);
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

  onLoadUnitProperties() {
    this.getSchemerId(this.workspaceService.getUnitMetadataStore())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(schemerId => {
        if (schemerId) {
          if (schemerId === this.lastSchemerId && this.postMessageTarget) {
            this.sendScheme(
              this.workspaceService.selectedUnit$.getValue(),
              this.workspaceService.getUnitSchemeStore()
            );
          } else {
            this.postMessageTarget = undefined;
            this.buildSchemer(schemerId);
            // schemer gets unit data via ReadyNotification
          }
        } else {
          this.postMessageTarget = undefined;
          this.message = this.translateService.instant('workspace.no-schemer');
        }
      });
  }

  private postUnitScheme(unitSchemeStore: UnitSchemeStore): void {
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
            )
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

  private buildSchemer(schemerId?: string) {
    if (this.iFrameElement) {
      this.iFrameElement.srcdoc = '';
      if (schemerId) {
        from(
          this.moduleService.getModuleHtml(
            this.moduleService.schemers[schemerId]
          )
        )
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(schemerData => {
            if (schemerData) {
              this.setupSchemerIFrame(schemerData);
              this.lastSchemerId = schemerId;
            } else {
              this.message = this.translateService.instant(
                'workspace.schemer-not-loaded',
                { id: schemerId }
              );
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
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.unitLoaded.complete();
  }
}
