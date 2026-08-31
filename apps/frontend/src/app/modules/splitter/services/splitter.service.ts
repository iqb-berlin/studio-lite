import { Injectable } from '@angular/core';

/**
 * The widths of the split panes, remembered while the studio is open so a view keeps the layout the
 * user dragged it into. Panes that no longer fit the window are dropped from the end -- a stored
 * layout from a wider screen must not push content out of sight.
 */
@Injectable({
  providedIn: 'root'
})

export class SplitterService {
  panelSizes: number[] = [];

  update(panelSizes: number[]) {
    panelSizes.forEach((paneSize, index) => {
      this.panelSizes[index] = paneSize;
    });
    while (SplitterService.getPanelSizesSum(this.panelSizes) > document.body.clientWidth) {
      this.panelSizes.splice(this.panelSizes.length - 1, 1);
    }
  }

  private static getPanelSizesSum(panelSizes: number[]): number {
    return panelSizes
      .reduce((sum, size) => sum + size, 0) + (panelSizes.length * 2);
  }
}
