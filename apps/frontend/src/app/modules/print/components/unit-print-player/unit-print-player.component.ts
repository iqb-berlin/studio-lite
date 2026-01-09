import {
  AfterViewInit, Component, ElementRef, Input, OnDestroy, Output, ViewChild
} from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ModuleService } from '../../../shared/services/module.service';
import { AppService } from '../../../../services/app.service';
import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { PreviewDirective } from '../../../shared/directives/preview.directive';
import { UnitState } from '../../../shared/models/verona.interface';

@Component({
  selector: 'studio-lite-unit-print-player',
  templateUrl: './unit-print-player.component.html',
  styleUrls: ['./unit-print-player.component.scss'],
  standalone: true
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

  constructor(
    public appService: AppService,
    public backendService: WorkspaceBackendService,
    public workspaceService: WorkspaceService,
    public moduleService: ModuleService,
    public translateService: TranslateService,
    public snackBar: MatSnackBar
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.setHostingIframe();
    this.subscribeForPostMessages();
    this.buildVeronaModule(this.playerId, 'player');
  }

  sendChangeData(): void {
    this.backendService.getUnitDefinition(this.workspaceId, this.unitId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(ued => {
        if (ued) {
          this.postStore(ued.definition || '');
        }
      });
  }

  postStore(definition: string): void {
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
          presentationProgress: 'none',
          responseProgress: 'none'
        },
        playerConfig: {
          stateReportPolicy: 'eager',
          pagingMode: 'concat-scroll',
          printMode: this.printElementIds ? 'on-with-ids' : 'on',
          directDownloadUrl: this.backendService.getDirectDownloadLink()
        },
        unitDefinition: definition || ''
      }, '*');
    }
    this.unitLoaded.next(true);
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  protected handleUnitStateData(_unitState: UnitState): void {}

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  gotoUnit(_target: string): void {}

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
