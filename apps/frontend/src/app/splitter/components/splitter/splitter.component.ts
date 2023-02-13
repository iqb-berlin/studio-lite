import {
  AfterViewInit, Component, ContentChildren, QueryList
} from '@angular/core';
import { SplitterPaneComponent } from '../splitter-pane/splitter-pane.component';

@Component({
  selector: 'studio-lite-splitter',
  templateUrl: './splitter.component.html',
  styleUrls: ['./splitter.component.scss']
})
export class SplitterComponent implements AfterViewInit {
  @ContentChildren(SplitterPaneComponent) panes!: QueryList<SplitterPaneComponent>;

  gutterLineSize: number = 2;
  gutterHotspotSize: number = 16;
  availablePanesSize: number = 0;

  ngAfterViewInit() {
    this.panes.forEach((pane, index) => {
      setTimeout(() => pane.init(index));
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
}
