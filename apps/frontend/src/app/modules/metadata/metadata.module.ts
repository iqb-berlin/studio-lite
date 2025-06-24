import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormlyModule, FORMLY_CONFIG, FormlyFieldConfig } from '@ngx-formly/core';
import {
  AbstractControl, FormsModule, ReactiveFormsModule, ValidationErrors
} from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTreeModule } from '@angular/material/tree';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormlyMatToggleModule } from '@ngx-formly/material/toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { FormlyChipsComponent } from './components/formly-chips/formly-chips.component';
import { FormlyWrapperPanel } from './components/formly-wrapper-panel/formly-wrapper-panel.component';
import { FormlyToggleComponent } from './components/formly-toggle/formly-toggle.component';
import { FormlyDurationComponent } from './components/formly-duration/formly-duration.component';
import { ItemsComponent } from './components/items/items.component';
import { ItemComponent } from './components/item/item.component';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { NestedTreeComponent } from './components/nested-tree/nested-tree.component';

import { TableViewComponent } from './components/table-view/table-view.component';

export function formlyValidationConfig(translate: TranslateService) {
  return {
    validationMessages: [
      {
        name: 'required',
        message() {
          return translate.stream('metadata.formly-field-required');
        }
      },
      {
        name: 'id',
        message() {
          return translate.stream('metadata.id-assigned');
        }
      }
    ]
  };
}

export function IdValidator(control: AbstractControl, field: FormlyFieldConfig): ValidationErrors | null {
  const key = 'assignedIds';
  const assignedIds: string[] = ((field.props && field.props[key]) || []);
  const error = assignedIds
    .includes(control.value as string);
  return error ? { id: true } : null;
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatDialogModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    TextFieldModule,
    MatTreeModule,
    FormlyModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatTableModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule,
    FormlyMatToggleModule,
    FormlyModule.forRoot({
      validators: [
        {
          name: 'id',
          validation: IdValidator,
          options: { ids: [] }
        }
      ],
      wrappers: [
        {
          name: 'panel',
          component: FormlyWrapperPanel
        }
      ],
      types: [
        {
          name: 'chips',
          wrappers: ['form-field'],
          component: FormlyChipsComponent,
          defaultOptions: {
            defaultValue: []
          }
        },
        {
          name: 'formlyToggle',
          wrappers: ['form-field'],
          component: FormlyToggleComponent,
          defaultOptions: {
            defaultValue: false
          }
        },
        {
          name: 'duration',
          component: FormlyDurationComponent
        }
      ]
    }),
    FormlyMaterialModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatTooltipModule,
    FormlyChipsComponent,
    FormlyWrapperPanel,
    FormlyToggleComponent,
    FormlyDurationComponent,
    ItemsComponent,
    ItemComponent,
    ProfileFormComponent,
    NestedTreeComponent,
    TableViewComponent
  ],
  providers: [
    {
      provide: FORMLY_CONFIG,
      multi: true,
      useFactory: formlyValidationConfig,
      deps: [TranslateService]
    }
  ],
  exports: [ProfileFormComponent, ItemsComponent]
})
export class MetadataModule {}
