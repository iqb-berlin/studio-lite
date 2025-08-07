import { Pipe, PipeTransform } from '@angular/core';
import { ReviewDto, WorkspaceDto } from '@studio-lite-lib/api-dto';
import { TranslateService } from '@ngx-translate/core';
import { UserIssue } from '../models/user-issue.interface';

@Pipe({
  name: 'userIssues',
  standalone: true
})
export class UserIssuesPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(issues: Partial<ReviewDto>[] |
  (Partial<WorkspaceDto> & { workspaceName: string; workspaceGroupName: string })[],
            linkPrefix: string): UserIssue[] {
    return issues?.map(issue => ({
      link: `/${linkPrefix}/${issue.id}`,
      name: issue.name as string,
      toolTip: issue.workspaceName && issue.workspaceGroupName ?
        this.translateService
          .instant('review.info', { workspace: issue.workspaceName, workspaceGroup: issue.workspaceGroupName }) : ''
    }));
  }
}
