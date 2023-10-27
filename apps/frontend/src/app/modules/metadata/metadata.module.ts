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
import { PanelFieldWrapper } from './components/expansion-panel-wrapper/panel-wrapper.component';
import { FormlyToggleComponent } from './components/formly-toggle/formly-toggle.component';
import { ItemProfileComponent } from './components/item-profile/item-profile.component';
import { FormlyRepeatSectionComponent } from './components/formly-repeat-section/formly-repeat-section.component';

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
          component: PanelFieldWrapper
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
          name: 'repeat',
          component: FormlyRepeatSectionComponent
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
    PanelFieldWrapper,
    FormlyToggleComponent,
    ItemProfileComponent,
    FormlyRepeatSectionComponent
  ],
  exports: [MetadataComponent]
})
export class MetadataModule {}
