import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UnitRichNoteTagDto } from '@studio-lite-lib/api-dto';
import { WorkspaceBackendService } from './workspace-backend.service';

@Injectable({
  providedIn: 'root'
})
export class RichNoteTagsService {
  private _tags$ = new BehaviorSubject<UnitRichNoteTagDto[] | null>(null);
  private _loading = false;
  private currentGroupId?: number;

  constructor(private backendService: WorkspaceBackendService) {}

  get tags$(): Observable<UnitRichNoteTagDto[]> {
    if (!this._tags$.getValue() && !this._loading) {
      this.loadTags();
    }
    return this._tags$.asObservable().pipe(
      map(tags => tags || [])
    );
  }

  get tags(): UnitRichNoteTagDto[] {
    return this._tags$.getValue() || [];
  }

  loadTags(workspaceGroupId?: number): void {
    if (this._loading && this.currentGroupId === workspaceGroupId) return;
    this._loading = true;
    this.currentGroupId = workspaceGroupId;
    this.backendService.getUnitRichNoteTags(workspaceGroupId)
      .subscribe({
        next: tags => {
          this._tags$.next(tags);
          this._loading = false;
        },
        error: () => {
          this._tags$.next([]);
          this._loading = false;
        }
      });
  }

  getTagLabel(tagId: string): { lang: string, value: string }[] {
    const findTag = (tags: UnitRichNoteTagDto[]): UnitRichNoteTagDto | undefined => {
      let found: UnitRichNoteTagDto | undefined = tags.find(tag => tag.id === tagId);
      if (!found) {
        tags.forEach(tag => {
          if (!found && tag.children && tag.children.length > 0) {
            found = findTag(tag.children);
          }
        });
      }
      return found;
    };

    const foundTag = findTag(this.tags);
    if (foundTag) return foundTag.label;

    // Fallback for legacy dot-separated paths
    const label = tagId.split('.').reduce<{
      tags: UnitRichNoteTagDto[],
      label: { lang: string; value: string }[] | null
    }>(
      (acc, segment) => {
        const found = acc.tags.find(t => t.id === segment);
        return {
          tags: found?.children || [],
          label: found?.label || null
        };
      },
      { tags: this.tags, label: null }
    ).label;

    return label || [];
  }
}
