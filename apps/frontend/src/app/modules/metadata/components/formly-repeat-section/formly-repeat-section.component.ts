import { Component } from '@angular/core';
import { FieldArrayType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';

interface FormlyRepeatProps extends FormlyFieldProps {
  addText?: string;
}

@Component({
  selector: 'studio-lite-formly-repeat-section',
  templateUrl: './formly-repeat-section.component.html',
  styleUrls: ['./formly-repeat-section.component.scss']
})
export class FormlyRepeatSectionComponent extends FieldArrayType<FieldTypeConfig<FormlyRepeatProps>> {}
