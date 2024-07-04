import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'studio-lite-roles-header',
  standalone: true,
  imports: [CommonModule, MatIcon, TranslateModule, MatTooltip],
  templateUrl: './roles-header.component.html',
  styleUrl: './roles-header.component.scss'
})
export class RolesHeaderComponent {}
