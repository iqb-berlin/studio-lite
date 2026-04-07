import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkspaceService } from '../modules/workspace/services/workspace.service';

@Pipe({
  name: 'getRichNoteTagLabel',
  standalone: true,
  pure: true
})
export class GetRichNoteTagLabelPipe implements PipeTransform {
  constructor(private workspaceService: WorkspaceService) {}

  transform(tagId: string): Observable<{ lang: string, value: string }[]> {
    return this.workspaceService.richNoteTags$.pipe(
      map(() => this.workspaceService.getRichNoteTagLabel(tagId))
    );
  }
}
