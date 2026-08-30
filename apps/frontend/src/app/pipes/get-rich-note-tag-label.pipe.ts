import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkspaceService } from '../modules/workspace/services/workspace.service';

/**
 * The label of a rich-note tag, as an observable: the tags come from a vocabulary the workspace
 * loads, so a tag may be shown before its name is known and has to be redrawn when it arrives.
 */
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
