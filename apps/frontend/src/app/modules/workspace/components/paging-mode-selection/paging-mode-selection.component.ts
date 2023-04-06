import { Component } from '@angular/core';
import { PagingMode } from '../../models/unit-page.model';
import { PreviewService } from '../../services/preview.service';

@Component({
  selector: 'studio-lite-paging-mode-selection',
  templateUrl: './paging-mode-selection.component.html',
  styleUrls: ['./paging-mode-selection.component.scss']
})
export class PagingModeSelectionComponent {
  pagingModes: PagingMode[] = ['separate', 'concat-scroll', 'concat-scroll-snap'];

  constructor(public previewService: PreviewService) {}
}
