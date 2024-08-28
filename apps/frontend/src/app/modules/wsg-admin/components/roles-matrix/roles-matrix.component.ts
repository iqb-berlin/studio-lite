import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  commentator: boolean;
  developer: boolean;
  super: boolean;
}

@Component({
  selector: 'studio-lite-roles-matrix',
  standalone: true,
  imports: [CommonModule, MatIcon, TranslateModule, MatTooltip, MatButton, MatDialogActions, MatDialogClose,
    MatDialogTitle, MatDialogContent, MatTable, MatTableModule, MatHeaderCellDef, MatCellDef, MatHeaderRowDef,
    MatRowDef],
  templateUrl: './roles-matrix.component.html',
  styleUrl: './roles-matrix.component.scss'
})

export class RolesMatrixComponent {
  dataSource: RoleAccess[] = [
    {
      functionality: 'unit-create', commentator: false, developer: true, super: true
    },
    {
      functionality: 'unit-copy', commentator: true, developer: true, super: true
    },
    {
      functionality: 'unit-move', commentator: false, developer: false, super: true
    },
    {
      functionality: 'unit-delete', commentator: false, developer: false, super: true
    },
    {
      functionality: 'unit-export', commentator: true, developer: true, super: true
    },
    {
      functionality: 'unit-import', commentator: false, developer: false, super: true
    },
    {
      functionality: 'unit-submit', commentator: false, developer: true, super: true
    },
    {
      functionality: 'unit-return', commentator: false, developer: false, super: true
    },
    {
      functionality: 'review-create', commentator: false, developer: false, super: true
    },
    {
      functionality: 'review-delete', commentator: false, developer: false, super: true
    },
    {
      functionality: 'manage-unit-group', commentator: false, developer: false, super: true
    },
    {
      functionality: 'comment', commentator: true, developer: true, super: true
    },
    {
      functionality: 'reports-create', commentator: true, developer: true, super: true
    },
    {
      functionality: 'print-create', commentator: true, developer: true, super: true
    }
  ];

  displayedColumns: string[] = ['functionality', 'commentator', 'developer', 'super'];
}
