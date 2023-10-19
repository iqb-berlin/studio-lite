// panel-wrapper.component.ts
import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'formly-wrapper-panel',
  template: `
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>{{ props.label }}
          </mat-panel-title>
          <mat-panel-description>
          </mat-panel-description>
        </mat-expansion-panel-header>
          <ng-container #fieldComponent></ng-container>
      </mat-expansion-panel>
  `
})
export class PanelFieldWrapper extends FieldWrapper {
}
