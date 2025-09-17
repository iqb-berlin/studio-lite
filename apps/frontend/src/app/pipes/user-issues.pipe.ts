import { Pipe, PipeTransform } from '@angular/core';
import { WorkspaceDto } from '@studio-lite-lib/api-dto';
import { UserIssue } from '../models/user-issue.interface';

@Pipe({
  name: 'userIssues',
  standalone: true
})
export class UserIssuesPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(issues: WorkspaceDto[],
            linkPrefix: string): UserIssue[] {
    return issues?.map(issue => ({
      link: `/${linkPrefix}/${issue.id}`,
      name: issue.name as string
    }));
  }
}
