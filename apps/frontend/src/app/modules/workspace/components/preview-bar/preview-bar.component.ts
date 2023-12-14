import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { Response } from '@iqb/responses';
import { PageData } from '../../models/page-data.interface';
import { WorkspaceService } from '../../services/workspace.service';
import { Progress } from '../../models/types';

@Component({
  selector: 'studio-lite-preview-bar',
  templateUrl: './preview-bar.component.html',
  styleUrls: ['./preview-bar.component.scss']
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
  @Input() responses!: Response[];
  @Output() gotoPage = new EventEmitter<{ action: string, index?: number }>();
  @Output() navigationDenied = new EventEmitter<void>();
  @Output() checkCoding = new EventEmitter<void>();

  constructor(
    public workspaceService: WorkspaceService
  ) {
  }
}
