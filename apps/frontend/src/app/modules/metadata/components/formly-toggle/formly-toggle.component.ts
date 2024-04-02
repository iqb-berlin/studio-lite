import {
  ChangeDetectionStrategy, Component, ViewChild
} from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { FieldTypeConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

interface FormlyToggleProps extends FormlyFieldProps {
  trueLabel?: string;
  falseLabel?: string;
}

@Component({
  selector: 'studio-lite-formly-toggle',
  templateUrl: './formly-toggle.component.html',
  styleUrls: ['./formly-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatSlideToggle, FormsModule, ReactiveFormsModule, FormlyModule]
})

export class FormlyToggleComponent extends FieldType<FieldTypeConfig<FormlyToggleProps>> {
  @ViewChild(MatSlideToggle, { static: true }) slideToggle!: MatSlideToggle;
  override onContainerClick(event: MouseEvent): void {
    this.slideToggle.focus();
    super.onContainerClick(event);
  }
}
