import { Component } from '@angular/core';

import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import {
  MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle
} from '@angular/material/dialog';
import {
  MatCellDef,
  MatHeaderCellDef,
  MatHeaderRowDef,
  MatRowDef,
  MatTable,
  MatTableModule
} from '@angular/material/table';

interface RoleAccess {
  functionality: string;
  commenter: boolean;
  developer: boolean;
  super: boolean;
}

@Component({
  selector: 'studio-lite-roles-matrix',
  // eslint-disable-next-line max-len
  imports: [MatIcon, TranslateModule, MatTooltip, MatButton, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatTable, MatTableModule, MatHeaderCellDef, MatCellDef, MatHeaderRowDef, MatRowDef],
  templateUrl: './roles-matrix.component.html',
  styleUrl: './roles-matrix.component.scss'
})

export class RolesMatrixComponent {
  dataSource: RoleAccess[] = [
    {
      functionality: 'unit-create', commenter: false, developer: true, super: true
    },
    {
      functionality: 'unit-copy', commenter: true, developer: true, super: true
    },
    {
      functionality: 'unit-move', commenter: false, developer: false, super: true
    },
    {
      functionality: 'unit-delete', commenter: false, developer: false, super: true
    },
    {
      functionality: 'unit-export', commenter: true, developer: true, super: true
    },
    {
      functionality: 'unit-import', commenter: false, developer: false, super: true
    },
    {
      functionality: 'unit-copy-from', commenter: false, developer: false, super: true
    },
    {
      functionality: 'unit-submit', commenter: true, developer: true, super: true
    },
    {
      functionality: 'unit-return', commenter: true, developer: true, super: true
    },
    {
      functionality: 'review-create', commenter: false, developer: false, super: true
    },
    {
      functionality: 'review-delete', commenter: false, developer: false, super: true
    },
    {
      functionality: 'manage-unit-group', commenter: false, developer: false, super: true
    },
    {
      functionality: 'comment', commenter: true, developer: true, super: true
    },
    {
      functionality: 'reports-create', commenter: true, developer: true, super: true
    },
    {
      functionality: 'print-create', commenter: true, developer: true, super: true
    }
  ];

  displayedColumns: string[] = ['functionality', 'commenter', 'developer', 'super'];
}
