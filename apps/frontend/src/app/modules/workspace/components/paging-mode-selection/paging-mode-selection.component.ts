import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FormsModule } from '@angular/forms';
import { PagingMode } from '../../models/types';
import { PreviewService } from '../../services/preview.service';

@Component({
    selector: 'studio-lite-paging-mode-selection',
    templateUrl: './paging-mode-selection.component.html',
    styleUrls: ['./paging-mode-selection.component.scss'],
    imports: [FormsModule, TranslateModule]
})
export class PagingModeSelectionComponent {
  pagingModes: PagingMode[] = ['separate', 'buttons', 'concat-scroll', 'concat-scroll-snap'];

  constructor(public previewService: PreviewService) {}
}
