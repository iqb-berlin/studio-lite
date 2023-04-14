import { Component, Input } from '@angular/core';
import { UserIssue } from '../../models/user-issue';

@Component({
  selector: 'studio-lite-user-issues',
  templateUrl: './user-issues.component.html',
  styleUrls: ['./user-issues.component.scss']
})
export class UserIssuesComponent {
  @Input() issues!: UserIssue[];
  @Input() layout!: 'big' | 'small';
}
