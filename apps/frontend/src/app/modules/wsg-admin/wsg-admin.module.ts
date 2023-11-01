import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DATE_LOCALE, MatOptionModule } from '@angular/material/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WsgAdminComponent } from './components/wsg-admin/wsg-admin.component';
import { UsersComponent } from './components/users/users.component';
import { WorkspacesComponent } from './components/workspaces/workspaces.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { BackendService } from './services/backend.service';
import { WsgAdminRoutingModule } from './wsg-admin-routing.module';
import { SharedModule } from '../shared/shared.module';
import { WorkspaceMenuComponent } from './components/workspace-menu/workspace-menu.component';
import { WorkspaceSettingsComponent } from './components/settings/settings.component';
import { ProfilesComponent } from './components/profiles/profiles.component';
import { StatesComponent } from './components/states/states.component';

@NgModule({
  declarations: [
    WorkspacesComponent,
    UsersComponent,
    WsgAdminComponent,
    WorkspaceMenuComponent,
    WorkspaceSettingsComponent,
    ProfilesComponent,
    StatesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatTooltipModule,
    MatButtonModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterModule,
    MatTabsModule,
    WsgAdminRoutingModule,
    TranslateModule,
    MatOptionModule,
    MatSelectModule,
    MatExpansionModule,
    MatProgressSpinnerModule
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
  ]
})
export class WsgAdminModule {}
