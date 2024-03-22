import { Pipe, PipeTransform } from '@angular/core';
import { ReviewDto, WorkspaceDto } from '@studio-lite-lib/api-dto';
import { UserIssue } from '../models/user-issue.interface';

@Pipe({
    name: 'userIssues',
    standalone: true
})
export class UserIssuesPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(issues: Partial<ReviewDto>[] | (Partial<WorkspaceDto> & { workspaceName: string })[],
            linkPrefix: string): UserIssue[] {
    return issues.map(issue => ({
      link: `/${linkPrefix}/${issue.id}`,
      name: issue.name as string,
      toolTip: issue.workspaceName ? issue.workspaceName : ''
    }));
  }
}
