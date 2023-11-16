import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { FormlyModule } from '@ngx-formly/core';
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
import { NestedTreeNodeComponent } from './components/nested-tree-node/nested-tree-node.component';
import { NestedTreeComponent } from './components/nested-tree/nested-tree.component';
import { FormlyChipsComponent } from './components/formly-chips/formly-chips.component';
import { MetadataComponent } from './components/metadata/metadata.component';
import { FormlyWrapperPanel } from './components/formly-wrapper-panel/formly-wrapper-panel.component';
import { FormlyToggleComponent } from './components/formly-toggle/formly-toggle.component';
import { FormlyDurationComponent } from './components/formly-duration/formly-duration.component';
import { ItemsComponent } from './components/items/items.component';
import { ItemComponent } from './components/item/item.component';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';

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
      ],
      validationMessages: [
        {
          name: 'required',
          message: 'This field is required'
        }
      ]
    }),
    FormlyMaterialModule,
    MatProgressSpinnerModule,
    MatListModule
  ],
  declarations: [
    FormlyChipsComponent,
    NestedTreeNodeComponent,
    NestedTreeComponent,
    MetadataComponent,
    FormlyWrapperPanel,
    FormlyToggleComponent,
    FormlyDurationComponent,
    ItemsComponent,
    ItemComponent,
    ProfileFormComponent
  ],
  exports: [MetadataComponent]
})
export class MetadataModule {}
