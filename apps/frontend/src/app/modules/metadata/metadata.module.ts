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
import { NestedTreeNodeComponent } from './components/nested-tree-node/nested-tree-node.component';
import { NestedTreeComponent } from './components/nested-tree/nested-tree.component';
import { FormlyChipsComponent } from './components/formly-chips/formly-chips.component';
import { MetadataComponent } from './components/metadata/metadata.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatDialogModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    TextFieldModule,
    MatTreeModule,
    FormlyModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    FormlyModule.forRoot({
      types: [
        {
          name: 'chips',
          wrappers: ['form-field'],
          component: FormlyChipsComponent,
          defaultOptions: {
            defaultValue: []
          }
        }
      ],
      validationMessages: [
        { name: 'required', message: 'This field is required' }
      ]
    }),
    FormlyMaterialModule
  ],
  declarations: [
    FormlyChipsComponent,
    NestedTreeNodeComponent,
    NestedTreeComponent,
    MetadataComponent
  ],
  exports: [MetadataComponent]
})
export class MetadataModule {}
