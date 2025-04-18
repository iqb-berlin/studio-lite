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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IqbComponentsModule } from '@studio-lite-lib/iqb-components';
import { MatChipsModule } from '@angular/material/chips';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { AdminRoutingModule } from './admin-routing.module';
import { WorkspaceGroupsComponent } from './components/workspace-groups/workspace-groups.component';
import { UsersComponent } from './components/users/users.component';
import { AdminComponent } from './components/admin/admin.component';
import { BackendService } from './services/backend.service';
import { VeronaModulesComponent } from './components/verona-modules/verona-modules.component';
import { VeronaModulesTableComponent } from './components/verona-modules-table/verona-modules-table.component';
import { SettingsComponent } from './components/settings/settings.component';
import { EditWorkspaceGroupComponent } from './components/edit-workspace-group/edit-workspace-group.component';
import { AppConfigComponent } from './components/app-config/app-config.component';
import { AuthInterceptor } from '../../interceptors/auth.interceptor';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { AppLogoComponent } from './components/app-logo/app-logo.component';
import { UnitExportConfigComponent } from './components/unit-export-config/unit-export-config.component';
import { ResourcePackagesComponent } from './components/resource-packages/resource-packages.component';
import { ResourcePackagesTableComponent } from './components/resource-packages-table/resource-packages-table.component';
import { TableDataSourcePipe } from './pipes/table-data-source.pipe';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { ToTimePipe } from './pipes/to-time.pipe';
import { UsersMenuComponent } from './components/users-menu/users-menu.component';

import { WorkspaceGroupsMenuComponent } from './components/workspace-groups-menu/workspace-groups-menu.component';
import {
  EditWorkspaceGroupSettingsComponent
} from './components/edit-workspace-group-settings/edit-workspace-group-settings.component';

@NgModule({
  exports: [AdminComponent],
  imports: [CommonModule,
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
    MatChipsModule,
    FormsModule,
    TranslateModule,
    MatExpansionModule,
    WorkspaceGroupsComponent,
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
    SafeUrlPipe,
    ToTimePipe,
    UsersMenuComponent,
    WorkspaceGroupsMenuComponent,
    EditWorkspaceGroupSettingsComponent],
  providers: [
    BackendService,
    [
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      }
    ],
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AdminModule {}
