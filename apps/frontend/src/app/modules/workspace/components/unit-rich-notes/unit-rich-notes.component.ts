import {
  Component, OnDestroy, OnInit, signal
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  combineLatest, map, Subject, switchMap, takeUntil
} from 'rxjs';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  UnitItemDto, UnitRichNoteDto, UnitRichNotesDto, UnitRichNoteTagDto
} from '@studio-lite-lib/api-dto';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';

import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitRichNoteDialogComponent } from '../unit-rich-note-dialog/unit-rich-note-dialog.component';
import { RichNoteNode, UnitRichNoteNodeComponent } from '../unit-rich-note-node/unit-rich-note-node.component';
import { findRootTag } from '../../../../utils/rich-note-tags.utils';

/**
 * The notes on a unit, arranged under the tags the workspace group offers. Every top-level tag is
 * shown whether or not it holds a note, so the tags a unit is meant to be described under are
 * visible before anything has been written; a tag further down appears only when there is something
 * under it.
 *
 * A note whose tag is no longer in the vocabulary is collected under "unassigned" rather than
 * dropped -- a changed tag list must not make written notes disappear.
 */
@Component({
  selector: 'studio-lite-unit-rich-notes',
  templateUrl: './unit-rich-notes.component.html',
  styleUrls: ['./unit-rich-notes.component.scss'],
  host: { class: 'unit-rich-notes' },
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
    UnitRichNoteNodeComponent
  ]
})
export class UnitRichNotesComponent implements OnInit, OnDestroy {
  unitId = 0;
  workspaceId = 0;
  notes: UnitRichNoteDto[] = [];
  displayNodes: RichNoteNode[] = [];
  unitItems: UnitItemDto[] = [];
  canWrite = false;
  isLoading = true;
  private readonly notesNotLoadedState = signal(false);
  readonly notesNotLoaded = this.notesNotLoadedState.asReadonly();
  private readonly destroyed = signal(false);

  private ngUnsubscribe = new Subject<void>();

  constructor(
    public workspaceService: WorkspaceService,
    private workspaceBackendService: WorkspaceBackendService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    combineLatest([this.workspaceService.userAccessLevel$, this.workspaceService.isWorkspaceGroupAdmin$])
      .pipe(
        takeUntil(this.ngUnsubscribe),
        map(([level, isAdmin]) => level >= 2 || isAdmin)
      )
      .subscribe(canWrite => {
        this.canWrite = canWrite;
      });

    combineLatest([
      this.workspaceService.selectedUnit$,
      this.workspaceService.richNoteTags$
    ]).pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap(([unitId]) => {
        this.unitId = Number(unitId);
        this.workspaceId = this.workspaceService.selectedWorkspaceId;
        this.isLoading = true;
        return this.workspaceBackendService.getUnitRichNotes(this.workspaceId, this.unitId);
      })
    ).subscribe((data: UnitRichNotesDto | null) => {
      this.isLoading = false;
      // Kept after a failed load, the notes of the unit before would be shown as this one's (#1952).
      this.notesNotLoadedState.set(!data);
      if (data) {
        this.notes = data.notes;
        this.rebuildDisplayNodes();
      } else {
        this.notes = [];
        this.displayNodes = [];
      }
    });

