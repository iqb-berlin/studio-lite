import { Component, HostListener, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { ModuleService } from '@studio-lite/studio-components';
import { WorkspaceService } from '../../services/workspace.service';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../app/services/app.service';
import { UnitSchemeStore } from '../../classes/unit-scheme-store';

@Component({
  template: `
    <div *ngIf="message" style="margin: 30px">{{message}}</div>
    <div id="iFrameHostSchemer">
      <iframe id="hosting-iframe" class="unitHost"></iframe>
    </div>`,
  styles: ['#iFrameHostSchemer {height: 100%;}']
})
export class UnitSchemerComponent implements OnInit {
  private readonly postMessageSubscription: Subscription;
  private unitIdChangedSubscription: Subscription | undefined;
  private iFrameElement: HTMLIFrameElement | undefined;
  private postMessageTarget: Window | undefined;
  private sessionId = '';
  private lastSchemerId = '';
  message = '';

  constructor(
    private backendService: BackendService,
    private workspaceService: WorkspaceService,
    private snackBar: MatSnackBar,
    private moduleService: ModuleService,
    private appService: AppService
  ) {
    this.postMessageSubscription = this.appService.postMessage$.subscribe((m: MessageEvent) => {
      const msgData = m.data;
      const msgType = msgData.type;

      if ((msgType !== undefined) && (msgType !== null)) {
        this.postMessageTarget = m.source as Window;
        switch (msgType) {
          case 'vosReadyNotification':
            this.sessionId = Math.floor(Math.random() * 20000000 + 10000000).toString();
            this.postMessageTarget = m.source as Window;
            this.sendUnitDataToSchemer();
            break;

          case 'vosSchemeChangedNotification':
            if (msgData.sessionId === this.sessionId) {
              if (msgData.codingScheme) {
                this.workspaceService.unitSchemeStore?.setData(msgData.codingScheme, msgData.codingSchemeType);
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

  ngOnInit(): void {
    setTimeout(() => {
      this.iFrameElement = <HTMLIFrameElement>document.querySelector('#hosting-iframe');
      this.unitIdChangedSubscription = this.workspaceService.selectedUnit$.subscribe(() => {
        this.message = '';
        this.workspaceService.loadUnitMetadata().then(() => this.sendUnitDataToSchemer());
      });
    });
  }

  async sendUnitDataToSchemer() {
    const unitId = this.workspaceService.selectedUnit$.getValue();
    if (unitId && unitId > 0 && this.workspaceService.unitMetadataStore) {
      const unitMetadata = this.workspaceService.unitMetadataStore.getData();
      if (Object.keys(this.moduleService.schemers).length === 0) await this.moduleService.loadList();
      const schemerId = unitMetadata.schemer ?
        VeronaModuleFactory.getBestMatch(unitMetadata.schemer, Object.keys(this.moduleService.schemers)) : '';
      if (schemerId) {
        if ((schemerId === this.lastSchemerId) && this.postMessageTarget) {
          if (this.workspaceService.unitSchemeStore) {
            this.postUnitScheme(this.workspaceService.unitSchemeStore);
          } else {
            this.backendService.getUnitScheme(this.workspaceService.selectedWorkspaceId, unitId).subscribe(
              ues => {
                if (ues) {
                  this.workspaceService.unitSchemeStore = new UnitSchemeStore(unitId, ues);
                  this.postUnitScheme(this.workspaceService.unitSchemeStore);
                } else {
                  this.snackBar.open('Konnte Antwortschema nicht laden', 'Fehler', { duration: 3000 });
                }
              }
            );
          }
        } else {
          this.buildSchemer(schemerId);
          // schemer gets unit data via ReadyNotification
        }
      } else {
        this.message = 'Kein gültiger Editor für das Antwortschema zugewiesen. Bitte gehen Sie zu "Eigenschaften".';
        this.buildSchemer();
      }
    } else {
      this.message = 'Aufgabe nicht gefunden oder Daten fehlerhaft.';
      this.buildSchemer();
    }
  }

  private postUnitScheme(unitSchemeStore: UnitSchemeStore): void {
    const unitScheme = unitSchemeStore.getData();
    const variables = this.workspaceService.unitDefinitionStore?.getData().variables || unitScheme.variables;
    if (this.postMessageTarget) {
      this.postMessageTarget.postMessage({
        type: 'vosStartCommand',
        sessionId: this.sessionId,
        schemerConfig: {
          definitionReportPolicy: 'eager'
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
            this.message = `Der Editor für das Antwortschema "${schemerId}" konnte nicht geladen werden.`;
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
      const divHeight = this.iFrameElement.parentElement.clientHeight;
      this.iFrameElement.height = `${String(divHeight - 5)}px`;
      this.iFrameElement.srcdoc = schemerHtml;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.iFrameElement && this.iFrameElement.parentElement) {
      const divHeight = this.iFrameElement.parentElement.clientHeight;
      this.iFrameElement.height = `${String(divHeight - 5)}px`;
    }
  }

  ngOnDestroy(): void {
    if (this.unitIdChangedSubscription) this.unitIdChangedSubscription.unsubscribe();
    if (this.postMessageSubscription !== null) this.postMessageSubscription.unsubscribe();
  }
}
