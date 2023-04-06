import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from '../../../comments/services/backend.service';
import { Comment } from '../../../comments/types/comment';

@Component({
  selector: 'studio-lite-unit-print-comments',
  templateUrl: './unit-print-comments.component.html',
  styleUrls: ['./unit-print-comments.component.scss']
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
