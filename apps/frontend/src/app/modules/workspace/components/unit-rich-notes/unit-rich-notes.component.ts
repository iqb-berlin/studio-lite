import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
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

@Component({
  selector: 'studio-lite-unit-rich-notes',
  templateUrl: './unit-rich-notes.component.html',
  styleUrls: ['./unit-rich-notes.component.scss'],
  host: { class: 'unit-rich-notes' },
  standalone: true,
  imports: [
    CommonModule,
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

  private ngUnsubscribe = new Subject<void>();

  constructor(
    public workspaceService: WorkspaceService,
    private workspaceBackendService: WorkspaceBackendService,
    private translateService: TranslateService,
    private dialog: MatDialog
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
      if (data) {
        this.notes = data.notes;
        this.rebuildDisplayNodes();
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
    this.displayNodes = this.buildHierarchy(this.workspaceService.richNoteTags, '', true);

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

  private buildHierarchy(tags: UnitRichNoteTagDto[], parentId = '', isRoot = false): RichNoteNode[] {
    const result: RichNoteNode[] = [];
    tags.forEach(tag => {
      const fullId = parentId ? `${parentId}.${tag.id}` : tag.id;
      const nodeNotes = this.notes.filter(n => n.tagId === fullId);
      const childrenNodes = tag.children ? this.buildHierarchy(tag.children, fullId) : [];
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
      const rootId = preSelectedTagId.split('.')[0];
      const rootTag = this.workspaceService.richNoteTags.find(t => t.id === rootId);
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

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.workspaceBackendService.patchUnitRichNote(this.workspaceId, this.unitId, result.id, result)
            .subscribe(success => {
              if (success) {
                const index = this.notes.findIndex(n => n.id === result.id);
                if (index > -1) {
                  this.notes[index] = { ...this.notes[index], ...result };
                  this.rebuildDisplayNodes();
                }
              }
            });
        } else {
          const newNote = {
            unitId: this.unitId,
            tagId: result.tagId,
            content: result.content,
            links: result.links,
            itemReferences: result.itemReferences
          };
          this.workspaceBackendService.addUnitRichNote(this.workspaceId, this.unitId, newNote)
            .subscribe(id => {
              if (id) {
                this.workspaceBackendService.getUnitRichNotes(this.workspaceId, this.unitId)
                  .subscribe(data => {
                    if (data) {
                      this.notes = data.notes;
                      this.rebuildDisplayNodes();
                    }
                  });
              }
            });
        }
      }
    });
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

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workspaceBackendService.deleteUnitRichNote(this.workspaceId, this.unitId, noteId)
          .subscribe(success => {
            if (success) {
              this.notes = this.notes.filter(n => n.id !== noteId);
              this.rebuildDisplayNodes();
            }
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
