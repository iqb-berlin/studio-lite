import {
  AfterViewInit, Component, ElementRef, Input, OnDestroy, Output, ViewChild
} from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { PreviewDirective } from '../../../../directives/preview.directive';
import { UnitState } from '../../../../models/verona.interface';
import { WidgetCallData } from '../../../workspace/models/widget-call-data.interface';
import { TrackIframeActivityDirective } from '../../../../directives/track-iframe-activity.directive';

/**
 * A unit rendered for printing: the same player as the preview, but laid out for paper -- it reports
 * the height it needs so the page can grow to it, and it takes the print options (element ids,
 * automatic height) that only the print view knows.
 */
@Component({
  selector: 'studio-lite-unit-print-player',
  templateUrl: './unit-print-player.component.html',
  styleUrls: ['./unit-print-player.component.scss'],
  standalone: true,
  imports: [TrackIframeActivityDirective]
})
export class UnitPrintPlayerComponent extends PreviewDirective implements AfterViewInit, OnDestroy {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;

  @Input() unitId!: number;
  @Input() workspaceId!: number;
  @Input() iFrameHeight!: number;
  @Input() playerId!: string;
  @Input() printElementIds!: boolean;
  @Input() printPreviewAutoHeight!: boolean;
  @Output() iFrameHeightChange = new Subject<number>();

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.buildVeronaModule(this.playerId, 'player');
  }

  protected startSubscriptions(): void {
    this.subscribeForPostMessages();
  }

  sendChangeData(): void {
    this.backendService.getUnitDefinition(this.workspaceId, this.unitId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(ued => {
        if (ued) {
          this.postStore(ued.definition || '', ued.definitionType);
        }
      });
  }

  postStore(definition: string, definitionType?: string): void {
    if (!this.postMessageTarget) return;

    if (this.playerApiVersion === 1) {
      this.postMessageTarget.postMessage({
        type: 'vo.ToPlayer.DataTransfer',
        sessionId: this.sessionId,
        unitDefinition: definition || ''
      }, '*');
    } else {
      this.postMessageTarget.postMessage({
        type: 'vopStartCommand',
        sessionId: this.sessionId,
        unitState: {
          dataParts: {},
          presentationProgress: this.toPlayerValue('none'),
          responseProgress: this.toPlayerValue('none')
        },
        playerConfig: {
          ...this.legacyStateReportPolicy(),
          pagingMode: this.toPlayerValue('concat-scroll'),
          printMode: this.toPlayerValue(this.printElementIds ? 'on-with-ids' : 'on'),
          directDownloadUrl: this.backendService.getDirectDownloadLink(),
          sharedParameters: this.sharedParameters
        },
        // a unit without a definition sends none, as the testcenter does, not an empty one (#719)
        ...(definition && { unitDefinition: definition }),
        ...(definitionType && { unitDefinitionType: definitionType })
      }, '*');
    }
    this.unitLoaded.next(true);
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  protected handleUnitStateData(_unitState: UnitState): void {}

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  gotoUnit(_target: string): void {}

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  override handleWidgetCall(_data: WidgetCallData): void {}

  // eslint-disable-next-line class-methods-use-this
  onSelectedUnitChange(): void {}

  // Überschreiben von buildVeronaModule um die Höhenberechnung einzuhängen
  protected override buildVeronaModule(
    moduleId: string | undefined, moduleType: 'player' | 'editor' | 'schemer'): void {
    super.buildVeronaModule(moduleId, moduleType);
    if (this.iFrameElement && this.printPreviewAutoHeight) {
      fromEvent(this.iFrameElement, 'load')
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          setTimeout(() => this.calculateIFrameHeight(), 1000);
        });
    }
  }

  private calculateIFrameHeight(): void {
    const iframeDoc = this.iFrameElement?.contentDocument || this.iFrameElement?.contentWindow?.document;
    const height = iframeDoc && (iframeDoc.body.offsetHeight ||
      (iframeDoc.documentElement as HTMLElement).offsetHeight);
    if (height) {
      this.iFrameHeight = height;
      this.iFrameHeightChange.next(height);
    }
  }
}
