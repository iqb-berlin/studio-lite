// panel-wrapper.component.ts
import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'studio-lite-formly-wrapper-panel',
  template: `
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>{{ model['profileItemId'] || props.label }}
          </mat-panel-title>
        </mat-expansion-panel-header>
          <ng-container #fieldComponent></ng-container>
      </mat-expansion-panel>
  `
})
export class FormlyWrapperPanel extends FieldWrapper {
}
