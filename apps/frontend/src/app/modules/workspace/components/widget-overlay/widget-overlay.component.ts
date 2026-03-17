import {
  AfterViewInit, Component, ElementRef, inject,
  Input, OnDestroy, ViewChild
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { OverlayRef } from '@angular/cdk/overlay';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '../../../../services/app.service';
import { WidgetCallData } from '../../models/widget-call-data.interface';
import { VeronaModuleDirective } from '../../../../directives/verona-module.directive';

@Component({
  selector: 'studio-lite-widget-overlay',
  templateUrl: './widget-overlay.component.html',
  styleUrls: ['./widget-overlay.component.scss'],
  imports: [
    MatButtonModule,
    TranslateModule
  ]
})
export class WidgetOverlayComponent implements AfterViewInit, OnDestroy {
  @ViewChild('widgetIframe') widgetIframeRef!: ElementRef<HTMLIFrameElement>;

  @Input() widgetHtml = '';
  @Input() widgetCallData!: WidgetCallData;
  @Input() playerPostMessageTarget: Window | undefined;
  @Input() playerSessionId = '';
  @Input() overlayRef: OverlayRef | undefined;

  private appService = inject(AppService);
  private ngUnsubscribe = new Subject<void>();

  private widgetPostMessageTarget: Window | undefined;
  private widgetSessionId = '';
  private widgetState = '';
  private sendWidgetReturn = false;

  ngAfterViewInit(): void {
    this.widgetState = this.widgetCallData.state || '';

    setTimeout(() => {
      if (this.widgetIframeRef?.nativeElement) {
        this.widgetIframeRef.nativeElement.srcdoc = this.widgetHtml;
      }
    });

    this.subscribeForWidgetMessages();
  }

  private subscribeForWidgetMessages(): void {
    this.appService.postMessage$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((m: MessageEvent) => this.handleWidgetMessage(m));
  }

  private handleWidgetMessage(m: MessageEvent): void {
    const msgData = m.data;
    const msgType = msgData.type;

    if (!msgType || m.source !== this.widgetIframeRef?.nativeElement?.contentWindow) {
      return;
    }

    switch (msgType) {
      case 'vowReadyNotification':
        this.widgetPostMessageTarget = m.source as Window;
        this.widgetSessionId = VeronaModuleDirective.getSessionId();
        this.sendWidgetStartCommand();
        break;

      case 'vowStateChangedNotification':
        if (msgData.state) {
          this.widgetState = msgData.state;
        }
        break;

      case 'vowReturnRequested':
        this.continue();
        break;

      default:
        break;
    }
  }

  private sendWidgetStartCommand(): void {
    if (this.widgetPostMessageTarget) {
      this.widgetPostMessageTarget.postMessage({
        type: 'vowStartCommand',
        sessionId: this.widgetSessionId,
        parameters: this.widgetCallData.parameters || {},
        callId: this.widgetCallData.callId || '',
        state: this.widgetState,
        sharedParameters: this.widgetCallData.sharedParameters || {}
      }, '*');
    }
  }

  continue(): void {
    this.sendWidgetReturn = true;
    this.close();
  }

  close(): void {
    if (this.sendWidgetReturn && this.playerPostMessageTarget) {
      this.playerPostMessageTarget.postMessage({
        type: 'vopWidgetReturn',
        sessionId: this.playerSessionId,
        callId: this.widgetCallData.callId || '',
        state: this.widgetState
      }, '*');
    }

    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
