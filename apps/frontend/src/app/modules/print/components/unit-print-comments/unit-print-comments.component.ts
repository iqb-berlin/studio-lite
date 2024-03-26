import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Comment } from '../../../comments/models/comment.interface';
import { BackendService } from '../../../comments/services/backend.service';

@Component({
  selector: 'studio-lite-unit-print-comments',
  templateUrl: './unit-print-comments.component.html',
  styleUrls: ['./unit-print-comments.component.scss'],
  standalone: true,
  imports: [MatIcon, AsyncPipe, DatePipe, TranslateModule]
})
export class UnitPrintCommentsComponent implements OnInit {
  @Input() unitId!: number;
  @Input() workspaceId!: number;
  comments!: Observable<Comment[]>;
  constructor(
    private backendService: BackendService
  ) {}

  ngOnInit(): void {
    this.comments = this.backendService
      .getComments(this.workspaceId, this.unitId, 0);
  }
}
