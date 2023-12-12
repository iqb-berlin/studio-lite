import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormlyModule, FORMLY_CONFIG } from '@ngx-formly/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { FormlyChipsComponent } from './components/formly-chips/formly-chips.component';
import { MetadataComponent } from './components/metadata/metadata.component';
import { FormlyWrapperPanel } from './components/formly-wrapper-panel/formly-wrapper-panel.component';
import { FormlyToggleComponent } from './components/formly-toggle/formly-toggle.component';
import { FormlyDurationComponent } from './components/formly-duration/formly-duration.component';
import { ItemsComponent } from './components/items/items.component';
import { ItemComponent } from './components/item/item.component';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { NestedTreeComponent } from './components/nested-tree/nested-tree.component';
import { SharedModule } from '../shared/shared.module';

export function formlyValidationConfig(translate: TranslateService) {
  return {
    validationMessages: [
      {
        name: 'required',
        message() {
          return translate.stream('metadata.formly-field-required');
        }
      }
    ]
  };
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
    MatIconModule,
    FormlyMatToggleModule,
    FormlyModule.forRoot({
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
    SharedModule,
    MatTooltipModule
  ],
  declarations: [
    FormlyChipsComponent,
    MetadataComponent,
    FormlyWrapperPanel,
    FormlyToggleComponent,
    FormlyDurationComponent,
    ItemsComponent,
    ItemComponent,
    ProfileFormComponent,
    NestedTreeComponent
  ],
  providers: [{
    provide: FORMLY_CONFIG, multi: true, useFactory: formlyValidationConfig, deps: [TranslateService]
  }],
  exports: [
    MetadataComponent,
    ProfileFormComponent,
    ItemsComponent
  ]
})
export class MetadataModule {
}
