import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMiniFabButton } from '@angular/material/button';
import { PageData } from '../../models/page-data.interface';
import { WorkspaceService } from '../../services/workspace.service';
import { Progress } from '../../models/types';
import { PageNavigationComponent } from '../../../shared/components/page-navigation/page-navigation.component';
import { PagingModeSelectionComponent } from '../paging-mode-selection/paging-mode-selection.component';
import { StatusIndicationComponent } from '../status-indication/status-indication.component';

@Component({
  selector: 'studio-lite-preview-bar',
  templateUrl: './preview-bar.component.html',
  styleUrls: ['./preview-bar.component.scss'],
  imports: [StatusIndicationComponent, MatTooltip, PagingModeSelectionComponent,
    MatIcon, PageNavigationComponent, TranslateModule, MatMiniFabButton]
})
export class PreviewBarComponent {
  @Input() pageList!: PageData[];
  @Input() unitId!: number;
  @Input() playerApiVersion!: number;
  @Input() postMessageTarget!: Window | undefined;
  @Input() playerName!: string;
  @Input() presentationProgress!: Progress;
  @Input() responseProgress!: Progress;
  @Input() hasFocus!: boolean;
  @Output() gotoPage = new EventEmitter<{ action: string, index?: number }>();
  @Output() navigationDenied = new EventEmitter<void>();
  @Output() checkCoding = new EventEmitter<void>();
  @Output() print = new EventEmitter<void>();

  constructor(
    public workspaceService: WorkspaceService
  ) {
  }
}
