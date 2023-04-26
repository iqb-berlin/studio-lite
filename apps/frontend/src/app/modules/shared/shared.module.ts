import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModuleComponent } from './components/select-module/select-module.component';
import { EditWorkspaceSettingsComponent } from './components/edit-workspace-settings/edit-workspace-settings.component';
import { InputTextComponent } from './components/input-text/input-text.component';

@NgModule({
  declarations: [
    EditWorkspaceSettingsComponent,
    SelectModuleComponent,
    InputTextComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    HttpClientModule,
    MatDialogModule,
    MatSelectModule,
    TranslateModule
  ],
  exports: [
    EditWorkspaceSettingsComponent,
    SelectModuleComponent,
    InputTextComponent
  ]
})
export class SharedModule {}