    this.workspaceService.selectedUnit$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap(unitId => this.workspaceBackendService.getUnitItems(
          this.workspaceService.selectedWorkspaceId,
          Number(unitId)
        ))
      )
      .subscribe((items: UnitItemDto[]) => {
        this.unitItems = items;
      });
  }

  rebuildDisplayNodes(): void {
    this.displayNodes = this.buildHierarchy(this.workspaceService.richNoteTags, true);

    const assignedNoteIds = new Set(this.getAllAssignedNoteIds(this.displayNodes));
    const orphanedNotes = this.notes.filter(n => !assignedNoteIds.has(n.id));

    if (orphanedNotes.length > 0) {
      this.displayNodes.push({
        tagId: 'unassigned',
        label: [{ lang: 'de', value: this.translateService.instant('workspace.unassigned-rich-notes') }],
        notes: orphanedNotes,
        children: []
      });
    }
  }

  private getAllAssignedNoteIds(nodes: RichNoteNode[]): number[] {
    let ids: number[] = [];
    nodes.forEach(node => {
      ids = [...ids, ...node.notes.map(n => n.id)];
      if (node.children.length > 0) {
        ids = [...ids, ...this.getAllAssignedNoteIds(node.children)];
      }
    });
    return ids;
  }

  private buildHierarchy(tags: UnitRichNoteTagDto[], isRoot = false): RichNoteNode[] {
    const result: RichNoteNode[] = [];
    tags.forEach(tag => {
      const fullId = tag.id;
      const nodeNotes = this.notes.filter(n => n.tagId === fullId);
      const childrenNodes = tag.children ? this.buildHierarchy(tag.children) : [];
      if (isRoot || nodeNotes.length > 0 || childrenNodes.length > 0) {
        result.push({
          tagId: fullId,
          label: tag.label,
          notes: nodeNotes,
          children: childrenNodes
        });
      }
    });
    return result;
  }

  openNoteDialog(note?: UnitRichNoteDto, preSelectedTagId?: string): void {
    if (!this.canWrite) return;

    let availableTags = this.workspaceService.richNoteTags;
    if (preSelectedTagId) {
      const rootTag = findRootTag(this.workspaceService.richNoteTags, preSelectedTagId);
      if (rootTag) {
        availableTags = [rootTag];
      }
    }

    const dialogData = {
      note: note || (preSelectedTagId ? { tagId: preSelectedTagId } : undefined),
      workspaceId: this.workspaceId,
      unitId: this.unitId,
      tags: availableTags,
      items: this.unitItems
    };

    const dialogRef = this.dialog.open(UnitRichNoteDialogComponent, {
      width: '700px',
      data: dialogData
    });

    dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      if (result) {
        // The unit the note is written for: the page stays when the user moves to another unit
        const writtenFor = { workspaceId: this.workspaceId, unitId: this.unitId };
        if (result.id) {
          // The writes are not cancelled with the page: a note the dialog took would be lost.
          this.workspaceBackendService
            .patchUnitRichNote(writtenFor.workspaceId, writtenFor.unitId, result.id, result)
            .subscribe(success => {
              if (success) {
                const index = this.notes.findIndex(n => n.id === result.id);
                if (index > -1) {
                  this.notes[index] = { ...this.notes[index], ...result };
                  this.rebuildDisplayNodes();
                }
              } else {
                this.reopenAfterFailedSave(result, writtenFor, preSelectedTagId);
              }
            });
        } else {
          const newNote = {
            unitId: writtenFor.unitId,
            tagId: result.tagId,
            content: result.content,
            format: result.format || 'html',
            language: result.language,
            links: result.links,
            itemReferences: result.itemReferences
          };
          this.workspaceBackendService.addUnitRichNote(writtenFor.workspaceId, writtenFor.unitId, newNote)
            .subscribe(id => {
              if (id) {
                this.workspaceBackendService.getUnitRichNotes(writtenFor.workspaceId, writtenFor.unitId)
                  .pipe(takeUntil(this.ngUnsubscribe))
                  .subscribe(data => {
                    // Shown over another unit, they would stand in place of its notes
                    if (!this.isShowing(writtenFor)) return;
                    if (data) {
                      this.notes = data.notes;
                      this.rebuildDisplayNodes();
                    } else {
                      // Stored, but not shown, the note would invite a second save that stores it twice
                      const now = new Date();
                      this.notes = [...this.notes, {
                        ...newNote, id, createdAt: now, changedAt: now
                      }];
                      this.rebuildDisplayNodes();
                    }
                  });
              } else {
                this.reopenAfterFailedSave(result, writtenFor, preSelectedTagId);
              }
            });
        }
      }
    });
  }

  // The dialog is closed by the time the answer comes. Opened again with what was written, the
  // note is not lost and can be saved once more -- but only over the notes of the unit it was
  // written for: anywhere else a second save would file it there (#2005). The message comes after
  // the dialog, so that its backdrop does not cover it.
  private reopenAfterFailedSave(
    written: UnitRichNoteDto,
    writtenFor: { workspaceId: number, unitId: number },
    preSelectedTagId?: string
  ): void {
    if (this.isShowing(writtenFor)) {
      this.openNoteDialog(written, preSelectedTagId);
    }
    this.showError('workspace.rich-note-not-saved');
  }

  // whether the page still shows the notes of that unit
  private isShowing(unit: { workspaceId: number, unitId: number }): boolean {
    return !this.destroyed() && unit.workspaceId === this.workspaceId && unit.unitId === this.unitId;
  }

  private showError(key: string): void {
    this.snackBar.open(
      this.translateService.instant(key),
      this.translateService.instant('error'),
      { duration: 3000 }
    );
  }

  deleteNote(noteId: number): void {
    if (!this.canWrite) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: this.translateService.instant('workspace.delete-rich-note-title'),
        content: this.translateService
          .instant('workspace.delete-rich-note-confirm'),
        confirmButtonLabel: this.translateService.instant('delete'),
        showCancel: true
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      if (result === true) {
        this.workspaceBackendService.deleteUnitRichNote(this.workspaceId, this.unitId, noteId)
          .subscribe(success => {
            if (success) {
              this.notes = this.notes.filter(n => n.id !== noteId);
              this.rebuildDisplayNodes();
            } else {
              this.showError('workspace.rich-note-not-deleted');
            }
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed.set(true);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
