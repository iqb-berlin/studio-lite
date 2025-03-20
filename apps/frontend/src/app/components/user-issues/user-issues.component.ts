import { Component, Input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

import { UserIssue } from '../../models/user-issue.interface';

@Component({
  selector: 'studio-lite-user-issues',
  templateUrl: './user-issues.component.html',
  styleUrls: ['./user-issues.component.scss'],
  imports: [RouterLink, MatTooltip]
})
export class UserIssuesComponent {
  @Input() issues!: UserIssue[];
  @Input() layout!: 'big' | 'small';
}
