import { Component } from '@angular/core';

import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { RolesMatrixComponent } from '../roles-matrix/roles-matrix.component';

@Component({
  selector: 'studio-lite-roles-header',
  imports: [MatIcon, TranslateModule, MatTooltip, MatIconButton],
  templateUrl: './roles-header.component.html',
  styleUrl: './roles-header.component.scss'
})
export class RolesHeaderComponent {
  constructor(private roleMatrixDialog: MatDialog) {}

  showRolesMatrix() {
    this.roleMatrixDialog.open(RolesMatrixComponent, {
      width: '800px'
    });
  }
}
