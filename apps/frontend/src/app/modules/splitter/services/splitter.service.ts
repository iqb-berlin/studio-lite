import { Injectable } from '@angular/core';

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
