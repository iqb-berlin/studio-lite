import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  combineLatest, map, Subject, switchMap, takeUntil
} from 'rxjs';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  UnitItemDto, UnitRichNoteDto, UnitRichNotesDto
} from '@studio-lite-lib/api-dto';

import { AppService } from '../../../../services/app.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitRichNoteDialogComponent } from '../unit-rich-note-dialog/unit-rich-note-dialog.component';
import { GetLocalizedValuePipe } from '../../../../pipes/get-localized-value.pipe';
import { GetRichNoteTagLabelPipe } from '../../../../pipes/get-rich-note-tag-label.pipe';
import { GetItemLabelPipe } from '../../../../pipes/get-item-label.pipe';

@Component({
  selector: 'studio-lite-unit-rich-notes',
  templateUrl: './unit-rich-notes.component.html',
  styleUrls: ['./unit-rich-notes.component.scss'],
  host: { class: 'unit-rich-notes' },
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    GetLocalizedValuePipe,
    GetRichNoteTagLabelPipe,
    AsyncPipe,
    GetItemLabelPipe
  ]
})
export class UnitRichNotesComponent implements OnInit, OnDestroy {
  unitId = 0;
  workspaceId = 0;
  notes: UnitRichNoteDto[] = [];
  unitItems: UnitItemDto[] = [];
  canWrite = false;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    public appService: AppService,
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

    this.workspaceService.selectedUnit$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap(unitId => {
          this.unitId = Number(unitId);
          this.workspaceId = this.workspaceService.selectedWorkspaceId;
          return this.workspaceBackendService.getUnitRichNotes(this.workspaceId, this.unitId);
        })
      )
      .subscribe((data: UnitRichNotesDto | null) => {
        if (data) {
          this.notes = data.notes.sort((a: UnitRichNoteDto, b: UnitRichNoteDto) => a.tagId.localeCompare(b.tagId));
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

  openNoteDialog(note?: UnitRichNoteDto): void {
    if (!this.canWrite) return;

    const dialogRef = this.dialog.open(UnitRichNoteDialogComponent, {
      width: '600px',
      data: {
        note,
        workspaceId: this.workspaceId,
        unitId: this.unitId,
        tags: this.workspaceService.richNoteTags,
        items: this.unitItems
      }
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
                // Fetch all notes to get proper timestamps and refresh list
                this.workspaceBackendService.getUnitRichNotes(this.workspaceId, this.unitId)
                  .subscribe(data => {
                    if (data) {
                      this.notes = data.notes.sort((a, b) => a.tagId.localeCompare(b.tagId));
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

    // eslint-disable-next-line no-alert
    if (window.confirm(this.translateService.instant('workspace.delete-rich-note-confirm') || 'Really delete note?')) {
      this.workspaceBackendService.deleteUnitRichNote(this.workspaceId, this.unitId, noteId)
        .subscribe(success => {
          if (success) {
            this.notes = this.notes.filter(n => n.id !== noteId);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
