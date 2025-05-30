import {
  AfterViewInit, Component, ContentChildren, QueryList
} from '@angular/core';

import { SplitterPaneComponent } from '../splitter-pane/splitter-pane.component';
import { SplitterGutterComponent } from '../splitter-gutter/splitter-gutter.component';
import { SplitterService } from '../../services/splitter.service';

@Component({
  selector: 'studio-lite-splitter',
  templateUrl: './splitter.component.html',
  styleUrls: ['./splitter.component.scss'],
  imports: [SplitterGutterComponent]
})
export class SplitterComponent implements AfterViewInit {
  @ContentChildren(SplitterPaneComponent) panes!: QueryList<SplitterPaneComponent>;

  gutterLineSize: number = 2;
  gutterHotspotSize: number = 10;
  availablePanesSize: number = 0;

  constructor(private splitterService: SplitterService) {}

  ngAfterViewInit() {
    this.updateContent();
    this.panes.changes
      .subscribe(() => this.updateContent());
  }

  private updateContent(): void {
    this.panes.forEach((pane, index) => {
      setTimeout(() => pane.init(index, index === this.panes.length - 1));
    });
  }

  onGutterStartDragging(index: number): void {
    this.setAvailablePanesSizeForIndex(index);
  }

  onGutterDragging(value: { index: number, position: number }): void {
    this.calculatePanesSizeForIndex(value.index, value.position);
    setTimeout(() => {
      if (this.availablePanesSize === this.getCalculatedPanesSizeForIndex(value.index)) {
        this.setPanesStyleForIndex(value.index);
      }
    });
  }

  private getPanesForIndex(paneIndex: number): SplitterPaneComponent[] {
    return this.panes
      .filter((pane, index) => index === paneIndex || index === paneIndex + 1);
  }

  private setAvailablePanesSizeForIndex(paneIndex: number): void {
    this.availablePanesSize = this.getPanesForIndex(paneIndex)
      .reduce((sum, pane) => sum + pane.elementRef.nativeElement.offsetWidth,
        0);
  }

  private calculatePanesSizeForIndex(paneIndex: number, position: number): void {
    this.getPanesForIndex(paneIndex)
      .map(pane => pane.calculateSize(pane.index === paneIndex, position, this.gutterLineSize));
  }

  private getCalculatedPanesSizeForIndex(paneIndex: number): number {
    return this.getPanesForIndex(paneIndex)
      .reduce((sum, pane) => sum + pane.size, 0);
  }

  private setPanesStyleForIndex(paneIndex: number): void {
    this.getPanesForIndex(paneIndex).map(pane => pane.setStyle(pane.size));
  }

  onGutterStopDragging() {
    this.splitterService.update(
      this.panes
        .filter(pane => !pane.isLast)
        .map(pane => pane.size));
  }
}
