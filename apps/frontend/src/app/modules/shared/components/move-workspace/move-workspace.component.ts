import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface MoveComponentData {
  title: string,
  prompt: string,
  default: string,
  okButtonLabel: string,
  wResponse: number[]
}
@Component({
  selector: 'studio-lite-move-workspace',
  templateUrl: './move-workspace.component.html',
  styleUrls: ['./move-workspace.component.scss']
})
export class MoveWorkspaceComponent {
  typedData: MoveComponentData;
  selectedValue:string = '';
  constructor(@Inject(MAT_DIALOG_DATA) data: unknown) {
    this.typedData = data as MoveComponentData;
  }
}
