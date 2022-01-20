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
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatBadgeModule } from '@angular/material/badge';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { IqbComponentsModule } from '@studio-lite/iqb-components';
import { MatChipsModule } from '@angular/material/chips';
import { SuperadminRoutingModule } from './superadmin-routing.module';
import { WorkspacesComponent } from './workspaces/workspaces.component';
import { UsersComponent } from './users/users.component';
import { SuperadminComponent } from './superadmin.component';
import { BackendService } from './backend.service';
import { NewuserComponent } from './users/newuser/newuser.component';
import { NewpasswordComponent } from './users/newpassword/newpassword.component';
import { EditworkspaceComponent } from './workspaces/editworkspace.component';
import { IqbFilesModule } from '../iqb-files';
import { SuperadminPasswordRequestComponent } from
  './superadmin-password-request/superadmin-password-request.component';
import { VeronaModulesComponent } from './verona-modules/verona-modules.component';
import { VeronaModulesTableComponent } from './verona-modules/verona-modules-table.component';
import { SettingsComponent } from './settings/settings.component';
import { WorkspaceGroupsComponent } from './settings/workspace-groups.component';
import { EditWorkspaceGroupComponent } from './settings/edit-workspace-group.component';
import { AppConfigComponent } from './settings/app-config.component';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {AuthInterceptor} from "./auth.interceptor";
import {EditUserComponent} from "./users/edituser.component";

@NgModule({
  imports: [
    CommonModule,
    SuperadminRoutingModule,
    IqbFilesModule,
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
    MatChipsModule
  ],
  exports: [
    SuperadminComponent
  ],
  declarations: [
    WorkspacesComponent,
    UsersComponent,
    SuperadminComponent,
    NewuserComponent,
    NewpasswordComponent,
    EditworkspaceComponent,
    EditUserComponent,
    SuperadminPasswordRequestComponent,
    VeronaModulesComponent,
    VeronaModulesTableComponent,
    SettingsComponent,
    WorkspaceGroupsComponent,
    EditWorkspaceGroupComponent,
    AppConfigComponent
  ],
  providers: [
    BackendService,
    [
      { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      }
    ]
  ],
  entryComponents: [
    NewuserComponent,
    NewpasswordComponent,
    EditUserComponent,
    EditworkspaceComponent,
    EditWorkspaceGroupComponent,
    SuperadminPasswordRequestComponent
  ]
})
export class SuperadminModule { }
