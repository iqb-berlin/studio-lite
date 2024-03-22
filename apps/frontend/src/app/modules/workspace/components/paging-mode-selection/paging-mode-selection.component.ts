import { Component } from '@angular/core';
import { PreviewService } from '../../services/preview.service';
import { PagingMode } from '../../models/types';
import { TranslateModule } from '@ngx-translate/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'studio-lite-paging-mode-selection',
    templateUrl: './paging-mode-selection.component.html',
    styleUrls: ['./paging-mode-selection.component.scss'],
    standalone: true,
    imports: [FormsModule, NgFor, TranslateModule]
})
export class PagingModeSelectionComponent {
  pagingModes: PagingMode[] = ['separate', 'buttons', 'concat-scroll', 'concat-scroll-snap'];

  constructor(public previewService: PreviewService) {}
}
