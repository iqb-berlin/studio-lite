import { MatDialog } from '@angular/material/dialog';
import { Directive, inject, ViewContainerRef } from '@angular/core';
import { from, takeUntil } from 'rxjs';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { UnitDefinitionDirective } from './unit-definition.directive';
import { PageData } from '../../workspace/models/page-data.interface';
import { Progress } from '../../workspace/models/types';
import { VeronaModuleDirective } from './verona-module.directive';
import { UnitState } from '../models/verona.interface';
import {
  VopRuntimeErrorNotificationDialogComponent
} from '../components/vop-runtime-error-notification-dialog/vop-runtime-error-notification-dialog.component';
import { WidgetCallData } from '../../workspace/models/widget-call-data.interface';
import { ModuleService } from '../services/module.service';
import { WidgetOverlayComponent } from '../../workspace/components/widget-overlay/widget-overlay.component';

@Directive({
  selector: '[preview]',
  standalone: false
})
export abstract class PreviewDirective extends UnitDefinitionDirective {
  errorDialog?: MatDialog;
  playerName = '';
  playerApiVersion = 3;
  pageList: PageData[] = [];
  presentationProgress: Progress = 'none';
  responseProgress: Progress = 'none';
  hasFocus = false;

  abstract gotoUnit(target: string): void;
  protected abstract handleUnitStateData(unitState: UnitState): void;

  private readonly widgetModuleService = inject(ModuleService);
  private readonly widgetOverlay = inject(Overlay);
  private readonly widgetViewContainerRef = inject(ViewContainerRef);

  handleIncomingMessage(m: MessageEvent): void {
    const msgData = m.data;
    const msgType = msgData.type;
    if (msgType && m.source === this.iFrameElement?.contentWindow) {
      switch (msgType) {
        case 'vopReadyNotification':
        case 'player':
        case 'vo.FromPlayer.ReadyNotification':
          this.playerApiVersion = PreviewDirective.detectApiVersion(msgData);
          this.sessionId = VeronaModuleDirective.getSessionId();
          this.postMessageTarget = m.source as Window;
          this.sendChangeData();
          break;

        case 'vo.FromPlayer.StartedNotification':
        case 'vo.FromPlayer.ChangedDataTransfer':
          this.setPageList(msgData.validPages, msgData.currentPage);
          this.setPresentationStatus(msgData.presentationComplete);
          this.setResponsesStatus(msgData.responsesGiven);
          break;

        case 'vopStateChangedNotification': {
          if (msgData.playerState) {
            const pages = msgData.playerState.validPages;
            const targets = Array.isArray(pages) ?
              pages.map((p: { id: string }) => p.id) :
              Object.keys(pages);
            this.setPageList(targets, msgData.playerState.currentPage);
            if (msgData.playerState.sharedParameters) {
              this.sharedParameters = this.getMergedSharedParameters(msgData.playerState.sharedParameters);
            }
          }
          if (msgData.unitState) {
            this.setPresentationStatus(msgData.unitState.presentationProgress);
            this.setResponsesStatus(msgData.unitState.responseProgress);
            this.handleUnitStateData(msgData.unitState);
          }
          break;
        }

        case 'vo.FromPlayer.PageNavigationRequest':
          this.snackBar.open(
            this.translateService.instant(
              'workspace.player-send-page-navigation-request',
              { target: msgData.newPage }
            ),
            '',
            { duration: 3000 }
          );
          this.gotoPage({ action: msgData.newPage });
          break;

        case 'vopPageNavigationCommand':
          this.snackBar.open(
            this.translateService.instant(
              'workspace.player-send-page-navigation-request',
              { target: msgData.target }
            ),
            '',
            { duration: 3000 }
          );
          this.gotoPage({ action: msgData.target });
          break;

        case 'vo.FromPlayer.UnitNavigationRequest':
        case 'vopUnitNavigationRequestedNotification':
          this.gotoUnit(msgData.target || msgData.navigationTarget);
          break;

        case 'vopWindowFocusChangedNotification':
          this.setFocusStatus(msgData.hasFocus);
          break;

        case 'vopWidgetCall':
          this.handleWidgetCall(msgData);
          break;

        case 'vopRuntimeErrorNotification':
          this.errorDialog?.open(VopRuntimeErrorNotificationDialogComponent, {
            data: {
              sessionId: msgData.sessionId,
              code: msgData.code,
              message: msgData.message
            }
          });
          break;

        default:
          // eslint-disable-next-line no-console
          console.warn(`Message ignored: ${msgType}`);
      }
    }
  }

