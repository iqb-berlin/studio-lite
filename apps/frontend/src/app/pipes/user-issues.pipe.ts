import { Pipe, PipeTransform } from '@angular/core';
import { WorkspaceDto } from '@studio-lite-lib/api-dto';
import { UserIssue } from '../models/user-issue.interface';

/**
 * Turns workspaces into the name-and-link entries the home page lists them as. The prefix is the
 * route they lead into, so the same list can point at different areas of the studio.
 */
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
