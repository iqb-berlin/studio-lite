import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { PagingMode } from '../../models/types';
import { PreviewService } from '../../services/preview.service';

@Component({
  selector: 'studio-lite-paging-mode-selection',
  templateUrl: './paging-mode-selection.component.html',
  styleUrls: ['./paging-mode-selection.component.scss'],
  imports: [FormsModule, TranslateModule, MatTooltip]
})
export class PagingModeSelectionComponent {
  pagingModes: PagingMode[] = ['buttons', 'separate', 'concat-scroll', 'concat-scroll-snap'];

  constructor(public previewService: PreviewService) {}
}
