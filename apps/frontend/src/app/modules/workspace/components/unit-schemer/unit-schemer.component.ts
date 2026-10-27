import { Component, ElementRef, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { toVariableInfoListV1 } from '@studio-lite/shared-code';
import { UnitSchemeStore } from '../../classes/unit-scheme-store';
import {
  UnitDefinitionDirective
} from '../../../../directives/unit-definition.directive';
import { RolePipe } from '../../pipes/role.pipe';
import { TrackIframeActivityDirective } from '../../../../directives/track-iframe-activity.directive';

/**
 * Hosts the SCHEMER a unit names -- where the coding scheme is built. It follows the definition
 * store as the editor does, because the scheme is written against the unit's variables and has to
 * see them change.
 */
@Component({
  selector: 'studio-lite-unit-schemer',
  templateUrl: './unit-schemer.component.html',
  styleUrls: ['./unit-schemer.component.scss'],
  host: { class: 'unit-schemer' },
  imports: [MatProgressSpinner, TrackIframeActivityDirective]
})
export class UnitSchemerComponent extends UnitDefinitionDirective {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;

  protected startSubscriptions(): void {
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
      this.renewSubscriptions();
    }
  }

  handleIncomingMessage(m: MessageEvent) {
    if (!this.acceptMessageFromModule(m)) return;
    const msgData = m.data;
    const msgType = msgData.type;
    switch (msgType) {
      case 'vosReadyNotification':
        this.sessionId = UnitSchemerComponent.getSessionId();
        this.postMessageTarget = m.source as Window;
        this.sendScheme(this.workspaceService.selectedUnit$.getValue());
        break;

      case 'vosSchemeChangedNotification':
        if (msgData.sessionId === this.sessionId) {
          if (msgData.codingScheme) {
            this.unitStores
              .schemeStore()
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

  sendChangeData(): void {
    this.sendScheme(this.workspaceService.selectedUnit$.getValue());
  }

  private sendScheme(unitId: number) {
    if (!unitId) {
      this.message = this.translateService.instant('workspace.unit-not-found');
      this.postMessageTarget = undefined;
      return;
    }
    this.unitStores
      .loadSchemeStore(this.workspaceService.selectedWorkspaceId, unitId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(unitSchemeStore => {
        if (unitSchemeStore) {
          this.postStore(unitSchemeStore);
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

  private subscribeForVeronaModuleLoaded(): void {
    this.getVeronaModuleId(
      this.unitStores.metadataStore(),
      'schemer'
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(schemerId => this.showVeronaModule(
        schemerId,
        'schemer',
        () => this.sendScheme(this.workspaceService.selectedUnit$.getValue())
      ));
  }

  onLoadUnitProperties() {
    this.subscribeForVeronaModuleLoaded();
  }

  postStore(unitSchemeStore: UnitSchemeStore): void {
    const unitScheme = unitSchemeStore.getData();
    const variables =
      this.unitStores.definitionStore()?.getData().variables ||
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
          // the schemer still reads only the VariableInfo 1.x spelling, and the editor's unsaved
          // list may come in 2.x (#1708)
          variables: toVariableInfoListV1(variables)
        },
        '*'
      );
      this.unitLoaded.next(true);
    }
  }
}
