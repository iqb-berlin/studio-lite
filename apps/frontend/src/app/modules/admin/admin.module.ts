import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatBadgeModule } from '@angular/material/badge';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IqbComponentsModule } from '@studio-lite-lib/iqb-components';
import { MatChipsModule } from '@angular/material/chips';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { AdminRoutingModule } from './admin-routing.module';
import { WorkspacesComponent } from './workspace-groups/workspaces.component';
import { UsersComponent } from './users/users.component';
import { AdminComponent } from './admin.component';
import { BackendService } from './services/backend.service';
import { VeronaModulesComponent } from './verona-modules/verona-modules.component';
import { VeronaModulesTableComponent } from './verona-modules/verona-modules-table.component';
import { SettingsComponent } from './settings/settings.component';
import { EditWorkspaceGroupComponent } from './workspace-groups/edit-workspace-group.component';
import { AppConfigComponent } from './settings/app-config.component';
import { AuthInterceptor } from '../../interceptors/auth.interceptor';
import { EditUserComponent } from './users/edituser.component';
import { AppLogoComponent } from './settings/app-logo.component';
import { UnitExportConfigComponent } from './settings/unit-export-config.component';
import { ResourcePackagesComponent } from './resource-packages/resource-packages.component';
import {
  ResourcePackagesTableComponent
} from './resource-packages/resource-packages-table/resource-packages-table.component';
import { TableDataSourcePipe } from './resource-packages/resource-packages-table/table-data-source.pipe';
import { SafeUrlPipe } from './resource-packages/resource-packages-table/safe-resource-html.pipe';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    IqbComponentsModule,
    MatTableModule,
    MatTabsModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSortModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatBadgeModule,
    FlexLayoutModule,
    MatChipsModule,
    FormsModule,
    TranslateModule,
    HttpClientModule
  ],
  exports: [AdminComponent],
  declarations: [
    WorkspacesComponent,
    UsersComponent,
    AdminComponent,
    EditWorkspaceGroupComponent,
    EditUserComponent,
    VeronaModulesComponent,
    VeronaModulesTableComponent,
    SettingsComponent,
    EditWorkspaceGroupComponent,
    AppConfigComponent,
    AppLogoComponent,
    UnitExportConfigComponent,
    ResourcePackagesComponent,
    ResourcePackagesTableComponent,
    TableDataSourcePipe,
    SafeUrlPipe
  ],
  providers: [
    BackendService,
    [
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      }
    ]
  ]
})
export class AdminModule {}
