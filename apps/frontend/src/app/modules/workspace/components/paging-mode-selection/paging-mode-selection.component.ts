import { Component } from '@angular/core';
import { PreviewService } from '../../services/preview.service';
import { PagingMode } from '../../models/types';

@Component({
  selector: 'studio-lite-paging-mode-selection',
  templateUrl: './paging-mode-selection.component.html',
  styleUrls: ['./paging-mode-selection.component.scss']
})
export class PagingModeSelectionComponent {
  pagingModes: PagingMode[] = ['separate', 'concat-scroll', 'concat-scroll-snap'];

  constructor(public previewService: PreviewService) {}
}
