// panel-wrapper.component.ts
import { Component } from '@angular/core';
import { FieldTypeConfig, FieldWrapper, FormlyFieldProps } from '@ngx-formly/core';
import { FieldType } from '@ngx-formly/material';

interface FormlyExpandedProps extends FormlyFieldProps {
  expanded?: boolean;
}

@Component({
  selector: 'studio-lite-formly-wrapper-panel',
  template: `
      <mat-expansion-panel [expanded]="props.expanded || false">
        <mat-expansion-panel-header >
          <mat-panel-title>{{ model['profileItemId'] || props.label }}
          </mat-panel-title>
        </mat-expansion-panel-header>
          <ng-container #fieldComponent></ng-container>
      </mat-expansion-panel>
  `
})
export class FormlyWrapperPanel extends FieldWrapper<FieldType<FieldTypeConfig<FormlyExpandedProps>>> {}
