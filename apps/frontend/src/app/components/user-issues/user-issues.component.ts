import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserIssue } from '../../models/user-issue.interface';

@Component({
  selector: 'studio-lite-user-issues',
  templateUrl: './user-issues.component.html',
  styleUrls: ['./user-issues.component.scss'],
  imports: [RouterLink]
})
export class UserIssuesComponent {
  @Input() issues!: UserIssue[];
}