  setPageList(validPages?: string[], currentPage?: string): void {
    if (Array.isArray(validPages) && validPages.length > 1) {
      const newPageList: PageData[] = [];
      validPages.forEach((id, i) => {
        if (i === 0) {
          newPageList.push({
            index: -1,
            id: '#previous',
            disabled: id === currentPage,
            type: '#previous'
          });
        }
        newPageList.push({
          index: i + 1,
          id,
          disabled: id === currentPage,
          type: '#goto'
        });
        if (i === validPages.length - 1) {
          newPageList.push({
            index: -1,
            id: '#next',
            disabled: id === currentPage,
            type: '#next'
          });
        }
      });
      this.pageList = newPageList;
    } else if (this.pageList.length > 1 && currentPage !== undefined) {
      const idx = this.pageList.findIndex(
        p => p.type === '#goto' && p.id === currentPage
      );
      this.pageList.forEach(p => {
        if (p.type === '#goto') p.disabled = p.id === currentPage;
      });
      this.pageList[0].disabled = idx === 1;
      this.pageList[this.pageList.length - 1].disabled =
        idx === this.pageList.length - 2;
    }
  }

  gotoPage(target: { action: string; index?: number }): void {
    const { action, index = 0 } = target;
    let nextPageId = '';
    const currentIdx = this.pageList.findIndex(
      p => p.index > 0 && p.disabled
    );

    if (action === '#next' && currentIdx < this.pageList.length - 2) nextPageId = this.pageList[currentIdx + 1].id;
    else if (action === '#previous' && currentIdx > 1) nextPageId = this.pageList[currentIdx - 1].id;
    else if (action === '#goto' && index > 0) nextPageId = this.pageList[index].id;
    else if (index === 0) nextPageId = action;

    if (nextPageId && this.postMessageTarget) {
      const isV1 = this.playerApiVersion === 1;
      this.postMessageTarget.postMessage(
        {
          type: isV1 ?
            'vo.ToPlayer.NavigateToPage' :
            'vopPageNavigationCommand',
          sessionId: this.sessionId,
          [isV1 ? 'newPage' : 'target']: nextPageId
        },
        '*'
      );
    }
  }

  setPresentationStatus(s: string): void {
    if (s === 'yes' || s === 'complete') this.presentationProgress = 'complete';
    else if (s === 'some') this.presentationProgress = 'some';
    else this.presentationProgress = 'none';
  }

  setResponsesStatus(s: string): void {
    if (s === 'all' || s === 'complete') this.responseProgress = 'complete';
    else if (s === 'yes' || s === 'some') this.responseProgress = 'some';
    else this.responseProgress = 'none';
  }

  setFocusStatus(status: boolean): void {
    this.hasFocus = status;
  }

  protected static detectApiVersion(msgData: {
    type: string;
    metadata?: { specVersion: string };
    apiVersion?: string;
    specVersion?: string;
  }): number {
    if (msgData.type === 'vo.FromPlayer.ReadyNotification') return 1;
    const versionSource =
      msgData.metadata?.specVersion ||
      msgData.apiVersion ||
      msgData.specVersion;
    const major = versionSource?.match(/\d+/);
    return major ? Number(major[0]) : 2;
  }

  handleWidgetCall(data: WidgetCallData): void {
    const loadWidgets$ = Object.keys(this.widgetModuleService.widgets).length === 0 ?
      from(this.widgetModuleService.loadWidgets()) :
      from(Promise.resolve());

    loadWidgets$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        const matchingWidget = Object.values(this.widgetModuleService.widgets)
          .find(w => w.metadata.model === data.widgetType.toLowerCase());

        if (!matchingWidget) {
          this.snackBar.open(
            this.translateService.instant(
              'workspace.no-widget',
              { widgetType: data.widgetType }
            ),
            '',
            { duration: 3000 }
          );
          return;
        }

        from(this.widgetModuleService.getModuleHtml(matchingWidget))
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(widgetHtml => {
            if (widgetHtml) {
              this.openWidgetOverlay(widgetHtml, data);
            }
          });
      });
  }

  private openWidgetOverlay(widgetHtml: string, callData: WidgetCallData): void {
    const overlayRef = this.widgetOverlay.create({
      positionStrategy: this.widgetOverlay.position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      panelClass: 'widget-overlay-panel'
    });

    const portal = new ComponentPortal(
      WidgetOverlayComponent,
      this.widgetViewContainerRef
    );
    const componentRef = overlayRef.attach(portal);

    componentRef.instance.widgetHtml = widgetHtml;
    componentRef.instance.widgetCallData = callData;
    componentRef.instance.playerPostMessageTarget = this.postMessageTarget;
    componentRef.instance.playerSessionId = this.sessionId;
    componentRef.instance.overlayRef = overlayRef;
  }
}
