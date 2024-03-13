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
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SelectModuleComponent } from './components/select-module/select-module.component';
import { EditWorkspaceSettingsComponent } from './components/edit-workspace-settings/edit-workspace-settings.component';
import { InputTextComponent } from './components/input-text/input-text.component';
import { SearchFilterComponent } from './components/search-filter/search-filter.component';
import { PageNavigationComponent } from './components/page-navigation/page-navigation.component';
import { UnitPropertiesComponent } from './components/unit-properties/unit-properties.component';
import { WrappedIconComponent } from './components/wrapped-icon/wrapped-icon.component';
import { ProfilesComponent } from './components/profiles/profiles.component';
import { IncludePipe } from './pipes/include.pipe';
import { PrintOptionsComponent } from './components/print-options/print-options.component';
import { MetadataProfileEntriesComponent }
  from './components/metadata-profile-entries/metadata-profile-entries.component';
import { MetadataReadonlyItemsComponent } from './components/metadata-readonly-items/metadata-readonly-items.component';
import { IsActivePrintOption } from './pipes/isActivePrintOption.pipe';

@NgModule({
  declarations: [
    EditWorkspaceSettingsComponent,
    SelectModuleComponent,
    InputTextComponent,
    SearchFilterComponent,
    PageNavigationComponent,
    UnitPropertiesComponent,
    WrappedIconComponent,
    ProfilesComponent,
    PrintOptionsComponent,
    IncludePipe,
    MetadataProfileEntriesComponent,
    MetadataReadonlyItemsComponent,
    IsActivePrintOption
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
    MatIconModule,
    MatTooltipModule,
    TranslateModule,
    MatProgressSpinnerModule,
    MatExpansionModule
  ],
  exports: [
    EditWorkspaceSettingsComponent,
    SelectModuleComponent,
    InputTextComponent,
    SearchFilterComponent,
    PageNavigationComponent,
    UnitPropertiesComponent,
    WrappedIconComponent,
    ProfilesComponent,
    MatDialogModule,
    MatButtonModule,
    PrintOptionsComponent,
    IncludePipe,
    MetadataProfileEntriesComponent,
    MetadataReadonlyItemsComponent
  ]
})
export class SharedModule {}
