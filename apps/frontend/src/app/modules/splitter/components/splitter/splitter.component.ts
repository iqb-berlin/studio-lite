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
    const panes = this.getPanesForIndex(value.index);
    if (panes.length === 2) {
      this.updatePanesSize(panes[0], panes[1], value.position);
    }
  }

  private updatePanesSize(paneA: SplitterPaneComponent, paneB: SplitterPaneComponent, pointerPosition: number): void {
    const totalSize = this.availablePanesSize;
    const paneBounds = paneA.elementRef.nativeElement.getBoundingClientRect();
    const rawSizeA = Math.round(pointerPosition - paneBounds.left);

    const constrainedSizeA = SplitterComponent.constrainSizeA(paneA, paneB, rawSizeA, totalSize);

    if (Math.round(paneA.size) === constrainedSizeA) {
      return;
    }

    const constrainedSizeB = totalSize - constrainedSizeA;

    paneA.size = constrainedSizeA;
    paneB.size = constrainedSizeB;

    paneA.setStyle(constrainedSizeA);
    paneB.setStyle(constrainedSizeB);
  }

  private static constrainSizeA(
    paneA: SplitterPaneComponent, paneB: SplitterPaneComponent, sizeA: number, totalSize: number
  ): number {
    const minA = Math.max(paneA.minSize, totalSize - (paneB.maxSize || totalSize));
    const maxA = Math.min(paneA.maxSize || totalSize, totalSize - paneB.minSize);
    return Math.max(minA, Math.min(sizeA, maxA));
  }

  private getPanesForIndex(paneIndex: number): SplitterPaneComponent[] {
    return this.panes
      .filter((pane, index) => index === paneIndex || index === paneIndex + 1);
  }

  private setAvailablePanesSizeForIndex(paneIndex: number): void {
    this.availablePanesSize = this.getPanesForIndex(paneIndex)
      .reduce((sum, pane) => sum + pane.elementRef.nativeElement.getBoundingClientRect().width,
        0);
  }

  onGutterStopDragging() {
    this.splitterService.update(
      this.panes
        .filter(pane => !pane.isLast)
        .map(pane => pane.size));
  }
}
